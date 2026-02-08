// lib/rag/retrieval.ts
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from './embeddings'

export interface SearchResult {
  chunkId: string
  documentId: string
  content: string
  relevanceScore: number
  metadata: Record<string, any>
}

export async function semanticSearch(
  userId: string,
  query: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<SearchResult[]> {
  const supabase = await createClient()

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query)

  // Perform vector similarity search
  const { data, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
    p_user_id: userId
  })

  if (error) throw error

  return data.map((row: any) => ({
    chunkId: row.id,
    documentId: row.document_id,
    content: row.content,
    relevanceScore: row.similarity,
    metadata: row.metadata
  }))
}

export async function hybridSearch(
  userId: string,
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const supabase = await createClient()

  // Get vector search results
  const vectorResults = await semanticSearch(userId, query, limit * 2, 0.5)

  // Get keyword search results (PostgreSQL full-text search)
  const { data: keywordResults } = await supabase
    .from('document_chunks')
    .select(`
      id,
      document_id,
      content,
      metadata,
      documents!inner(user_id)
    `)
    .textSearch('content', query, {
      type: 'websearch',
      config: 'english'
    })
    .eq('documents.user_id', userId)
    .limit(limit * 2)

  // Combine and re-rank results
  const combined = new Map<string, SearchResult>()

  vectorResults.forEach((result, index) => {
    combined.set(result.chunkId, {
      ...result,
      relevanceScore: result.relevanceScore * 0.7 + (1 - index / vectorResults.length) * 0.3
    })
  })

  keywordResults?.forEach((result, index) => {
    const existing = combined.get(result.id)
    if (existing) {
      // Boost score if appears in both results
      existing.relevanceScore += 0.2
    } else {
      combined.set(result.id, {
        chunkId: result.id,
        documentId: result.document_id,
        content: result.content,
        relevanceScore: (1 - index / keywordResults.length) * 0.5,
        metadata: result.metadata
      })
    }
  })

  // Sort by relevance and return top results
  return Array.from(combined.values())
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
}
