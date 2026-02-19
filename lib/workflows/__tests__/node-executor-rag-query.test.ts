/**
 * @jest-environment node
 */

jest.mock('@/lib/rag/retrieval', () => ({
  hybridSearch: jest.fn(),
}))

import { hybridSearch } from '@/lib/rag/retrieval'
import { executeRAGQueryNode } from '../node-executors/rag-query'
import type { RAGQueryNodeData } from '../types'

const mockedHybridSearch = hybridSearch as jest.MockedFunction<typeof hybridSearch>

const config: RAGQueryNodeData = { label: 'RAG', queryTemplate: '{{input}}', topK: 5, minRelevance: 0.5 }

describe('executeRAGQueryNode', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns no documents when all below minRelevance', async () => {
    mockedHybridSearch.mockResolvedValue([
      { chunkId: 'c1', documentId: 'd1', content: 'low', relevanceScore: 0.3, metadata: {} },
    ])
    const result = await executeRAGQueryNode(config, 'query', 'user-1')
    expect(result.status).toBe('completed')
    expect(result.output).toBe('No relevant documents found.')
  })

  it('formats results above threshold', async () => {
    mockedHybridSearch.mockResolvedValue([
      { chunkId: 'c1', documentId: 'd1', content: 'Relevant content', relevanceScore: 0.9, metadata: {} },
    ])
    const result = await executeRAGQueryNode(config, 'query', 'user-1')
    expect(result.status).toBe('completed')
    expect(result.output).toContain('[1] (relevance: 0.90)')
    expect(result.output).toContain('Relevant content')
  })

  it('fails when hybridSearch throws', async () => {
    mockedHybridSearch.mockRejectedValue(new Error('Search failed'))
    const result = await executeRAGQueryNode(config, 'query', 'user-1')
    expect(result.status).toBe('failed')
    expect(result.errorMessage).toContain('Search failed')
  })

  it('interpolates {{input}} in queryTemplate', async () => {
    mockedHybridSearch.mockResolvedValue([])
    const customConfig = { ...config, queryTemplate: 'Find info about {{input}}' }
    await executeRAGQueryNode(customConfig, 'RAG systems', 'user-1')
    expect(mockedHybridSearch).toHaveBeenCalledWith('user-1', 'Find info about RAG systems', 5)
  })
})
