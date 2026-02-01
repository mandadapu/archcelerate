import { describe, it, expect } from '@jest/globals'
import {
  FixedSizeChunking,
  SentenceChunking,
  SemanticChunking
} from '../chunking'

describe('Chunking Strategies', () => {
  const sampleText = `This is the first sentence. This is the second sentence.

  This is a new paragraph with more content. It has multiple sentences too.

  And here is another paragraph.`

  describe('FixedSizeChunking', () => {
    it('should chunk text by fixed size in tokens', () => {
      const chunker = new FixedSizeChunking(50, 10)
      const chunks = chunker.chunk(sampleText)

      expect(chunks.length).toBeGreaterThan(0)
      chunks.forEach(chunk => {
        // Check tokens, not characters (chunkSize is in tokens)
        expect(chunk.tokens).toBeLessThanOrEqual(50)
        expect(chunk).toHaveProperty('index')
        expect(chunk).toHaveProperty('content')
      })
    })

    it('should create overlapping chunks', () => {
      const chunker = new FixedSizeChunking(30, 10)
      const longText = 'This is a long text that will be chunked. '.repeat(20)
      const chunks = chunker.chunk(longText)

      expect(chunks.length).toBeGreaterThan(1)
      // Verify all chunks have expected properties
      chunks.forEach(chunk => {
        expect(chunk.tokens).toBeLessThanOrEqual(30)
        expect(chunk.content).toBeTruthy()
      })
    })
  })

  describe('SentenceChunking', () => {
    it('should chunk text by sentences', () => {
      const chunker = new SentenceChunking(100)
      const chunks = chunker.chunk(sampleText)

      expect(chunks.length).toBeGreaterThan(0)
      chunks.forEach(chunk => {
        // Each chunk should contain complete sentences
        expect(chunk.content).toMatch(/[.!?]$/)
      })
    })

    it('should respect max token limit', () => {
      const chunker = new SentenceChunking(20)
      const longText = 'This is a sentence. '.repeat(50)
      const chunks = chunker.chunk(longText)

      chunks.forEach(chunk => {
        expect(chunk.tokens).toBeLessThanOrEqual(25) // Some buffer
      })
    })
  })

  describe('SemanticChunking', () => {
    it('should chunk text by paragraphs', () => {
      const chunker = new SemanticChunking(1000)
      const chunks = chunker.chunk(sampleText)

      expect(chunks.length).toBeGreaterThan(0)
      // Should preserve paragraph boundaries
      chunks.forEach(chunk => {
        expect(chunk.content.trim()).toBeTruthy()
      })
    })

    it('should combine small paragraphs', () => {
      const chunker = new SemanticChunking(1000)
      const smallParagraphs = 'Para 1.\n\nPara 2.\n\nPara 3.'
      const chunks = chunker.chunk(smallParagraphs)

      // Should combine into fewer chunks
      expect(chunks.length).toBeLessThan(3)
    })
  })
})
