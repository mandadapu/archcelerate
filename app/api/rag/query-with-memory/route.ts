// app/api/rag/query-with-memory/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { queryWithMemory } from '@/lib/rag/memory-integration'
import { trackCitations } from '@/lib/rag/citations'
import { validateChatInput } from '@/lib/governance/input-validator'
import { checkRateLimit, RATE_LIMITS } from '@/lib/governance/rate-limiter'
import { checkBudget, trackCost } from '@/lib/governance/cost-tracker'
import { logLLMRequest } from '@/lib/governance/logger'
import { createErrorResponse } from '@/lib/rag/utils'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const supabase = createClient()

  try {
    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 'auth')
    }

    // Validate input
    const body = await request.json()
    const validation = await validateChatInput(body)

    if (!validation.valid) {
      return createErrorResponse('Invalid input', 'validation', validation.errors)
    }

    const { content: query, conversationId } = validation.sanitized

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id, RATE_LIMITS.chat.limit, RATE_LIMITS.chat.window)
    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 'rate_limit')
    }

    // Check budget
    const budget = await checkBudget(user.id)
    if (!budget.withinBudget) {
      return createErrorResponse('Budget exceeded', 'budget')
    }

    // Query with memory
    const result = await queryWithMemory(user.id, query, conversationId)

    const avgRelevance =
      result.sources.length > 0
        ? result.sources.reduce((sum, s) => sum + s.relevanceScore, 0) / result.sources.length
        : 0

    // Log query (with transaction for atomicity)
    const { data: queryRecord, error: queryError } = await supabase
      .from('rag_queries')
      .insert({
        user_id: user.id,
        query,
        retrieved_chunks: result.sources.map((s) => ({
          chunkId: s.chunkId,
          relevance: s.relevanceScore,
        })),
        response: result.answer,
        chunks_used: result.sources.length,
        avg_relevance_score: avgRelevance,
        latency_ms: Date.now() - startTime,
      })
      .select()
      .single()

    if (queryError) {
      console.error('Failed to log query:', queryError)
      // Continue even if logging fails
    }

    // Track citations
    if (queryRecord && result.sources.length > 0) {
      await trackCitations(
        queryRecord.id,
        result.sources.map((s) => ({
          chunkId: s.chunkId,
          documentId: s.documentId,
          relevanceScore: s.relevanceScore,
        }))
      )
    }

    // Log LLM request and track cost
    const cost = result.tokenUsage?.cost ?? 0

    await logLLMRequest({
      userId: user.id,
      endpoint: '/api/rag/query-with-memory',
      model: 'claude-sonnet-4-5-20250929',
      promptTokens: result.tokenUsage?.input ?? 0,
      completionTokens: result.tokenUsage?.output ?? 0,
      totalTokens: (result.tokenUsage?.input ?? 0) + (result.tokenUsage?.output ?? 0),
      cost,
      latencyMs: Date.now() - startTime,
      status: 'success',
    })

    await trackCost(user.id, cost)

    return Response.json({
      answer: result.answer,
      sources: result.sources,
      hasMemoryContext: result.memoryContext.length > 0,
      conversationId: result.conversationId,
      metadata: {
        sourcesUsed: result.sources.length,
        avgRelevance,
        latencyMs: Date.now() - startTime,
        cost,
        tokenUsage: result.tokenUsage,
      },
    })
  } catch (error: unknown) {
    console.error('Memory-aware query error:', error)
    const message = error instanceof Error ? error.message : 'Query failed'
    return createErrorResponse(message, 'server')
  }
}
