// lib/rag/chunking.ts
import { encoding_for_model } from 'tiktoken'

export interface Chunk {
  content: string
  index: number
  tokens: number
  metadata?: Record<string, any>
}

export interface ChunkingStrategy {
  name: string
  chunk(text: string): Chunk[]
}

// Strategy 1: Fixed-size chunking with overlap
export class FixedSizeChunking implements ChunkingStrategy {
  name = 'fixed-size'

  constructor(
    private chunkSize: number = 1000,
    private overlap: number = 200
  ) {}

  chunk(text: string): Chunk[] {
    const encoding = encoding_for_model('gpt-3.5-turbo')
    const tokens = encoding.encode(text)
    const chunks: Chunk[] = []

    for (let i = 0; i < tokens.length; i += this.chunkSize - this.overlap) {
      const chunkTokens = tokens.slice(i, i + this.chunkSize)
      const chunkText = new TextDecoder().decode(encoding.decode(chunkTokens))

      chunks.push({
        content: chunkText,
        index: chunks.length,
        tokens: chunkTokens.length
      })
    }

    encoding.free()
    return chunks
  }
}

// Strategy 2: Sentence-based chunking
export class SentenceChunking implements ChunkingStrategy {
  name = 'sentence'

  constructor(
    private maxTokens: number = 1000
  ) {}

  chunk(text: string): Chunk[] {
    const encoding = encoding_for_model('gpt-3.5-turbo')

    // Split into sentences (simple regex)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    const chunks: Chunk[] = []
    let currentChunk: string[] = []
    let currentTokens = 0

    for (const sentence of sentences) {
      const sentenceTokens = encoding.encode(sentence).length

      if (currentTokens + sentenceTokens > this.maxTokens && currentChunk.length > 0) {
        // Save current chunk
        const chunkText = currentChunk.join(' ')
        chunks.push({
          content: chunkText,
          index: chunks.length,
          tokens: encoding.encode(chunkText).length
        })
        currentChunk = []
        currentTokens = 0
      }

      currentChunk.push(sentence)
      currentTokens += sentenceTokens
    }

    // Add remaining chunk
    if (currentChunk.length > 0) {
      const chunkText = currentChunk.join(' ')
      chunks.push({
        content: chunkText,
        index: chunks.length,
        tokens: encoding.encode(chunkText).length
      })
    }

    encoding.free()
    return chunks
  }
}

// Strategy 3: Semantic chunking (paragraph-based)
export class SemanticChunking implements ChunkingStrategy {
  name = 'semantic'

  constructor(
    private maxTokens: number = 1000
  ) {}

  chunk(text: string): Chunk[] {
    const encoding = encoding_for_model('gpt-3.5-turbo')

    // Split into paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
    const chunks: Chunk[] = []
    let currentChunk: string[] = []
    let currentTokens = 0

    for (const paragraph of paragraphs) {
      const paragraphTokens = encoding.encode(paragraph).length

      if (currentTokens + paragraphTokens > this.maxTokens && currentChunk.length > 0) {
        // Save current chunk
        const chunkText = currentChunk.join('\n\n')
        chunks.push({
          content: chunkText,
          index: chunks.length,
          tokens: encoding.encode(chunkText).length
        })
        currentChunk = []
        currentTokens = 0
      }

      currentChunk.push(paragraph)
      currentTokens += paragraphTokens
    }

    // Add remaining chunk
    if (currentChunk.length > 0) {
      const chunkText = currentChunk.join('\n\n')
      chunks.push({
        content: chunkText,
        index: chunks.length,
        tokens: encoding.encode(chunkText).length
      })
    }

    encoding.free()
    return chunks
  }
}

export const CHUNKING_STRATEGIES = {
  'fixed-size': FixedSizeChunking,
  'sentence': SentenceChunking,
  'semantic': SemanticChunking
}
