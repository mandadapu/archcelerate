/**
 * @jest-environment node
 */

// Mock ioredis before importing the module under test
jest.mock('ioredis', () => {
  const mockInstance = {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
  }
  const MockRedis = jest.fn(() => mockInstance)
  ;(MockRedis as any).__mockInstance = mockInstance
  return MockRedis
})

jest.mock('@/src/lib/env', () => ({
  env: { REDIS_URL: 'redis://localhost:6379' },
}))

import Redis from 'ioredis'
import { redis, getCached, setCached, deleteCached } from '../client'

const mockInstance = (Redis as any).__mockInstance

describe('Redis client singleton', () => {
  it('exports a single redis instance', () => {
    expect(redis).toBeDefined()
    expect(redis.get).toBeDefined()
  })
})

describe('getCached', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns parsed JSON when key exists', async () => {
    mockInstance.get.mockResolvedValue(JSON.stringify({ foo: 'bar' }))

    const result = await getCached<{ foo: string }>('test-key')

    expect(mockInstance.get).toHaveBeenCalledWith('test-key')
    expect(result).toEqual({ foo: 'bar' })
  })

  it('returns null when key does not exist', async () => {
    mockInstance.get.mockResolvedValue(null)

    const result = await getCached('missing-key')

    expect(result).toBeNull()
  })

  it('returns null on Redis error', async () => {
    mockInstance.get.mockRejectedValue(new Error('connection refused'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const result = await getCached('error-key')

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Redis get error:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})

describe('setCached', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stores JSON with default TTL of 3600s', async () => {
    mockInstance.setex.mockResolvedValue('OK')

    await setCached('cache-key', { data: 123 })

    expect(mockInstance.setex).toHaveBeenCalledWith(
      'cache-key',
      3600,
      JSON.stringify({ data: 123 })
    )
  })

  it('stores JSON with custom TTL', async () => {
    mockInstance.setex.mockResolvedValue('OK')

    await setCached('cache-key', 'value', 120)

    expect(mockInstance.setex).toHaveBeenCalledWith('cache-key', 120, '"value"')
  })

  it('swallows Redis errors', async () => {
    mockInstance.setex.mockRejectedValue(new Error('write error'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    await setCached('key', 'val')

    expect(consoleSpy).toHaveBeenCalledWith('Redis set error:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})

describe('deleteCached', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deletes the key', async () => {
    mockInstance.del.mockResolvedValue(1)

    await deleteCached('del-key')

    expect(mockInstance.del).toHaveBeenCalledWith('del-key')
  })

  it('swallows Redis errors', async () => {
    mockInstance.del.mockRejectedValue(new Error('delete error'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    await deleteCached('key')

    expect(consoleSpy).toHaveBeenCalledWith('Redis delete error:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})
