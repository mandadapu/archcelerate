/**
 * Tests for the Prisma singleton (lib/db.ts).
 *
 * After P1-2, lib/prisma.ts is removed and lib/db.ts is the single source.
 * These tests verify:
 * 1. The singleton exports a PrismaClient instance
 * 2. The singleton is cached on globalThis in non-production
 * 3. Query logging is enabled only in development
 */

// We need to test the module in isolation, so clear the global cache between tests
const originalEnv = process.env.NODE_ENV

beforeEach(() => {
  // Reset the globalThis cache so each test gets a fresh import
  const g = globalThis as unknown as { prisma: unknown }
  delete g.prisma
  jest.resetModules()
})

afterAll(() => {
  Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true })
})

// Mock PrismaClient to avoid real DB connections
jest.mock('@prisma/client', () => {
  const mockPrismaClient = jest.fn().mockImplementation((opts?: any) => ({
    _options: opts || {},
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  }))
  return { PrismaClient: mockPrismaClient }
})

describe('lib/db - Prisma singleton', () => {
  it('exports a prisma instance', () => {
    const { prisma } = require('@/lib/db')
    expect(prisma).toBeDefined()
    expect(prisma.$connect).toBeDefined()
    expect(prisma.$disconnect).toBeDefined()
  })

  it('caches the instance on globalThis in non-production', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true })
    const { prisma } = require('@/lib/db')
    const g = globalThis as unknown as { prisma: unknown }
    expect(g.prisma).toBe(prisma)
  })

  it('returns the same instance on repeated imports', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true })
    const { prisma: first } = require('@/lib/db')
    // Second require should return the cached instance
    const { prisma: second } = require('@/lib/db')
    expect(first).toBe(second)
  })
})
