import { StreamingTextResponse } from 'ai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt, conversationId } = await req.json()

    // Verify authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    // Rate limiting
    const limitResult = await rateLimit(
      `chat:${user.id}`,
      RATE_LIMITS.MENTOR_CHAT
    )

    if (!limitResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          reset: limitResult.reset,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Create streaming response
    const stream = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
      stream: true,
    })

    // Convert Anthropic stream to web standard stream
    const encoder = new TextEncoder()
    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text
              fullResponse += text
              controller.enqueue(encoder.encode(text))
            }
          }

          // Save conversation to database after streaming completes
          if (conversationId) {
            await saveConversation(user.id, conversationId, messages, fullResponse)
          }

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new StreamingTextResponse(readableStream)
  } catch (error) {
    console.error('Stream error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

async function saveConversation(
  userId: string,
  conversationId: string,
  userMessages: any[],
  assistantResponse: string
) {
  // Get existing conversation
  const existing = await prisma.mentorConversation.findUnique({
    where: { id: conversationId },
  })

  const allMessages = [
    ...(existing?.messages as any[] || []),
    ...userMessages.map((m: any) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date().toISOString(),
    })),
    {
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date().toISOString(),
    },
  ]

  // Generate title from first user message if new conversation
  let title = existing?.title
  if (!title && userMessages.length > 0) {
    const firstMessage = userMessages.find((m: any) => m.role === 'user')
    if (firstMessage) {
      title = firstMessage.content.slice(0, 60)
      if (firstMessage.content.length > 60) title += '...'
    }
  }

  // Upsert conversation
  await prisma.mentorConversation.upsert({
    where: { id: conversationId },
    create: {
      id: conversationId,
      userId,
      messages: allMessages as any,
      title,
    },
    update: {
      messages: allMessages as any,
      title,
    },
  })

  // Log event for new conversations
  if (!existing) {
    await prisma.learningEvent.create({
      data: {
        userId,
        eventType: 'mentor.conversation_started',
        eventData: { conversation_id: conversationId } as any,
      },
    })
  }
}
