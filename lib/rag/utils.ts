// lib/rag/utils.ts
import Anthropic from '@anthropic-ai/sdk'
import { RAG_CONFIG, ERROR_MESSAGES } from './constants'
import { APIError, ErrorType } from './types'

/**
 * Estimate token count using character-based heuristic
 * Note: This is approximate. For production, use proper tokenizer
 */
export function estimateTokens(text: string): number {
  // Average: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4)
}

/**
 * Validate file upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > RAG_CONFIG.limits.maxFileSize) {
    return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE }
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!RAG_CONFIG.upload.allowedExtensions.includes(extension)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE }
  }

  // Check MIME type
  if (!RAG_CONFIG.upload.allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE }
  }

  return { valid: true }
}

/**
 * Sanitize user input for LLM prompts to prevent injection
 */
export function sanitizeForPrompt(input: string): string {
  // Remove potential prompt injection patterns
  return input
    .replace(/```/g, '') // Remove code blocks
    .replace(/\\n{3,}/g, '\\n\\n') // Limit consecutive newlines
    .trim()
    .slice(0, 10000) // Limit length
}

/**
 * Parse JSON from LLM response with fallback
 */
export function parseJSONFromLLM<T>(text: string, fallback: T): T {
  try {
    // Try to find JSON in response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return fallback

    const parsed = JSON.parse(jsonMatch[0])
    return parsed
  } catch (error) {
    console.error('Failed to parse JSON from LLM:', error)
    return fallback
  }
}

/**
 * Create standardized API error response
 */
export function createErrorResponse(
  message: string,
  type: ErrorType = 'server',
  details?: any
): Response {
  const statusMap: Record<ErrorType, number> = {
    auth: 401,
    validation: 400,
    rate_limit: 429,
    budget: 402,
    server: 500,
  }

  const error: APIError = {
    error: message,
    type,
    details,
  }

  return Response.json(error, { status: statusMap[type] })
}

/**
 * Retry helper for LLM calls
 */
export async function retryLLMCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = RAG_CONFIG.evaluation.maxRetries
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        // Wait before retry with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)))
      }
    }
  }

  throw lastError
}

/**
 * Chunk array for batch processing
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Calculate actual token usage from API response
 */
export function getTokenUsage(response: Anthropic.Message): {
  promptTokens: number
  completionTokens: number
  totalTokens: number
} {
  const usage = response.usage
  return {
    promptTokens: usage.input_tokens,
    completionTokens: usage.output_tokens,
    totalTokens: usage.input_tokens + usage.output_tokens,
  }
}
