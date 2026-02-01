// lib/governance/input-validator.ts
import { z } from 'zod'

const ChatMessageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message too long (max 4000 characters)'),
  conversationId: z.string().uuid().optional()
})

export interface ValidationResult {
  valid: boolean
  errors?: string[]
  sanitized?: any
}

export async function validateChatInput(
  input: unknown
): Promise<ValidationResult> {
  try {
    const validated = ChatMessageSchema.parse(input)

    // Sanitize content
    const sanitized = {
      ...validated,
      content: sanitizeContent(validated.content)
    }

    return { valid: true, sanitized }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.issues.map((e) => e.message)
      }
    }
    return {
      valid: false,
      errors: ['Invalid input']
    }
  }
}

function sanitizeContent(content: string): string {
  // Remove null bytes
  let sanitized = content.replace(/\0/g, '')

  // Trim whitespace
  sanitized = sanitized.trim()

  // Basic XSS prevention (for display purposes)
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return sanitized
}

// Edge case tests
export const TEST_CASES = {
  valid: [
    { content: 'Hello world', conversationId: '123e4567-e89b-12d3-a456-426614174000' },
    { content: 'A'.repeat(4000) }
  ],
  invalid: [
    { content: '' }, // empty
    { content: 'A'.repeat(4001) }, // too long
    { content: null }, // null
    { conversationId: 'invalid-uuid' } // bad UUID
  ]
}
