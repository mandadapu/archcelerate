// lib/workflows/node-executors/rag-query.ts
import { RAGQueryNodeData, NodeExecutionResult } from '../types'
import { interpolateTemplate } from '../graph-utils'
import { hybridSearch } from '@/lib/rag/retrieval'

export async function executeRAGQueryNode(
  config: RAGQueryNodeData,
  input: string,
  userId: string
): Promise<NodeExecutionResult> {
  const start = Date.now()

  const query = interpolateTemplate(config.queryTemplate, input)

  try {
    const results = await hybridSearch(userId, query, config.topK)

    // Filter by minimum relevance
    const filtered = results.filter((r) => r.relevanceScore >= config.minRelevance)

    if (filtered.length === 0) {
      return {
        output: 'No relevant documents found.',
        tokensUsed: 0,
        cost: 0,
        latencyMs: Date.now() - start,
        status: 'completed',
        metadata: { totalResults: 0, query },
      }
    }

    const output = filtered
      .map((r, i) => `[${i + 1}] (relevance: ${r.relevanceScore.toFixed(2)})\n${r.content}`)
      .join('\n\n---\n\n')

    return {
      output,
      tokensUsed: 0,
      cost: 0,
      latencyMs: Date.now() - start,
      status: 'completed',
      metadata: { totalResults: filtered.length, query },
    }
  } catch (error) {
    return {
      output: '',
      tokensUsed: 0,
      cost: 0,
      latencyMs: Date.now() - start,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : String(error),
    }
  }
}
