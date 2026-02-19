// app/api/chat/route.ts
import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { validateChatInput } from '@/lib/governance/input-validator'
import { moderateContent } from '@/lib/governance/content-moderator'
import { checkRateLimit, RATE_LIMITS } from '@/lib/governance/rate-limiter'
import { checkBudget, trackCost } from '@/lib/governance/cost-tracker'
import { logLLMRequest, logAuditEvent, calculateCost } from '@/lib/governance/logger'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  dangerouslyAllowBrowser: process.env.NODE_ENV === 'test'
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = await createClient()

  try {

    // 2. Parse and validate input
    const body = await request.json()
    const validation = await validateChatInput(body)

    if (!validation.valid) {
      await logAuditEvent(
        session.user.id,
        'chat_validation_failed',
        'message',
        undefined,
        { errors: validation.errors },
        request
      )
      return Response.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { content, conversationId } = validation.sanitized

    // 3. Check rate limit
    const rateLimit = await checkRateLimit(
      session.user.id,
      RATE_LIMITS.chat.limit,
      RATE_LIMITS.chat.window
    )

    if (!rateLimit.allowed) {
      await logLLMRequest({
        userId: session.user.id,
        endpoint: '/api/chat',
        model: 'claude-sonnet-4-5-20250929',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        latencyMs: Date.now() - startTime,
        status: 'rate_limited'
      })

      return Response.json(
        { error: 'Rate limit exceeded', resetAt: rateLimit.resetAt },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.chat.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString()
          }
        }
      )
    }

    // 4. Check budget
    const budget = await checkBudget(session.user.id)
    if (!budget.withinBudget) {
      return Response.json(
        { error: 'Monthly budget exceeded', budget },
        { status: 402 }
      )
    }

    // 5. Moderate input content
    const inputModeration = await moderateContent(session.user.id, content, 'input')
    if (inputModeration.flagged) {
      await logAuditEvent(
        session.user.id,
        'content_moderation_blocked',
        'message',
        undefined,
        { categories: inputModeration.categories },
        request
      )
      return Response.json(
        { error: 'Content policy violation', categories: inputModeration.categories },
        { status: 400 }
      )
    }

    // 6. Get conversation history
    let messages: any[] = []
    if (conversationId) {
      const { data: history } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at')
        .limit(10) // Last 10 messages for context

      messages = history || []
    }

    // Add current user message
    messages.push({ role: 'user', content })

    // 7. Call Claude API
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages
    })

    const firstBlock = response.content[0]
    const assistantMessage = firstBlock.type === 'text' ? firstBlock.text : ''
    const latencyMs = Date.now() - startTime

    // 8. Moderate output content
    const outputModeration = await moderateContent(session.user.id, assistantMessage, 'output')
    if (outputModeration.flagged) {
      await logAuditEvent(
        session.user.id,
        'output_moderation_blocked',
        'message',
        undefined,
        { categories: outputModeration.categories },
        request
      )
      return Response.json(
        { error: 'Generated content policy violation' },
        { status: 500 }
      )
    }

    // 9. Save messages to conversation
    let actualConversationId = conversationId
    if (!actualConversationId) {
      // Create new conversation
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ user_id: session.user.id, title: content.substring(0, 50) })
        .select()
        .single()

      actualConversationId = newConv!.id
    }

    await supabase.from('messages').insert([
      {
        conversation_id: actualConversationId,
        role: 'user',
        content,
        tokens: response.usage.input_tokens
      },
      {
        conversation_id: actualConversationId,
        role: 'assistant',
        content: assistantMessage,
        tokens: response.usage.output_tokens
      }
    ])

    // 10. Log request and track cost
    const cost = calculateCost(
      'claude-sonnet-4-5-20250929',
      response.usage.input_tokens,
      response.usage.output_tokens
    )

    await logLLMRequest({
      userId: session.user.id,
      endpoint: '/api/chat',
      model: 'claude-sonnet-4-5-20250929',
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      cost,
      latencyMs,
      status: 'success'
    })

    await trackCost(session.user.id, cost)

    await logAuditEvent(
      session.user.id,
      'chat_message_sent',
      'conversation',
      actualConversationId,
      { messageLength: content.length, responseTokens: response.usage.output_tokens },
      request
    )

    // 11. Return response
    return Response.json({
      message: assistantMessage,
      conversationId: actualConversationId,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        cost
      },
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt
      },
      budget: {
        remaining: budget.remaining,
        monthlyBudget: budget.monthlyBudget
      }
    }, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMITS.chat.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString()
      }
    })

  } catch (error: any) {
    console.error('Chat API error:', error)

    const latencyMs = Date.now() - startTime

    if (session?.user?.id) {
      await logLLMRequest({
        userId: session.user.id,
        endpoint: '/api/chat',
        model: 'claude-sonnet-4-5-20250929',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        latencyMs,
        status: 'error',
        errorMessage: error.message
      })
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
