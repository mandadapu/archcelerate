/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Mock Supabase data client — fully inline to avoid hoisting issues
jest.mock('@/lib/supabase/server', () => {
  const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'conv-123' }, error: null })
  const mockInsert = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({ single: mockSingle }),
  })
  const mockFrom = jest.fn().mockReturnValue({
    insert: mockInsert,
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }),
  })
  return {
    createClient: jest.fn().mockResolvedValue({ from: mockFrom }),
  }
})

// Mock governance modules
jest.mock('@/lib/governance/input-validator', () => ({
  validateChatInput: jest.fn().mockResolvedValue({
    valid: true,
    sanitized: {
      content: 'Hello, how are you?',
      conversationId: 'conv-123',
    },
  }),
}))

jest.mock('@/lib/governance/content-moderator', () => ({
  moderateContent: jest.fn().mockResolvedValue({
    flagged: false,
    categories: [],
  }),
}))

jest.mock('@/lib/governance/rate-limiter', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({
    allowed: true,
    remaining: 9,
    resetAt: Date.now() + 60000,
  }),
  RATE_LIMITS: {
    chat: { limit: 10, window: 60 },
  },
}))

jest.mock('@/lib/governance/cost-tracker', () => ({
  checkBudget: jest.fn().mockResolvedValue({
    withinBudget: true,
    remaining: 100,
    monthlyBudget: 200,
  }),
  trackCost: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/governance/logger', () => ({
  logLLMRequest: jest.fn().mockResolvedValue(undefined),
  logAuditEvent: jest.fn().mockResolvedValue(undefined),
  calculateCost: jest.fn().mockReturnValue(0.01),
}))

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        id: 'msg_test123',
        content: [{ type: 'text', text: 'This is a test response' }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    },
  }))
})

import { getServerSession } from 'next-auth'
import { POST } from '../route'

const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Re-set default mock for getServerSession (authenticated)
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
    } as any)
  })

  it('returns 401 for unauthenticated users', async () => {
    mockedGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: 'conv-123',
        content: 'Hello',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 401 when session has no user id', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: 'test@test.com' } } as any)

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ content: 'Hello' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid input', async () => {
    const { validateChatInput } = require('@/lib/governance/input-validator')
    validateChatInput.mockResolvedValueOnce({
      valid: false,
      errors: ['Content is required'],
    })

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 429 when rate limited', async () => {
    const { checkRateLimit } = require('@/lib/governance/rate-limiter')
    checkRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
    })

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ content: 'Hello' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(429)
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
  })

  it('creates a chat message and returns response', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: 'conv-123',
        content: 'Hello, how are you?',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('This is a test response')
    expect(data.conversationId).toBeDefined()
    expect(data.usage).toEqual(
      expect.objectContaining({
        promptTokens: 10,
        completionTokens: 20,
      })
    )
  })
})
