// lib/governance/rate-limiter.ts
import { redis } from '@/lib/redis/client'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export async function checkRateLimit(
  userId: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `rate_limit:${userId}`
  const now = Date.now()
  const windowStart = now - windowSeconds * 1000

  try {
    // Use Redis sorted set for sliding window
    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count requests in current window
    const count = await redis.zcard(key)

    if (count >= limit) {
      // Find when the oldest request will expire
      const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES')
      const resetAt = oldest.length > 0
        ? Number(oldest[1]) + windowSeconds * 1000
        : now + windowSeconds * 1000

      return { allowed: false, remaining: 0, resetAt }
    }

    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`)
    await redis.expire(key, windowSeconds)

    return {
      allowed: true,
      remaining: limit - count - 1,
      resetAt: now + windowSeconds * 1000
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open on Redis errors
    return { allowed: true, remaining: limit, resetAt: now + windowSeconds * 1000 }
  }
}

// Different rate limits for different endpoints
export const RATE_LIMITS = {
  chat: { limit: 10, window: 60 }, // 10 messages per minute
  codeReview: { limit: 3, window: 3600 }, // 3 reviews per hour
  labSubmission: { limit: 20, window: 3600 } // 20 submissions per hour
}
