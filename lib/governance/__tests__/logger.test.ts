/**
 * @jest-environment node
 */

// Mock Supabase — fully inline to avoid hoisting issues
jest.mock('@/lib/supabase/server', () => {
  const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null })
  const mockFrom = jest.fn(() => ({ insert: mockInsert }))
  const client = { from: mockFrom }
  ;(client as any).__mocks = { mockFrom, mockInsert }
  return {
    createClient: jest.fn().mockResolvedValue(client),
  }
})

import { createClient } from '@/lib/supabase/server'
import { logLLMRequest, logAuditEvent, calculateCost } from '../logger'

async function getMocks() {
  const client = await (createClient as jest.Mock)()
  return (client as any).__mocks as { mockFrom: jest.Mock; mockInsert: jest.Mock }
}

describe('logLLMRequest', () => {
  beforeEach(() => jest.clearAllMocks())

  it('inserts request data into llm_requests table', async () => {
    const { mockFrom, mockInsert } = await getMocks()
    await logLLMRequest({
      userId: 'user-1',
      endpoint: '/api/chat',
      model: 'claude-sonnet-4-5-20250929',
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 150,
      cost: 0.01,
      latencyMs: 500,
      status: 'success',
    })

    expect(mockFrom).toHaveBeenCalledWith('llm_requests')
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      endpoint: '/api/chat',
      model: 'claude-sonnet-4-5-20250929',
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150,
      cost: 0.01,
      latency_ms: 500,
      status: 'success',
      error_message: undefined,
    })
  })

  it('includes error_message for error status', async () => {
    const { mockInsert } = await getMocks()
    await logLLMRequest({
      userId: 'user-1',
      endpoint: '/api/chat',
      model: 'claude-sonnet-4-5-20250929',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      cost: 0,
      latencyMs: 100,
      status: 'error',
      errorMessage: 'API timeout',
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ error_message: 'API timeout', status: 'error' })
    )
  })
})

describe('logAuditEvent', () => {
  beforeEach(() => jest.clearAllMocks())

  it('inserts audit event with IP and user-agent from request', async () => {
    const mockRequest = new Request('http://localhost/api/chat', {
      headers: {
        'x-forwarded-for': '1.2.3.4',
        'user-agent': 'TestBrowser/1.0',
      },
    })

    await logAuditEvent('user-1', 'chat_message_sent', 'conversation', 'conv-1', { foo: 'bar' }, mockRequest)

    const { mockFrom, mockInsert } = await getMocks()
    expect(mockFrom).toHaveBeenCalledWith('audit_logs')
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      action: 'chat_message_sent',
      resource_type: 'conversation',
      resource_id: 'conv-1',
      metadata: { foo: 'bar' },
      ip_address: '1.2.3.4',
      user_agent: 'TestBrowser/1.0',
    })
  })

  it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
    const mockRequest = new Request('http://localhost/api/chat', {
      headers: { 'x-real-ip': '5.6.7.8' },
    })

    await logAuditEvent('user-1', 'action', 'resource', undefined, undefined, mockRequest)

    const { mockInsert } = await getMocks()
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ ip_address: '5.6.7.8' })
    )
  })

  it('uses "unknown" IP when no request provided', async () => {
    await logAuditEvent('user-1', 'action', 'resource')

    const { mockInsert } = await getMocks()
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ ip_address: 'unknown', user_agent: undefined })
    )
  })
})

describe('calculateCost', () => {
  it('calculates cost for claude-sonnet-4-5', () => {
    // 1000 input tokens at $0.003/1k + 500 output tokens at $0.015/1k
    const cost = calculateCost('claude-sonnet-4-5-20250929', 1000, 500)
    expect(cost).toBeCloseTo(0.003 + 0.0075, 6)
  })

  it('calculates cost for claude-haiku-4-5', () => {
    const cost = calculateCost('claude-haiku-4-5-20251001', 1000, 1000)
    expect(cost).toBeCloseTo(0.00025 + 0.00125, 6)
  })

  it('calculates cost for gpt-4-turbo', () => {
    const cost = calculateCost('gpt-4-turbo', 1000, 1000)
    expect(cost).toBeCloseTo(0.01 + 0.03, 6)
  })

  it('falls back to gpt-3.5-turbo pricing for unknown models', () => {
    const cost = calculateCost('unknown-model', 1000, 1000)
    expect(cost).toBeCloseTo(0.0005 + 0.0015, 6)
  })

  it('returns 0 for zero tokens', () => {
    const cost = calculateCost('claude-sonnet-4-5-20250929', 0, 0)
    expect(cost).toBe(0)
  })
})
