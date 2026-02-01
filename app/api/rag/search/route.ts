// app/api/rag/search/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hybridSearch } from '@/lib/rag/retrieval'
import { validateChatInput } from '@/lib/governance/input-validator'
import { checkRateLimit } from '@/lib/governance/rate-limiter'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    const body = await request.json()
    const validation = await validateChatInput(body)

    if (!validation.valid) {
      return Response.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { content: query } = validation.sanitized

    // Check rate limit (20 searches per minute)
    const rateLimit = await checkRateLimit(user.id, 20, 60)

    if (!rateLimit.allowed) {
      return Response.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
        },
        { status: 429 }
      )
    }

    // Perform hybrid search
    const startTime = Date.now()
    const results = await hybridSearch(user.id, query, 5)
    const latencyMs = Date.now() - startTime

    // Log query for analytics
    await supabase.from('rag_queries').insert({
      user_id: user.id,
      query,
      retrieved_chunks: results.map(r => ({
        chunkId: r.chunkId,
        relevance: r.relevanceScore
      })),
      chunks_used: results.length,
      avg_relevance_score: results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length,
      latency_ms: latencyMs
    })

    return Response.json({
      results,
      metadata: {
        totalResults: results.length,
        latencyMs,
        avgRelevance: results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length
      }
    })

  } catch (error: any) {
    console.error('RAG search error:', error)
    return Response.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    )
  }
}
