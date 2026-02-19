import Anthropic from '@anthropic-ai/sdk'
import { Message, ChatOptions, ChatResponse, StreamChatOptions } from './types'
import { getCached, setCached } from '@/lib/redis/client'
import { createHash } from 'crypto'
import { env } from '@/src/lib/env'

class AIService {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: env.NODE_ENV === 'test',
    })
  }

  /**
   * Generate cache key from messages
   */
  private generateCacheKey(messages: Message[], systemPrompt: string): string {
    const content = systemPrompt + JSON.stringify(messages)
    return `ai:${createHash('md5').update(content).digest('hex')}`
  }

  /**
   * Non-streaming chat completion
   */
  async chat(options: ChatOptions): Promise<ChatResponse> {
    const {
      systemPrompt,
      messages,
      temperature = 0.7,
      maxTokens = 4096,
      cacheKey,
    } = options

    // Check cache if key provided
    if (cacheKey) {
      const cached = await getCached<ChatResponse>(cacheKey)
      if (cached) {
        return { ...cached, cached: true }
      }
    }

    // Auto-generate cache key for identical requests
    const autoCacheKey = this.generateCacheKey(messages, systemPrompt)
    const autoCached = await getCached<ChatResponse>(autoCacheKey)
    if (autoCached) {
      return { ...autoCached, cached: true }
    }

    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content,
        })),
      })

      const content = response.content[0].type === 'text'
        ? response.content[0].text
        : ''

      const result: ChatResponse = {
        content,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      }

      // Cache the result (15 min expiration)
      await setCached(autoCacheKey, result, 900)

      return result
    } catch (error) {
      console.error('AI chat error:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  /**
   * Streaming chat completion
   */
  async streamChat(options: StreamChatOptions): Promise<void> {
    const {
      systemPrompt,
      messages,
      temperature = 0.7,
      maxTokens = 4096,
      onChunk,
      onComplete,
      onError,
    } = options

    try {
      const stream = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content,
        })),
        stream: true,
      })

      let fullResponse = ''

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          const text = chunk.delta.text
          fullResponse += text
          onChunk(text)
        }
      }

      onComplete(fullResponse)
    } catch (error) {
      console.error('AI stream error:', error)
      onError(error as Error)
    }
  }

  /**
   * Retry wrapper for resilience
   */
  async chatWithRetry(
    options: ChatOptions,
    maxRetries: number = 3
  ): Promise<ChatResponse> {
    let lastError: Error | null = null

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.chat(options)
      } catch (error) {
        lastError = error as Error
        console.warn(`Retry ${i + 1}/${maxRetries} after error:`, error)

        // Exponential backoff
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        )
      }
    }

    throw lastError || new Error('Failed after retries')
  }
}

// Export singleton instance
export const aiService = new AIService()
