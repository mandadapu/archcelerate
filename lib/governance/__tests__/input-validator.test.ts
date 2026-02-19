/**
 * @jest-environment node
 */

import { validateChatInput, TEST_CASES } from '../input-validator'

describe('validateChatInput', () => {
  it('accepts valid input with content and conversationId', async () => {
    const result = await validateChatInput(TEST_CASES.valid[0])

    expect(result.valid).toBe(true)
    expect(result.sanitized).toBeDefined()
    expect(result.sanitized.content).toBe('Hello world')
    expect(result.sanitized.conversationId).toBe('123e4567-e89b-12d3-a456-426614174000')
  })

  it('accepts valid input at max length (4000 chars)', async () => {
    const result = await validateChatInput(TEST_CASES.valid[1])

    expect(result.valid).toBe(true)
    expect(result.sanitized.content).toHaveLength(4000)
  })

  it('accepts input without conversationId', async () => {
    const result = await validateChatInput({ content: 'Hello' })

    expect(result.valid).toBe(true)
    expect(result.sanitized.conversationId).toBeUndefined()
  })

  it('rejects empty content', async () => {
    const result = await validateChatInput({ content: '' })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Message cannot be empty')
  })

  it('rejects content exceeding 4000 chars', async () => {
    const result = await validateChatInput({ content: 'A'.repeat(4001) })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Message too long (max 4000 characters)')
  })

  it('rejects null content', async () => {
    const result = await validateChatInput({ content: null })

    expect(result.valid).toBe(false)
    expect(result.errors).toBeDefined()
  })

  it('rejects missing content field', async () => {
    const result = await validateChatInput({ conversationId: 'invalid-uuid' })

    expect(result.valid).toBe(false)
  })

  it('rejects invalid UUID for conversationId', async () => {
    const result = await validateChatInput({ content: 'Hello', conversationId: 'not-a-uuid' })

    expect(result.valid).toBe(false)
    expect(result.errors).toBeDefined()
  })

  it('returns generic error for non-Zod exceptions', async () => {
    // Pass completely invalid input type
    const result = await validateChatInput(null)

    expect(result.valid).toBe(false)
  })
})

describe('sanitization', () => {
  it('escapes HTML tags for XSS prevention', async () => {
    const result = await validateChatInput({ content: '<script>alert("xss")</script>' })

    expect(result.valid).toBe(true)
    expect(result.sanitized.content).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;')
    expect(result.sanitized.content).not.toContain('<script>')
  })

  it('removes null bytes', async () => {
    const result = await validateChatInput({ content: 'hello\0world' })

    expect(result.valid).toBe(true)
    expect(result.sanitized.content).toBe('helloworld')
  })

  it('trims whitespace', async () => {
    const result = await validateChatInput({ content: '  hello world  ' })

    expect(result.valid).toBe(true)
    expect(result.sanitized.content).toBe('hello world')
  })
})
