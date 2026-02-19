// lib/rag/embeddings.ts
import { VoyageAIClient } from 'voyageai'
import { env } from '@/src/lib/env'

const voyage = new VoyageAIClient({
  apiKey: env.VOYAGE_API_KEY || ''
})

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await voyage.embed({
    input: text,
    model: 'voyage-large-2' // 1536 dimensions, optimized for retrieval
  })

  if (!response.data || !response.data[0].embedding) {
    throw new Error('Failed to generate embedding')
  }

  return response.data[0].embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // Voyage AI supports batch processing (max 128 texts per request)
  const batchSize = 128
  const allEmbeddings: number[][] = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)

    const response = await voyage.embed({
      input: batch,
      model: 'voyage-large-2'
    })

    if (!response.data) {
      throw new Error('Failed to generate embeddings')
    }

    allEmbeddings.push(...response.data.map(d => {
      if (!d.embedding) throw new Error('Missing embedding in response')
      return d.embedding
    }))
  }

  return allEmbeddings
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimensions')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
