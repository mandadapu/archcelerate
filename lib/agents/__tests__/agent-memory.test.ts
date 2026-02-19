/**
 * @jest-environment node
 */

// Mock embeddings
jest.mock('@/lib/rag/embeddings', () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}))

// Mock @upstash/redis (agent-memory.ts uses Upstash, not ioredis singleton)
jest.mock('@upstash/redis', () => {
  const mockGet = jest.fn()
  const mockSet = jest.fn()
  const mockDel = jest.fn()
  const mockInstance = { get: mockGet, set: mockSet, del: mockDel }
  const MockRedis = jest.fn(() => mockInstance)
  ;(MockRedis as any).__mockInstance = mockInstance
  return { Redis: MockRedis }
})

// Mock Supabase
jest.mock('@/lib/supabase/server', () => {
  const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null })
  const mockSelect = jest.fn(() => ({
    eq: jest.fn().mockResolvedValue({ data: [], error: null }),
  }))
  const mockIn = jest.fn().mockResolvedValue({ data: null, error: null })
  const mockUpdate = jest.fn(() => ({ in: mockIn }))
  const mockRpc = jest.fn()
  const mockFrom = jest.fn(() => ({
    insert: mockInsert,
    select: mockSelect,
    update: mockUpdate,
  }))

  const client = { from: mockFrom, rpc: mockRpc }
  ;(client as any).__mocks = { mockFrom, mockInsert, mockSelect, mockRpc, mockUpdate, mockIn }
  return {
    createClient: jest.fn().mockResolvedValue(client),
  }
})

import { Redis } from '@upstash/redis'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/rag/embeddings'
import { AgentMemory } from '../agent-memory'

const redisMocks = (Redis as any).__mockInstance as {
  get: jest.Mock
  set: jest.Mock
  del: jest.Mock
}

async function getSupaMocks() {
  const client = await (createClient as jest.Mock)()
  return (client as any).__mocks as {
    mockFrom: jest.Mock
    mockInsert: jest.Mock
    mockSelect: jest.Mock
    mockRpc: jest.Mock
    mockUpdate: jest.Mock
    mockIn: jest.Mock
  }
}

describe('AgentMemory', () => {
  let memory: AgentMemory

  beforeEach(() => {
    jest.clearAllMocks()
    memory = new AgentMemory('user-1', 'agent-def-1')
  })

  describe('storeShortTermMemory', () => {
    it('inserts context entries into short term memory table', async () => {
      const { mockFrom, mockInsert } = await getSupaMocks()

      await memory.storeShortTermMemory('exec-1', { key1: 'val1', key2: 42 })

      expect(mockFrom).toHaveBeenCalledWith('agent_short_term_memory')
      expect(mockInsert).toHaveBeenCalledWith([
        { execution_id: 'exec-1', key: 'key1', value: '"val1"' },
        { execution_id: 'exec-1', key: 'key2', value: '42' },
      ])
    })
  })

  describe('getShortTermMemory', () => {
    it('fetches and parses stored key-value pairs', async () => {
      const { mockSelect } = await getSupaMocks()
      mockSelect.mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [
            { key: 'name', value: '"Alice"' },
            { key: 'count', value: '5' },
          ],
          error: null,
        }),
      })

      const result = await memory.getShortTermMemory('exec-1')

      expect(result).toEqual({ name: 'Alice', count: 5 })
    })

    it('throws on Supabase error', async () => {
      const { mockSelect } = await getSupaMocks()
      mockSelect.mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'DB error' },
        }),
      })

      await expect(memory.getShortTermMemory('exec-1')).rejects.toEqual({ message: 'DB error' })
    })
  })

  describe('consolidateToLongTerm', () => {
    it('generates embedding and inserts long-term memory', async () => {
      const { mockFrom, mockInsert } = await getSupaMocks()

      await memory.consolidateToLongTerm('exec-1', 'Summary text', 0.8, { source: 'test' })

      expect(generateEmbedding).toHaveBeenCalledWith('Summary text')
      expect(mockFrom).toHaveBeenCalledWith('agent_long_term_memory')
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-1',
        agent_definition_id: 'agent-def-1',
        summary: 'Summary text',
        embedding: JSON.stringify([0.1, 0.2, 0.3]),
        importance_score: 0.8,
        metadata: { source: 'test' },
      })
    })
  })

  describe('retrieveLongTermMemory', () => {
    it('calls RPC and maps results', async () => {
      const { mockRpc } = await getSupaMocks()
      mockRpc.mockResolvedValue({
        data: [
          { id: 'mem-1', summary: 'Past interaction', similarity: 0.85, metadata: {} },
        ],
        error: null,
      })

      const results = await memory.retrieveLongTermMemory('query', 3)

      expect(mockRpc).toHaveBeenCalledWith('match_agent_long_term_memory', {
        query_embedding: JSON.stringify([0.1, 0.2, 0.3]),
        match_threshold: 0.7,
        match_count: 3,
        p_user_id: 'user-1',
        p_agent_id: 'agent-def-1',
      })
      expect(results).toEqual([
        { summary: 'Past interaction', relevanceScore: 0.85, metadata: {} },
      ])
    })

    it('throws on RPC error', async () => {
      const { mockRpc } = await getSupaMocks()
      mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } })

      await expect(memory.retrieveLongTermMemory('query')).rejects.toEqual({ message: 'RPC failed' })
    })
  })

  describe('working memory (Redis)', () => {
    it('getWorkingMemory returns parsed data from Redis', async () => {
      redisMocks.get.mockResolvedValue(JSON.stringify({ step: 3, data: 'foo' }))

      const result = await memory.getWorkingMemory('exec-1')

      expect(result).toEqual({ step: 3, data: 'foo' })
    })

    it('getWorkingMemory returns empty object when no data', async () => {
      redisMocks.get.mockResolvedValue(null)

      const result = await memory.getWorkingMemory('exec-1')

      expect(result).toEqual({})
    })

    it('updateWorkingMemory merges with existing data', async () => {
      redisMocks.get.mockResolvedValue(JSON.stringify({ existing: 'data' }))
      redisMocks.set.mockResolvedValue('OK')

      await memory.updateWorkingMemory('exec-1', { newKey: 'newVal' })

      expect(redisMocks.set).toHaveBeenCalledWith(
        'agent:working:exec-1',
        JSON.stringify({ existing: 'data', newKey: 'newVal' }),
        { ex: 3600 }
      )
    })

    it('clearWorkingMemory deletes the Redis key', async () => {
      redisMocks.del.mockResolvedValue(1)

      await memory.clearWorkingMemory('exec-1')

      expect(redisMocks.del).toHaveBeenCalledWith('agent:working:exec-1')
    })
  })

  describe('pruneMemories', () => {
    it('calls RPC to prune old memories', async () => {
      const { mockRpc } = await getSupaMocks()
      mockRpc.mockResolvedValue({ data: 5, error: null })

      const pruned = await memory.pruneMemories(500)

      expect(mockRpc).toHaveBeenCalledWith('prune_agent_long_term_memory', {
        p_user_id: 'user-1',
        p_agent_id: 'agent-def-1',
        max_memories: 500,
      })
      expect(pruned).toBe(5)
    })
  })
})
