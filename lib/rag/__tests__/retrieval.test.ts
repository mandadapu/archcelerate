/**
 * @jest-environment node
 */

// Mock embeddings
jest.mock('../embeddings', () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}))

// Mock Supabase
jest.mock('@/lib/supabase/server', () => {
  const mockRpc = jest.fn()
  const mockLimit = jest.fn()
  const mockEq = jest.fn(() => ({ limit: mockLimit }))
  const mockTextSearch = jest.fn(() => ({ eq: mockEq }))
  const mockSelect = jest.fn(() => ({ textSearch: mockTextSearch }))
  const mockFrom = jest.fn(() => ({ select: mockSelect }))

  const client = { rpc: mockRpc, from: mockFrom }
  ;(client as any).__mocks = { mockRpc, mockFrom, mockSelect, mockTextSearch, mockEq, mockLimit }
  return {
    createClient: jest.fn().mockResolvedValue(client),
  }
})

import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '../embeddings'
import { semanticSearch, hybridSearch } from '../retrieval'

async function getMocks() {
  const client = await (createClient as jest.Mock)()
  return (client as any).__mocks as {
    mockRpc: jest.Mock
    mockFrom: jest.Mock
    mockLimit: jest.Mock
  }
}

describe('semanticSearch', () => {
  beforeEach(() => jest.clearAllMocks())

  it('generates embedding and calls RPC with correct params', async () => {
    const { mockRpc } = await getMocks()
    mockRpc.mockResolvedValue({ data: [], error: null })

    await semanticSearch('user-1', 'test query', 5, 0.7)

    expect(generateEmbedding).toHaveBeenCalledWith('test query')
    expect(mockRpc).toHaveBeenCalledWith('match_document_chunks', {
      query_embedding: [0.1, 0.2, 0.3],
      match_threshold: 0.7,
      match_count: 5,
      p_user_id: 'user-1',
    })
  })

  it('maps RPC results to SearchResult format', async () => {
    const { mockRpc } = await getMocks()
    mockRpc.mockResolvedValue({
      data: [
        { id: 'chunk-1', document_id: 'doc-1', content: 'hello', similarity: 0.9, metadata: { page: 1 } },
        { id: 'chunk-2', document_id: 'doc-2', content: 'world', similarity: 0.8, metadata: {} },
      ],
      error: null,
    })

    const results = await semanticSearch('user-1', 'query')

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({
      chunkId: 'chunk-1',
      documentId: 'doc-1',
      content: 'hello',
      relevanceScore: 0.9,
      metadata: { page: 1 },
    })
  })

  it('throws on RPC error', async () => {
    const { mockRpc } = await getMocks()
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } })

    await expect(semanticSearch('user-1', 'query')).rejects.toEqual({ message: 'RPC failed' })
  })
})

describe('hybridSearch', () => {
  beforeEach(() => jest.clearAllMocks())

  it('combines vector and keyword results', async () => {
    const { mockRpc, mockLimit } = await getMocks()
    // Vector results via RPC
    mockRpc.mockResolvedValue({
      data: [
        { id: 'chunk-1', document_id: 'doc-1', content: 'vector result', similarity: 0.9, metadata: {} },
      ],
      error: null,
    })
    // Keyword results
    mockLimit.mockResolvedValue({
      data: [
        { id: 'chunk-2', document_id: 'doc-2', content: 'keyword result', metadata: {} },
      ],
    })

    const results = await hybridSearch('user-1', 'test query', 5)

    expect(results.length).toBeGreaterThanOrEqual(1)
    // Results should be sorted by relevance (descending)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].relevanceScore).toBeGreaterThanOrEqual(results[i].relevanceScore)
    }
  })

  it('boosts score when result appears in both vector and keyword results', async () => {
    const { mockRpc, mockLimit } = await getMocks()
    // Same chunk appears in both
    mockRpc.mockResolvedValue({
      data: [
        { id: 'chunk-1', document_id: 'doc-1', content: 'shared result', similarity: 0.8, metadata: {} },
      ],
      error: null,
    })
    mockLimit.mockResolvedValue({
      data: [
        { id: 'chunk-1', document_id: 'doc-1', content: 'shared result', metadata: {} },
      ],
    })

    const results = await hybridSearch('user-1', 'query', 5)

    // The overlapping result should have boosted score (original + 0.2)
    const shared = results.find(r => r.chunkId === 'chunk-1')
    expect(shared).toBeDefined()
    expect(shared!.relevanceScore).toBeGreaterThan(0.8)
  })
})
