// lib/workflows/node-executors/web-search.ts
import { WebSearchNodeData, NodeExecutionResult } from '../types'
import { interpolateTemplate } from '../graph-utils'

export async function executeWebSearchNode(
  config: WebSearchNodeData,
  input: string
): Promise<NodeExecutionResult> {
  const start = Date.now()

  const query = interpolateTemplate(config.queryTemplate, input)
  const apiKey = process.env.TAVILY_API_KEY

  if (!apiKey) {
    return {
      output: '',
      tokensUsed: 0,
      cost: 0,
      latencyMs: Date.now() - start,
      status: 'failed',
      errorMessage: 'TAVILY_API_KEY not configured',
    }
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        max_results: config.maxResults,
      }),
    })

    if (!response.ok) {
      return {
        output: '',
        tokensUsed: 0,
        cost: 0,
        latencyMs: Date.now() - start,
        status: 'failed',
        errorMessage: `Search API returned ${response.status}`,
      }
    }

    const data = await response.json()
    const results = data.results || []

    if (results.length === 0) {
      return {
        output: 'No search results found.',
        tokensUsed: 0,
        cost: 0,
        latencyMs: Date.now() - start,
        status: 'completed',
        metadata: { query, totalResults: 0 },
      }
    }

    const output = results
      .map(
        (r: { title: string; url: string; content: string }, i: number) =>
          `[${i + 1}] ${r.title}\n${r.url}\n${r.content}`
      )
      .join('\n\n---\n\n')

    return {
      output,
      tokensUsed: 0,
      cost: 0,
      latencyMs: Date.now() - start,
      status: 'completed',
      metadata: { query, totalResults: results.length },
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
