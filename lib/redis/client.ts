import Redis from 'ioredis'
import { env } from '@/src/lib/env'

export const redis = new Redis(env.REDIS_URL)

// Cache utilities
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key)
    if (!cached) return null
    return JSON.parse(cached) as T
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export async function setCached(
  key: string,
  value: any,
  expirationSeconds: number = 3600
): Promise<void> {
  try {
    await redis.setex(key, expirationSeconds, JSON.stringify(value))
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

export async function deleteCached(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Redis delete error:', error)
  }
}
