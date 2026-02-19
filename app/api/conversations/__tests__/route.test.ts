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

// Mock Supabase — build the chain fully inline to avoid hoisting issues
// We access individual mocks through the chain at test time
jest.mock('@/lib/supabase/server', () => {
  const mockLimit = jest.fn()
  const mockOrder = jest.fn(() => ({ limit: mockLimit }))
  const mockEq = jest.fn(() => ({ order: mockOrder }))
  const mockSelect = jest.fn(() => ({ eq: mockEq }))
  const mockFrom = jest.fn(() => ({ select: mockSelect }))
  const client = { from: mockFrom }
  // Expose mocks for test assertions
  ;(client as any).__mocks = { mockFrom, mockSelect, mockEq, mockOrder, mockLimit }
  return {
    createClient: jest.fn().mockResolvedValue(client),
  }
})

import { getServerSession } from 'next-auth'
import { createClient } from '@/lib/supabase/server'
import { GET } from '../route'

const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

// Helper to get chain mocks
async function getChainMocks() {
  const client = await (createClient as jest.Mock)()
  return (client as any).__mocks as {
    mockFrom: jest.Mock
    mockSelect: jest.Mock
    mockEq: jest.Mock
    mockOrder: jest.Mock
    mockLimit: jest.Mock
  }
}

describe('GET /api/conversations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockedGetServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/conversations')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 401 when session has no user id', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { email: 'test@test.com' } } as any)

    const request = new NextRequest('http://localhost:3000/api/conversations')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('returns conversations for authenticated user', async () => {
    const mockConversations = [
      { id: 'conv-1', user_id: 'user-1', title: 'Chat 1', updated_at: '2026-01-01' },
      { id: 'conv-2', user_id: 'user-1', title: 'Chat 2', updated_at: '2026-01-02' },
    ]

    mockedGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    } as any)

    const { mockFrom, mockSelect, mockEq, mockOrder, mockLimit } = await getChainMocks()
    mockLimit.mockResolvedValue({ data: mockConversations, error: null })

    const request = new NextRequest('http://localhost:3000/api/conversations')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.conversations).toEqual(mockConversations)

    // Verify query chain
    expect(mockFrom).toHaveBeenCalledWith('conversations')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(mockOrder).toHaveBeenCalledWith('updated_at', { ascending: false })
    expect(mockLimit).toHaveBeenCalledWith(50)
  })

  it('returns 500 on Supabase query error', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    } as any)

    const { mockLimit } = await getChainMocks()
    mockLimit.mockResolvedValue({
      data: null,
      error: { message: 'DB error', code: '42P01' },
    })
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const request = new NextRequest('http://localhost:3000/api/conversations')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Failed to fetch conversations')
    consoleSpy.mockRestore()
  })
})
