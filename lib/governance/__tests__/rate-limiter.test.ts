/**
 * @jest-environment node
 */

jest.mock('@/lib/redis/client', () => ({
  redis: {
    zremrangebyscore: jest.fn(),
    zcard: jest.fn(),
    zrange: jest.fn(),
    zadd: jest.fn(),
    expire: jest.fn(),
  },
}))

import { redis } from '@/lib/redis/client'
import { checkRateLimit, RATE_LIMITS } from '../rate-limiter'

const mockedRedis = redis as jest.Mocked<typeof redis>

describe('checkRateLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(mockedRedis.zremrangebyscore as jest.Mock).mockResolvedValue(0)
    ;(mockedRedis.zadd as jest.Mock).mockResolvedValue(1)
    ;(mockedRedis.expire as jest.Mock).mockResolvedValue(1)
  })

  it('allows request when under the limit', async () => {
    ;(mockedRedis.zcard as jest.Mock).mockResolvedValue(3)

    const result = await checkRateLimit('user-1', 10, 60)

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(6) // 10 - 3 - 1
    expect(mockedRedis.zremrangebyscore).toHaveBeenCalledWith(
      'rate_limit:user-1',
      0,
      expect.any(Number)
    )
    expect(mockedRedis.zadd).toHaveBeenCalledWith(
      'rate_limit:user-1',
      expect.any(Number),
      expect.stringMatching(/^\d+-/)
    )
    expect(mockedRedis.expire).toHaveBeenCalledWith('rate_limit:user-1', 60)
  })

  it('denies request when at the limit', async () => {
    ;(mockedRedis.zcard as jest.Mock).mockResolvedValue(10)
    ;(mockedRedis.zrange as jest.Mock).mockResolvedValue(['entry-1', '1000000'])

    const result = await checkRateLimit('user-2', 10, 60)

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.resetAt).toBe(1000000 + 60 * 1000)
    // Should NOT add a new entry when denied
    expect(mockedRedis.zadd).not.toHaveBeenCalled()
  })

  it('denies request when over the limit', async () => {
    ;(mockedRedis.zcard as jest.Mock).mockResolvedValue(15)
    ;(mockedRedis.zrange as jest.Mock).mockResolvedValue([])

    const result = await checkRateLimit('user-3', 10, 60)

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    // When no oldest entry, resetAt uses now + window
    expect(result.resetAt).toBeGreaterThan(Date.now() - 1000)
  })

  it('uses default limit=10 and window=60', async () => {
    ;(mockedRedis.zcard as jest.Mock).mockResolvedValue(0)

    const result = await checkRateLimit('user-4')

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9) // 10 - 0 - 1
  })

  it('fails open on Redis error', async () => {
    ;(mockedRedis.zremrangebyscore as jest.Mock).mockRejectedValue(new Error('Redis down'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const result = await checkRateLimit('user-5', 10, 60)

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(10)
    expect(consoleSpy).toHaveBeenCalledWith(
      'Rate limit check failed:',
      expect.any(Error)
    )
    consoleSpy.mockRestore()
  })

  it('cleans up expired entries before counting', async () => {
    ;(mockedRedis.zcard as jest.Mock).mockResolvedValue(0)
    const beforeCall = Date.now()

    await checkRateLimit('user-6', 5, 120)

    const [, , windowStart] = (mockedRedis.zremrangebyscore as jest.Mock).mock.calls[0] as [string, number, number]
    // windowStart should be roughly now - 120*1000
    expect(windowStart).toBeGreaterThanOrEqual(beforeCall - 120 * 1000 - 100)
    expect(windowStart).toBeLessThanOrEqual(Date.now() - 120 * 1000 + 100)
  })
})

describe('RATE_LIMITS', () => {
  it('defines chat limits', () => {
    expect(RATE_LIMITS.chat).toEqual({ limit: 10, window: 60 })
  })

  it('defines codeReview limits', () => {
    expect(RATE_LIMITS.codeReview).toEqual({ limit: 3, window: 3600 })
  })

  it('defines labSubmission limits', () => {
    expect(RATE_LIMITS.labSubmission).toEqual({ limit: 20, window: 3600 })
  })
})
