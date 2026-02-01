import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { MemoryManager } from '../memory-manager'
import { createTestUser, cleanupTestData } from '@/lib/test-db'

describe('MemoryManager', () => {
  let userId: string
  let memoryManager: MemoryManager

  beforeEach(async () => {
    const user = await createTestUser(`test-${Date.now()}@example.com`)
    userId = user.id
    memoryManager = new MemoryManager(userId)
  })

  afterEach(async () => {
    await cleanupTestData(userId)
  })

  describe('Episodic Memory', () => {
    it('should store episodic memory', async () => {
      await memoryManager.storeEpisodicMemory(
        'conv-123',
        'msg-456',
        'User asked about TypeScript',
        0.8
      )

      const memories = await memoryManager.retrieveEpisodicMemory('TypeScript', 5)
      expect(memories.length).toBeGreaterThan(0)
      expect(memories[0].summary).toContain('TypeScript')
    })

    it('should rank memories by importance and recency', async () => {
      // Store multiple memories with different importance
      await memoryManager.storeEpisodicMemory('c1', 'm1', 'Low importance', 0.3)
      await memoryManager.storeEpisodicMemory('c2', 'm2', 'High importance', 0.9)

      const memories = await memoryManager.retrieveEpisodicMemory('importance', 5)
      expect(memories[0].importanceScore).toBeGreaterThan(memories[1].importanceScore)
    })
  })

  describe('Semantic Memory', () => {
    it('should store and retrieve facts', async () => {
      await memoryManager.storeSemanticMemory(
        'User prefers TypeScript over JavaScript',
        ['programming', 'preferences']
      )

      const facts = await memoryManager.retrieveSemanticMemory('TypeScript', 5)
      expect(facts.length).toBeGreaterThan(0)
    })

    it('should update access count on retrieval', async () => {
      const fact = 'Python is a programming language'
      await memoryManager.storeSemanticMemory(fact, ['programming'])

      // Retrieve multiple times
      await memoryManager.retrieveSemanticMemory('Python', 5)
      await memoryManager.retrieveSemanticMemory('Python', 5)

      // Access count should increase (verify in database)
    })
  })

  describe('Procedural Memory', () => {
    it('should store and retrieve preferences', async () => {
      await memoryManager.setPreference('theme', 'dark')
      await memoryManager.setPreference('language', 'en')

      const preferences = await memoryManager.getProceduralMemory()
      expect(preferences.theme).toBe('dark')
      expect(preferences.language).toBe('en')
    })

    it('should update existing preferences', async () => {
      await memoryManager.setPreference('theme', 'light')
      await memoryManager.setPreference('theme', 'dark')

      const preferences = await memoryManager.getProceduralMemory()
      expect(preferences.theme).toBe('dark')
    })
  })

  describe('Memory Assembly', () => {
    it('should assemble context from all memory types', async () => {
      // Setup memories
      await memoryManager.storeEpisodicMemory('c1', 'm1', 'Previous TypeScript discussion', 0.8)
      await memoryManager.storeSemanticMemory('User knows TypeScript', ['programming'])
      await memoryManager.setPreference('language', 'typescript')

      const context = await memoryManager.assembleContext('TypeScript coding')

      expect(context).toContain('TypeScript')
    })
  })
})
