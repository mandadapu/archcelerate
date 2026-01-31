import { redis } from '@/lib/redis/client'

export interface RateLimitConfig {
  interval: number // Time window in seconds
  maxRequests: number // Max requests per window
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{
  success: boolean
  remaining: number
  reset: number
}> {
  const key = `rate-limit:${identifier}`

  try {
    const count = await redis.incr(key)

    // Set expiration on first request
    if (count === 1) {
      await redis.expire(key, config.interval)
    }

    const ttl = await redis.ttl(key)
    const reset = Date.now() + ttl * 1000

    if (count > config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset,
      }
    }

    return {
      success: true,
      remaining: config.maxRequests - count,
      reset,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fail open - allow request if Redis is down
    return {
      success: true,
      remaining: config.maxRequests,
      reset: Date.now() + config.interval * 1000,
    }
  }
}

// Preset configurations
export const RATE_LIMITS = {
  MENTOR_CHAT: {
    interval: 3600, // 1 hour
    maxRequests: 20, // 20 messages per hour
  },
  DIAGNOSIS: {
    interval: 86400, // 24 hours
    maxRequests: 3, // 3 attempts per day
  },
  API_GENERAL: {
    interval: 60, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
}
