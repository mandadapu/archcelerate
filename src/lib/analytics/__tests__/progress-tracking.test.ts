/**
 * @jest-environment node
 */

// Mock Prisma to prevent connection
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({})),
}))

import { calculateProgress, formatDuration } from '../progress-tracking'

describe('calculateProgress', () => {
  it('returns 0 when total is 0', () => {
    expect(calculateProgress(0, 0)).toBe(0)
  })

  it('returns correct percentage', () => {
    expect(calculateProgress(3, 10)).toBe(30)
  })

  it('returns 100 when all completed', () => {
    expect(calculateProgress(10, 10)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(calculateProgress(1, 3)).toBe(33)
  })
})

describe('formatDuration', () => {
  it('formats minutes under 60', () => {
    expect(formatDuration(45)).toBe('45m')
  })

  it('formats exact hours', () => {
    expect(formatDuration(120)).toBe('2h')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m')
  })

  it('formats 1 minute', () => {
    expect(formatDuration(1)).toBe('1m')
  })
})
