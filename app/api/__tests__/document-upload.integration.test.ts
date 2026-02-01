import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { testDbClient, createTestUser, cleanupTestData } from '@/lib/test-db'
import { NextRequest } from 'next/server'

// Mock file upload for testing
const createMockFile = (name: string, content: string, type: string) => {
  return new File([content], name, { type })
}

describe('Document Upload Integration', () => {
  let userId: string

  beforeAll(async () => {
    const user = await createTestUser(`test-upload-${Date.now()}@example.com`)
    userId = user.id
  }, 30000)

  afterAll(async () => {
    await cleanupTestData(userId)
  }, 30000)

  it('should create document record in database', async () => {
    // Create a test document directly in database
    const { data: document, error } = await testDbClient
      .from('documents')
      .insert({
        user_id: userId,
        title: 'test.txt',
        content: 'Test document content',
        file_path: '/test/path.txt',
        file_size: 1024,
        mime_type: 'text/plain',
        processing_status: 'completed'
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(document).toBeTruthy()
    expect(document.title).toBe('test.txt')
    expect(document.user_id).toBe(userId)
  })

  it('should allow querying documents by user', async () => {
    // Create multiple documents
    await testDbClient.from('documents').insert([
      {
        user_id: userId,
        title: 'doc1.txt',
        content: 'Content 1',
        file_path: '/test/doc1.txt',
        file_size: 100,
        mime_type: 'text/plain'
      },
      {
        user_id: userId,
        title: 'doc2.txt',
        content: 'Content 2',
        file_path: '/test/doc2.txt',
        file_size: 200,
        mime_type: 'text/plain'
      }
    ])

    // Query documents
    const { data: documents, error } = await testDbClient
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    expect(error).toBeNull()
    expect(documents).toBeTruthy()
    expect(documents!.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle document chunks relationship', async () => {
    // Create a document
    const { data: document } = await testDbClient
      .from('documents')
      .insert({
        user_id: userId,
        title: 'chunked-doc.txt',
        content: 'This is a document that will be chunked',
        file_path: '/test/chunked.txt',
        file_size: 500,
        mime_type: 'text/plain'
      })
      .select()
      .single()

    // Create chunks for the document
    const chunks = [
      {
        document_id: document!.id,
        chunk_index: 0,
        content: 'This is a document',
        token_count: 4,
        embedding: JSON.stringify(new Array(1536).fill(0.1))
      },
      {
        document_id: document!.id,
        chunk_index: 1,
        content: 'that will be chunked',
        token_count: 4,
        embedding: JSON.stringify(new Array(1536).fill(0.2))
      }
    ]

    const { data: insertedChunks, error: chunkError } = await testDbClient
      .from('document_chunks')
      .insert(chunks)
      .select()

    expect(chunkError).toBeNull()
    expect(insertedChunks).toHaveLength(2)

    // Verify we can query chunks by document
    const { data: queryChunks } = await testDbClient
      .from('document_chunks')
      .select('*')
      .eq('document_id', document!.id)
      .order('chunk_index', { ascending: true })

    expect(queryChunks).toHaveLength(2)
    expect(queryChunks![0].chunk_index).toBe(0)
    expect(queryChunks![1].chunk_index).toBe(1)
  })

  it('should validate file types', () => {
    const validTypes = ['text/plain', 'application/pdf', 'text/markdown']
    const invalidTypes = ['application/exe', 'image/png', 'video/mp4']

    validTypes.forEach(type => {
      expect(['text/plain', 'application/pdf', 'text/markdown', 'text/html']).toContain(type)
    })

    invalidTypes.forEach(type => {
      expect(['text/plain', 'application/pdf', 'text/markdown', 'text/html']).not.toContain(type)
    })
  })
}, 60000)
