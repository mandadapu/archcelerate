/**
 * @jest-environment node
 */

// Mock Prisma to prevent connection attempts (we only test pure functions)
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({})),
}))

import { getProficiencyLevel, getProficiencyLevelInfo } from '../skill-scoring'

describe('getProficiencyLevel', () => {
  it('returns junior for 0', () => {
    expect(getProficiencyLevel(0)).toBe('junior')
  })

  it('returns junior for 60', () => {
    expect(getProficiencyLevel(60)).toBe('junior')
  })

  it('returns mid for 61', () => {
    expect(getProficiencyLevel(61)).toBe('mid')
  })

  it('returns mid for 80', () => {
    expect(getProficiencyLevel(80)).toBe('mid')
  })

  it('returns lead for 81', () => {
    expect(getProficiencyLevel(81)).toBe('lead')
  })

  it('returns lead for 95', () => {
    expect(getProficiencyLevel(95)).toBe('lead')
  })

  it('returns architect for 96', () => {
    expect(getProficiencyLevel(96)).toBe('architect')
  })

  it('returns architect for 100', () => {
    expect(getProficiencyLevel(100)).toBe('architect')
  })
})

describe('getProficiencyLevelInfo', () => {
  it('returns correct info for junior', () => {
    const info = getProficiencyLevelInfo('junior')
    expect(info.label).toBe('Junior')
    expect(info.range).toBe('0-60')
  })

  it('returns correct info for mid', () => {
    const info = getProficiencyLevelInfo('mid')
    expect(info.label).toBe('Mid-Level')
    expect(info.range).toBe('61-80')
  })

  it('returns correct info for lead', () => {
    const info = getProficiencyLevelInfo('lead')
    expect(info.label).toBe('Technical Lead')
    expect(info.range).toBe('81-95')
  })

  it('returns correct info for architect', () => {
    const info = getProficiencyLevelInfo('architect')
    expect(info.label).toBe('AI Architect')
    expect(info.range).toBe('96-100')
    expect(info.color).toBe('#a78bfa')
  })
})
