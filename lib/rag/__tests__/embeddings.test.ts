import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Use manual mock from __mocks__/voyageai.ts
jest.mock('voyageai')

import { mockEmbed } from '__mocks__/voyageai'
import { generateEmbedding, generateEmbeddings, cosineSimilarity } from '../embeddings'

describe('Embeddings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockEmbed.mockResolvedValue({
      data: [
        { embedding: new Array(1536).fill(0.1) }
      ]
    })
  })

  describe('generateEmbedding', () => {
    it('should generate embedding for single text', async () => {
      const embedding = await generateEmbedding('Test text')

      expect(embedding).toHaveLength(1536)
      expect(embedding.every(n => typeof n === 'number')).toBe(true)
      expect(mockEmbed).toHaveBeenCalledWith({
        input: 'Test text',
        model: 'voyage-large-2'
      })
    })

    it('should handle missing embedding data', async () => {
      mockEmbed.mockResolvedValue({ data: null })

      await expect(generateEmbedding('Test')).rejects.toThrow('Failed to generate embedding')
    })
  })

  describe('generateEmbeddings', () => {
    it('should generate embeddings for multiple texts', async () => {
      mockEmbed.mockResolvedValue({
        data: [
          { embedding: new Array(1536).fill(0.1) },
          { embedding: new Array(1536).fill(0.2) },
          { embedding: new Array(1536).fill(0.3) }
        ]
      })

      const texts = ['Text 1', 'Text 2', 'Text 3']
      const embeddings = await generateEmbeddings(texts)

      expect(embeddings).toHaveLength(3)
      embeddings.forEach(embedding => {
        expect(embedding).toHaveLength(1536)
      })
    })

    it('should batch large requests', async () => {
      const texts = new Array(200).fill('test')
      await generateEmbeddings(texts)

      // Should be called twice (128 + 72)
      expect(mockEmbed).toHaveBeenCalledTimes(2)
    })
  })

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      const a = [1, 0, 0]
      const b = [1, 0, 0]
      expect(cosineSimilarity(a, b)).toBe(1)
    })

    it('should handle perpendicular vectors', () => {
      const a = [1, 0, 0]
      const b = [0, 1, 0]
      expect(cosineSimilarity(a, b)).toBe(0)
    })

    it('should throw error for mismatched dimensions', () => {
      const a = [1, 0]
      const b = [1, 0, 0]
      expect(() => cosineSimilarity(a, b)).toThrow('Vectors must have same dimensions')
    })
  })
})
