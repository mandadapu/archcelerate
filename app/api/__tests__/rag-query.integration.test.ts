import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import {
  createTestUser,
  createTestDocument,
  cleanupTestData,
  testDbClient
} from '@/lib/test-db'
import { cosineSimilarity } from '@/lib/rag/embeddings'

// Mock the queryWithMemory function to avoid external API calls
jest.mock('@/lib/rag/memory-integration', () => ({
  queryWithMemory: jest.fn().mockResolvedValue({
    answer: 'TypeScript is a typed superset of JavaScript.',
    sources: [
      {
        chunkId: 'chunk-1',
        documentId: 'doc-1',
        documentName: 'TypeScript Guide',
        content: 'TypeScript is a typed superset of JavaScript.',
        relevanceScore: 0.95
      }
    ],
    memoryContext: [],
    tokenUsage: {
      input: 100,
      output: 50
    }
  })
}))

describe('RAG Query Integration', () => {
  let userId: string
  let documentId: string

  beforeAll(async () => {
    const user = await createTestUser(`test-rag-${Date.now()}@example.com`)
    userId = user.id

    // Create document with chunks
    const doc = await createTestDocument(userId, {
      title: 'TypeScript Guide',
      content: 'TypeScript is a typed superset of JavaScript. It provides static typing, interfaces, and more.',
      processing_status: 'completed'
    })
    documentId = doc.id

    // Create chunks with embeddings
    const chunks = [
      {
        document_id: documentId,
        chunk_index: 0,
        content: 'TypeScript is a typed superset of JavaScript.',
        token_count: 8,
        embedding: JSON.stringify(new Array(1536).fill(0.1))
      },
      {
        document_id: documentId,
        chunk_index: 1,
        content: 'It provides static typing, interfaces, and more.',
        token_count: 7,
        embedding: JSON.stringify(new Array(1536).fill(0.2))
      },
      {
        document_id: documentId,
        chunk_index: 2,
        content: 'TypeScript compiles to plain JavaScript.',
        token_count: 5,
        embedding: JSON.stringify(new Array(1536).fill(0.15))
      }
    ]

    await testDbClient.from('document_chunks').insert(chunks)
  }, 30000)

  afterAll(async () => {
    await cleanupTestData(userId)
  }, 30000)

  it('should retrieve document chunks from database', async () => {
    const { data: chunks, error } = await testDbClient
      .from('document_chunks')
      .select('*')
      .eq('document_id', documentId)
      .order('chunk_index', { ascending: true })

    expect(error).toBeNull()
    expect(chunks).toBeTruthy()
    expect(chunks!.length).toBe(3)
    expect(chunks![0].content).toContain('TypeScript')
  })

  it('should calculate cosine similarity correctly', () => {
    const vec1 = new Array(1536).fill(0.1)
    const vec2 = new Array(1536).fill(0.1)

    const similarity = cosineSimilarity(vec1, vec2)
    expect(similarity).toBeCloseTo(1.0, 5)
  })

  it('should handle vector similarity search simulation', async () => {
    // Simulate finding similar chunks
    const { data: chunks } = await testDbClient
      .from('document_chunks')
      .select('*')
      .eq('document_id', documentId)

    expect(chunks).toBeTruthy()
    expect(chunks!.length).toBeGreaterThan(0)

    // In real RAG, we'd use pgvector to find similar embeddings
    // Here we just verify the data structure is correct
    chunks!.forEach(chunk => {
      expect(chunk).toHaveProperty('embedding')
      expect(chunk).toHaveProperty('content')
      expect(chunk).toHaveProperty('token_count')
      expect(chunk.token_count).toBeGreaterThan(0)
    })
  })

  it('should rank results by relevance', () => {
    const results = [
      { content: 'Result 1', relevanceScore: 0.9 },
      { content: 'Result 2', relevanceScore: 0.95 },
      { content: 'Result 3', relevanceScore: 0.85 }
    ]

    const sorted = results.sort((a, b) => b.relevanceScore - a.relevanceScore)

    expect(sorted[0].relevanceScore).toBe(0.95)
    expect(sorted[1].relevanceScore).toBe(0.9)
    expect(sorted[2].relevanceScore).toBe(0.85)
  })

  it('should handle queries with no results gracefully', async () => {
    // Query for non-existent content
    const { data: chunks } = await testDbClient
      .from('document_chunks')
      .select('*')
      .eq('document_id', 'non-existent-id')

    expect(chunks).toEqual([])
  })

  it('should track query history', async () => {
    // Create a RAG query record
    const { data: query, error } = await testDbClient
      .from('rag_queries')
      .insert({
        user_id: userId,
        query_text: 'What is TypeScript?',
        response_text: 'TypeScript is a typed superset of JavaScript.',
        source_count: 3,
        total_tokens: 150,
        response_time_ms: 500
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(query).toBeTruthy()
    expect(query!.query_text).toBe('What is TypeScript?')

    // Verify we can retrieve query history
    const { data: queries } = await testDbClient
      .from('rag_queries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    expect(queries).toBeTruthy()
    expect(queries!.length).toBeGreaterThan(0)
  })
}, 60000)
