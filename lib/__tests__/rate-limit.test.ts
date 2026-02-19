/**
 * @jest-environment node
 */

jest.mock('@/lib/redis/client', () => {
  const mockIncr = jest.fn()
  const mockExpire = jest.fn()
  const mockTtl = jest.fn()
  const mockRedis = { incr: mockIncr, expire: mockExpire, ttl: mockTtl }
  ;(mockRedis as any).__mocks = { mockIncr, mockExpire, mockTtl }
  return { redis: mockRedis }
})

import { redis } from '@/lib/redis/client'
import { rateLimit, RATE_LIMITS } from '../rate-limit'

const { mockIncr, mockExpire, mockTtl } = (redis as any).__mocks as {
  mockIncr: jest.Mock
  mockExpire: jest.Mock
  mockTtl: jest.Mock
}

const config = { interval: 60, maxRequests: 5 }

describe('rateLimit', () => {
  beforeEach(() => jest.clearAllMocks())

  it('sets expiration on first request (count=1)', async () => {
    mockIncr.mockResolvedValue(1)
    mockExpire.mockResolvedValue(1)
    mockTtl.mockResolvedValue(60)

    const result = await rateLimit('user-1', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
    expect(mockExpire).toHaveBeenCalledWith('rate-limit:user-1', 60)
  })

  it('does not call expire on subsequent requests', async () => {
    mockIncr.mockResolvedValue(2)
    mockTtl.mockResolvedValue(55)

    const result = await rateLimit('user-1', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(3)
    expect(mockExpire).not.toHaveBeenCalled()
  })

  it('denies when over limit', async () => {
    mockIncr.mockResolvedValue(6)
    mockTtl.mockResolvedValue(30)

    const result = await rateLimit('user-1', config)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('fails open when Redis throws', async () => {
    mockIncr.mockRejectedValue(new Error('Connection refused'))

    const result = await rateLimit('user-1', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(config.maxRequests)
  })
})

describe('RATE_LIMITS presets', () => {
  it('has expected presets with correct structure', () => {
    expect(RATE_LIMITS.MENTOR_CHAT).toEqual({ interval: 3600, maxRequests: 20 })
    expect(RATE_LIMITS.DIAGNOSIS).toEqual({ interval: 86400, maxRequests: 3 })
    expect(RATE_LIMITS.API_GENERAL).toEqual({ interval: 60, maxRequests: 30 })
  })
})
