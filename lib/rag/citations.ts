// lib/rag/citations.ts
import { createClient } from '@/lib/supabase/server'
import { Citation, CitationRecord } from './types'

export async function trackCitations(
  queryId: string,
  chunks: Array<{
    chunkId: string
    documentId: string
    relevanceScore: number
  }>
): Promise<void> {
  const supabase = createClient()

  try {
    // Get document metadata for chunks
    const chunkIds = chunks.map((c) => c.chunkId)
    const { data: chunkData, error: fetchError } = await supabase
      .from('document_chunks')
      .select(`
        id,
        document_id,
        metadata,
        documents (
          id,
          filename
        )
      `)
      .in('id', chunkIds)

    if (fetchError) {
      console.error('Failed to fetch chunk data:', fetchError)
      return
    }

    if (!chunkData || chunkData.length === 0) {
      console.warn('No chunk data found for citation tracking')
      return
    }

    // Insert citations
    const citations: Partial<CitationRecord>[] = chunks.map((chunk) => {
      const chunkInfo = chunkData.find((c) => c.id === chunk.chunkId)
      const pageNumber = chunkInfo?.metadata?.page ?? null

      return {
        query_id: queryId,
        chunk_id: chunk.chunkId,
        document_id: chunk.documentId,
        page_number: pageNumber,
        relevance_score: chunk.relevanceScore,
        used_in_response: true,
      }
    })

    const { error: insertError } = await supabase.from('rag_citations').insert(citations)

    if (insertError) {
      console.error('Failed to insert citations:', insertError)
    }
  } catch (error) {
    console.error('Citation tracking error:', error)
  }
}

export async function getCitationsForQuery(queryId: string): Promise<Citation[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('rag_citations')
    .select(`
      chunk_id,
      document_id,
      page_number,
      relevance_score,
      document_chunks!inner (
        content
      ),
      documents!inner (
        filename
      )
    `)
    .eq('query_id', queryId)
    .order('relevance_score', { ascending: false })

  if (error) {
    console.error('Failed to fetch citations:', error)
    return []
  }

  if (!data) return []

  return data.map((c) => ({
    chunkId: c.chunk_id,
    documentId: c.document_id,
    documentName: Array.isArray(c.documents) ? c.documents[0]?.filename : c.documents?.filename,
    pageNumber: c.page_number ?? undefined,
    content: Array.isArray(c.document_chunks) ? c.document_chunks[0]?.content : c.document_chunks?.content,
    relevanceScore: c.relevance_score,
  }))
}

export function formatCitations(citations: Citation[]): string {
  if (citations.length === 0) return ''

  let formatted = '\n\nSources:\n'
  citations.forEach((citation, index) => {
    const pageInfo = citation.pageNumber ? `, page ${citation.pageNumber}` : ''
    formatted += `[${index + 1}] ${citation.documentName}${pageInfo}\n`
  })

  return formatted
}
