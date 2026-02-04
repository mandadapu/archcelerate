// lib/rag/memory-integration.ts
import { hybridSearch, SearchResult } from './retrieval'
import { MemoryManager } from '@/lib/memory/memory-manager'
import { synthesizeFromMultipleSources } from './synthesis'
import Anthropic from '@anthropic-ai/sdk'
import {
  MemoryAwareResponse,
  MemoryContext,
  EpisodicMemory,
  SemanticMemory
} from './types'
import { RAG_CONFIG } from './constants'
import { sanitizeForPrompt, getTokenUsage } from './utils'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
})

export async function queryWithMemory(
  userId: string,
  query: string,
  conversationId?: string
): Promise<MemoryAwareResponse & { tokenUsage?: { input: number; output: number; cost: number } }> {
  const memoryManager = new MemoryManager(userId)

  try {
    // 1. Retrieve from documents (RAG)
    const documentResults = await hybridSearch(
      userId,
      query,
      RAG_CONFIG.limits.documentChunks
    )

    // 2. Retrieve from episodic memory (past conversations)
    const episodicMemories = await memoryManager.retrieveEpisodicMemory(
      query,
      RAG_CONFIG.limits.episodicMemoryResults
    )

    // 3. Retrieve from semantic memory (known facts)
    const semanticMemories = await memoryManager.retrieveSemanticMemory(
      query,
      RAG_CONFIG.limits.semanticMemoryResults
    )

    // 4. Get procedural memory (preferences)
    const procedural = await memoryManager.getProceduralMemory()

    // 5. Assemble comprehensive context
    let context = '# Retrieved Documents:\n\n'
    documentResults.forEach((result, i) => {
      context += `[Doc ${i + 1}] ${result.content}\n\n`
    })

    if (episodicMemories.length > 0) {
      context += '\n# Your Past Conversations:\n\n'
      episodicMemories.forEach((memory: EpisodicMemory) => {
        context += `- ${memory.summary ?? 'No summary available'}\n`
      })
    }

    if (semanticMemories.length > 0) {
      context += '\n# Known Facts About You:\n\n'
      semanticMemories.forEach((memory: SemanticMemory) => {
        context += `- ${memory.fact ?? 'No fact available'}\n`
      })
    }

    if (procedural.preferences && Object.keys(procedural.preferences).length > 0) {
      context += '\n# Your Preferences:\n\n'
      Object.entries(procedural.preferences).forEach(([key, value]) => {
        context += `- ${key}: ${value}\n`
      })
    }

    // Sanitize query
    const sanitizedQuery = sanitizeForPrompt(query)

    // 6. Generate response with full context
    const response = await client.messages.create({
      model: RAG_CONFIG.models.synthesis,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Using the following context, answer this question: "${sanitizedQuery}"

${context}

Instructions:
- Prioritize information from retrieved documents
- Reference past conversations if relevant
- Apply user preferences to your response style
- Cite sources using [Doc N] notation`,
        },
      ],
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''

    // Get actual token usage
    const tokenUsage = getTokenUsage(response)

    // 7. Store this exchange in episodic memory (only if conversationId provided)
    if (conversationId) {
      const summary = `User asked: "${query}". Assistant answered based on documents and past context.`
      await memoryManager.storeEpisodicMemory(
        conversationId,
        '', // messageId would come from messages table
        summary,
        0.7 // importance score
      )

      // 8. Extract and store facts in semantic memory
      await extractAndStoreFacts(answer, conversationId, memoryManager)
    }

    return {
      answer,
      sources: documentResults,
      memoryContext: context,
      conversationId,
      tokenUsage: {
        input: tokenUsage.promptTokens,
        output: tokenUsage.completionTokens,
        cost: calculateCost(tokenUsage.promptTokens, tokenUsage.completionTokens),
      },
    }
  } catch (error) {
    console.error('Memory-aware query error:', error)
    throw error
  }
}

async function extractAndStoreFacts(
  answer: string,
  conversationId: string,
  memoryManager: MemoryManager
): Promise<void> {
  if (!conversationId) {
    return // Skip if no conversation context
  }

  try {
    const sanitizedAnswer = sanitizeForPrompt(answer)

    // Use Claude to extract factual statements from the answer
    const response = await client.messages.create({
      model: RAG_CONFIG.models.evaluation, // Use faster model for extraction
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Extract key facts from this text that should be remembered. Return as JSON array of strings.

Text: "${sanitizedAnswer}"

Respond with only: ["fact 1", "fact 2", ...]`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const facts = JSON.parse(text)

    if (Array.isArray(facts)) {
      // Deduplicate facts
      const uniqueFacts = [...new Set(facts)]

      for (const fact of uniqueFacts) {
        if (typeof fact === 'string' && fact.trim().length > 0) {
          await memoryManager.storeSemanticMemory(fact, conversationId, 0.8)
        }
      }
    }
  } catch (error) {
    console.error('Failed to extract facts:', error)
    // Don't throw - fact extraction is optional
  }
}

function calculateCost(promptTokens: number, completionTokens: number): number {
  // Claude 3.5 Sonnet pricing (as of Feb 2026)
  const PROMPT_PRICE = 0.003 / 1000 // $3 per million tokens
  const COMPLETION_PRICE = 0.015 / 1000 // $15 per million tokens

  return promptTokens * PROMPT_PRICE + completionTokens * COMPLETION_PRICE
}

export async function summarizeConversation(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  if (messages.length === 0) return ''

  const conversation = messages.map((m) => `${m.role}: ${m.content}`).join('\n')

  const response = await client.messages.create({
    model: RAG_CONFIG.models.evaluation,
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Summarize this conversation in 2-3 sentences:

${conversation}`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
