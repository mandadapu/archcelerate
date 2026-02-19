/**
 * @jest-environment node
 */

jest.mock('@anthropic-ai/sdk', () => {
  const mockCreate = jest.fn()
  const MockAnthropic = jest.fn(() => ({
    messages: { create: mockCreate },
  }))
  ;(MockAnthropic as any).__mockCreate = mockCreate
  return MockAnthropic
})

jest.mock('@/lib/governance/logger', () => ({
  calculateCost: jest.fn(() => 0.005),
}))

import Anthropic from '@anthropic-ai/sdk'
import { executeLLMCallNode } from '../node-executors/llm-call'
import type { LLMCallNodeData } from '../types'

const mockCreate = (Anthropic as any).__mockCreate as jest.Mock

const config: LLMCallNodeData = {
  label: 'LLM',
  model: 'claude-haiku-4-5-20251001',
  systemPrompt: 'You are helpful.',
  userPromptTemplate: '{{input}}',
  maxTokens: 256,
  temperature: 0.7,
}

describe('executeLLMCallNode', () => {
  const originalEnv = process.env.ANTHROPIC_API_KEY

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-key'
  })

  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = originalEnv
  })

  it('fails when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY
    const result = await executeLLMCallNode(config, 'hello')
    expect(result.status).toBe('failed')
    expect(result.errorMessage).toContain('not configured')
  })

  it('returns output on success', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Hello back!' }],
      usage: { input_tokens: 10, output_tokens: 5 },
    })
    const result = await executeLLMCallNode(config, 'hello')
    expect(result.status).toBe('completed')
    expect(result.output).toBe('Hello back!')
    expect(result.tokensUsed).toBe(15)
    expect(result.cost).toBe(0.005)
  })

  it('fails when Anthropic throws', async () => {
    mockCreate.mockRejectedValue(new Error('API error'))
    const result = await executeLLMCallNode(config, 'hello')
    expect(result.status).toBe('failed')
    expect(result.errorMessage).toContain('API error')
  })

  it('passes correct model and prompt to API', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'ok' }],
      usage: { input_tokens: 5, output_tokens: 2 },
    })
    await executeLLMCallNode(config, 'test input')
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      model: 'claude-haiku-4-5-20251001',
      system: 'You are helpful.',
      messages: [{ role: 'user', content: 'test input' }],
    }))
  })
})
