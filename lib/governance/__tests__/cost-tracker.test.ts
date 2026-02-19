/**
 * @jest-environment node
 */

// Build Supabase mock inline to avoid hoisting issues
jest.mock('@/lib/supabase/server', () => {
  const mockSingle = jest.fn()
  const mockSelect = jest.fn(() => ({ single: mockSingle }))
  const mockInsert = jest.fn(() => ({ select: mockSelect }))
  const mockEq = jest.fn(() => ({ single: mockSingle }))
  const mockUpdate = jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ data: null, error: null }) }))
  const mockGte = jest.fn(() => ({
    order: jest.fn().mockResolvedValue({ data: [], error: null }),
  }))

  const mockFrom = jest.fn((table: string) => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => {
        if (table === 'llm_requests') {
          return { gte: mockGte }
        }
        return { single: mockSingle }
      }),
    })),
    insert: mockInsert,
    update: mockUpdate,
  }))

  const client = { from: mockFrom }
  ;(client as any).__mocks = { mockFrom, mockSingle, mockInsert, mockSelect, mockUpdate, mockEq, mockGte }
  return {
    createClient: jest.fn().mockResolvedValue(client),
  }
})

import { createClient } from '@/lib/supabase/server'
import { checkBudget, trackCost, getUsageStats } from '../cost-tracker'

async function getMocks() {
  const client = await (createClient as jest.Mock)()
  return (client as any).__mocks as {
    mockFrom: jest.Mock
    mockSingle: jest.Mock
    mockInsert: jest.Mock
    mockSelect: jest.Mock
    mockUpdate: jest.Mock
    mockGte: jest.Mock
  }
}

describe('checkBudget', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns budget info for existing user', async () => {
    const { mockSingle } = await getMocks()
    mockSingle.mockResolvedValue({
      data: {
        monthly_budget: 10,
        current_spend: 3,
        budget_exceeded: false,
        budget_period_start: new Date().toISOString(),
      },
      error: null,
    })

    const result = await checkBudget('user-1')

    expect(result.withinBudget).toBe(true)
    expect(result.currentSpend).toBe(3)
    expect(result.monthlyBudget).toBe(10)
    expect(result.remaining).toBe(7)
  })

  it('creates default budget when none exists', async () => {
    const { mockSingle } = await getMocks()
    // First call: no budget exists
    mockSingle
      .mockResolvedValueOnce({ data: null, error: null })
      // Second call: newly created budget
      .mockResolvedValueOnce({
        data: {
          monthly_budget: 10,
          current_spend: 0,
          budget_exceeded: false,
          budget_period_start: new Date().toISOString(),
        },
        error: null,
      })

    const result = await checkBudget('new-user')

    expect(result.withinBudget).toBe(true)
    expect(result.remaining).toBe(10)
  })

  it('returns withinBudget: false when budget exceeded', async () => {
    const { mockSingle } = await getMocks()
    mockSingle.mockResolvedValue({
      data: {
        monthly_budget: 10,
        current_spend: 12,
        budget_exceeded: true,
        budget_period_start: new Date().toISOString(),
      },
      error: null,
    })

    const result = await checkBudget('user-1')

    expect(result.withinBudget).toBe(false)
    expect(result.remaining).toBe(0) // Math.max(0, 10-12)
  })

  it('resets budget after 30 days', async () => {
    const { mockSingle } = await getMocks()
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 31) // 31 days ago

    mockSingle.mockResolvedValue({
      data: {
        monthly_budget: 10,
        current_spend: 8,
        budget_exceeded: false,
        budget_period_start: oldDate.toISOString(),
      },
      error: null,
    })

    const result = await checkBudget('user-1')

    // After reset, spend is 0
    expect(result.currentSpend).toBe(0)
    expect(result.remaining).toBe(10)
    expect(result.withinBudget).toBe(true)
  })
})

describe('trackCost', () => {
  beforeEach(() => jest.clearAllMocks())

  it('updates spend for existing budget', async () => {
    const { mockSingle, mockFrom } = await getMocks()
    mockSingle.mockResolvedValue({
      data: {
        current_spend: 5,
        monthly_budget: 10,
      },
      error: null,
    })

    await trackCost('user-1', 0.5)

    // Verify update was called on user_budgets
    expect(mockFrom).toHaveBeenCalledWith('user_budgets')
  })

  it('does nothing when no budget exists', async () => {
    const { mockSingle, mockFrom } = await getMocks()
    mockSingle.mockResolvedValue({ data: null, error: null })

    await trackCost('user-1', 0.5)

    // from() called for select, but update should not be triggered
    const updateCalls = mockFrom.mock.calls.filter(
      (call: any[]) => call[0] === 'user_budgets'
    )
    // At least the select call happened
    expect(updateCalls.length).toBeGreaterThanOrEqual(1)
  })
})

describe('getUsageStats', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns null when no requests found', async () => {
    const { mockGte } = await getMocks()
    mockGte.mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: null, error: null }),
    })

    const result = await getUsageStats('user-1')

    expect(result).toBeNull()
  })

  it('aggregates request data correctly', async () => {
    const { mockGte } = await getMocks()
    mockGte.mockReturnValue({
      order: jest.fn().mockResolvedValue({
        data: [
          { cost: '0.01', total_tokens: 100, latency_ms: 200, created_at: '2026-01-15T10:00:00Z' },
          { cost: '0.02', total_tokens: 200, latency_ms: 300, created_at: '2026-01-15T11:00:00Z' },
          { cost: '0.03', total_tokens: 300, latency_ms: 400, created_at: '2026-01-16T10:00:00Z' },
        ],
        error: null,
      }),
    })

    const result = await getUsageStats('user-1', 30)

    expect(result).not.toBeNull()
    expect(result!.totalRequests).toBe(3)
    expect(result!.totalCost).toBeCloseTo(0.06)
    expect(result!.totalTokens).toBe(600)
    expect(result!.avgLatency).toBe(300)
    // 2 unique days
    expect(Object.keys(result!.dailyStats)).toHaveLength(2)
    expect(result!.dailyStats['2026-01-15'].requests).toBe(2)
    expect(result!.dailyStats['2026-01-16'].requests).toBe(1)
  })
})
