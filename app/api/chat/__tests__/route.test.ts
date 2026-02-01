import { describe, it, expect, jest } from '@jest/globals'
import { POST } from '../route'
import { NextRequest } from 'next/server'
import { createMockUser } from '@/lib/test-utils'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: createMockUser() },
        error: null
      })
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'msg-123' },
        error: null
      })
    }))
  }))
}))

// Mock governance modules
jest.mock('@/lib/governance/input-validator', () => ({
  validateChatInput: jest.fn().mockResolvedValue({
    valid: true,
    sanitized: {
      content: 'Hello, how are you?',
      conversationId: 'conv-123'
    }
  })
}))

jest.mock('@/lib/governance/content-moderator', () => ({
  moderateContent: jest.fn().mockResolvedValue({
    safe: true,
    categories: []
  })
}))

jest.mock('@/lib/governance/rate-limiter', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({
    allowed: true,
    remaining: 10
  }),
  RATE_LIMITS: {
    chat: { limit: 20, window: 60 }
  }
}))

jest.mock('@/lib/governance/cost-tracker', () => ({
  checkBudget: jest.fn().mockResolvedValue({
    allowed: true,
    remaining: 100
  }),
  trackCost: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('@/lib/governance/logger', () => ({
  logLLMRequest: jest.fn().mockResolvedValue(undefined),
  logAuditEvent: jest.fn().mockResolvedValue(undefined),
  calculateCost: jest.fn().mockReturnValue(0.01)
}))

// Mock Anthropic SDK - must be hoisted before import
const mockAnthropicCreate = jest.fn().mockResolvedValue({
  id: 'msg_test123',
  content: [{
    type: 'text',
    text: 'This is a test response'
  }],
  usage: {
    input_tokens: 10,
    output_tokens: 20
  }
})

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: mockAnthropicCreate
    }
  }))
})

describe('POST /api/chat', () => {
  it('should create a chat message', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: 'conv-123',
        content: 'Hello, how are you?'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('response')
  })

  it('should return 401 for unauthenticated users', async () => {
    // Mock unauthenticated response
    const { createClient } = require('@/lib/supabase/server')
    createClient.mockReturnValueOnce({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Unauthorized')
        })
      }
    })

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: 'conv-123',
        content: 'Hello'
      })
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('should validate request body', async () => {
    // Mock validation failure
    const { validateChatInput } = require('@/lib/governance/input-validator')
    validateChatInput.mockResolvedValueOnce({
      valid: false,
      errors: ['Content is required']
    })

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({}) // Missing required fields
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
