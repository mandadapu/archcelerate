// lib/rag/synthesis.ts
import Anthropic from '@anthropic-ai/sdk'
import { SearchResult } from './retrieval'
import { SynthesisResult, DocumentGroup } from './types'
import { RAG_CONFIG } from './constants'
import { parseJSONFromLLM, sanitizeForPrompt, getTokenUsage } from './utils'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function synthesizeFromMultipleSources(
  query: string,
  results: SearchResult[]
): Promise<SynthesisResult & { tokenUsage?: { input: number; output: number } }> {
  // Sanitize query to prevent prompt injection
  const sanitizedQuery = sanitizeForPrompt(query)

  // Group results by document
  const byDocument = results.reduce<DocumentGroup>((acc, result) => {
    if (!acc[result.documentId]) {
      acc[result.documentId] = []
    }
    acc[result.documentId].push(result)
    return acc
  }, {})

  // Build context from multiple documents
  let context = 'Information from multiple sources:\n\n'
  Object.entries(byDocument).forEach(([docId, chunks], index) => {
    context += `Source ${index + 1}:\n`
    chunks.forEach((chunk) => {
      context += `- ${chunk.content}\n`
    })
    context += '\n'
  })

  // Use Claude to synthesize answer
  const response = await client.messages.create({
    model: RAG_CONFIG.models.synthesis,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Based on the following information from multiple sources, answer this question: "${sanitizedQuery}"

${context}

Instructions:
1. Synthesize information from all sources
2. If sources contradict each other, acknowledge the contradiction
3. Cite which source(s) support each point using [Source N]
4. Rate your confidence in the answer (0.0 to 1.0)
5. Respond in JSON format:

{
  "answer": "your synthesized answer with [Source N] citations",
  "confidence": 0.8,
  "sources": ["Source 1", "Source 2"],
  "contradictions": ["optional: describe any contradictions found"]
}`,
      },
    ],
  })

  const resultText = response.content[0].type === 'text' ? response.content[0].text : ''

  // Get actual token usage
  const tokenUsage = getTokenUsage(response)

  // Parse JSON response with fallback
  const fallback: SynthesisResult = {
    answer: resultText,
    confidence: 0.5,
    sources: Object.keys(byDocument).map((_, i) => `Source ${i + 1}`),
  }

  const parsed = parseJSONFromLLM<SynthesisResult>(resultText, fallback)

  return {
    ...parsed,
    tokenUsage: {
      input: tokenUsage.promptTokens,
      output: tokenUsage.completionTokens,
    },
  }
}

export function detectContradictions(results: SearchResult[]): string[] {
  // Simple contradiction detection: look for negation words near similar concepts
  const contradictions: string[] = []

  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      const text1 = results[i].content.toLowerCase()
      const text2 = results[j].content.toLowerCase()

      // Check for negation patterns
      const hasNegation1 = /\b(not|no|never|cannot|isn't|aren't|doesn't)\b/.test(text1)
      const hasNegation2 = /\b(not|no|never|cannot|isn't|aren't|doesn't)\b/.test(text2)

      // If one has negation and they share key terms, possible contradiction
      if (hasNegation1 !== hasNegation2) {
        const words1 = new Set(text1.split(/\s+/).filter((w) => w.length > 4))
        const words2 = new Set(text2.split(/\s+/).filter((w) => w.length > 4))
        const commonWords = [...words1].filter((w) => words2.has(w))

        if (commonWords.length >= 3) {
          contradictions.push(
            `Potential contradiction between sources about: ${commonWords.slice(0, 3).join(', ')}`
          )
        }
      }
    }
  }

  return contradictions
}
