/**
 * @jest-environment node
 */

jest.mock('@/lib/supabase/server', () => {
  const mockFrom = jest.fn()
  const mockSupabase = { from: mockFrom }
  ;(mockSupabase as any).__mockFrom = mockFrom
  return { createClient: jest.fn(() => Promise.resolve(mockSupabase)) }
})

import { createClient } from '@/lib/supabase/server'
import { formatCitations, trackCitations, getCitationsForQuery } from '../citations'
import type { Citation } from '../types'

describe('formatCitations (pure)', () => {
  it('returns empty string for empty array', () => {
    expect(formatCitations([])).toBe('')
  })

  it('formats single citation without page number', () => {
    const citations: Citation[] = [{
      chunkId: 'c1', documentId: 'd1', documentName: 'guide.pdf',
      content: 'text', relevanceScore: 0.9,
    }]
    const result = formatCitations(citations)
    expect(result).toContain('[1] guide.pdf')
    expect(result).not.toContain('page')
  })

  it('formats citation with page number', () => {
    const citations: Citation[] = [{
      chunkId: 'c1', documentId: 'd1', documentName: 'guide.pdf',
      pageNumber: 42, content: 'text', relevanceScore: 0.9,
    }]
    const result = formatCitations(citations)
    expect(result).toContain('[1] guide.pdf, page 42')
  })

  it('formats multiple citations as numbered list', () => {
    const citations: Citation[] = [
      { chunkId: 'c1', documentId: 'd1', documentName: 'a.pdf', content: 't', relevanceScore: 0.9 },
      { chunkId: 'c2', documentId: 'd2', documentName: 'b.pdf', pageNumber: 5, content: 't', relevanceScore: 0.8 },
    ]
    const result = formatCitations(citations)
    expect(result).toContain('[1] a.pdf')
    expect(result).toContain('[2] b.pdf, page 5')
    expect(result).toContain('Sources:')
  })
})

describe('trackCitations', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns early when fetch errors', async () => {
    const mockFrom = jest.fn()
    const mockSupabase = { from: mockFrom }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: null, error: { message: 'fetch error' } }),
      }),
    })

    // Should not throw
    await trackCitations('q1', [{ chunkId: 'c1', documentId: 'd1', relevanceScore: 0.9 }])
  })

  it('returns early when chunkData is empty', async () => {
    const mockFrom = jest.fn()
    const mockSupabase = { from: mockFrom }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    })

    await trackCitations('q1', [{ chunkId: 'c1', documentId: 'd1', relevanceScore: 0.9 }])
    // from should only be called once (for the select, not for insert)
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('inserts citations when chunkData found', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null })
    const mockFrom = jest.fn()
    const mockSupabase = { from: mockFrom }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    // First call: select from document_chunks
    // Second call: insert into rag_citations
    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [{ id: 'c1', document_id: 'd1', metadata: { page: 3 }, documents: { filename: 'doc.pdf' } }],
              error: null,
            }),
          }),
        }
      }
      return { insert: mockInsert }
    })

    await trackCitations('q1', [{ chunkId: 'c1', documentId: 'd1', relevanceScore: 0.9 }])
    expect(mockInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          query_id: 'q1',
          chunk_id: 'c1',
          page_number: 3,
          relevance_score: 0.9,
        }),
      ])
    )
  })
})

describe('getCitationsForQuery', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns empty array on error', async () => {
    const mockFrom = jest.fn()
    const mockSupabase = { from: mockFrom }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: { message: 'error' } }),
        }),
      }),
    })

    const result = await getCitationsForQuery('q1')
    expect(result).toEqual([])
  })

  it('maps data to Citation objects', async () => {
    const mockFrom = jest.fn()
    const mockSupabase = { from: mockFrom }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [{
              chunk_id: 'c1',
              document_id: 'd1',
              page_number: 5,
              relevance_score: 0.95,
              document_chunks: { content: 'chunk text' },
              documents: { filename: 'doc.pdf' },
            }],
            error: null,
          }),
        }),
      }),
    })

    const result = await getCitationsForQuery('q1')
    expect(result).toEqual([{
      chunkId: 'c1',
      documentId: 'd1',
      documentName: 'doc.pdf',
      pageNumber: 5,
      content: 'chunk text',
      relevanceScore: 0.95,
    }])
  })
})
