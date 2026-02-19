/**
 * @jest-environment node
 */

// Mock dependencies to prevent import errors
jest.mock('@/lib/db', () => ({ prisma: {} }))
jest.mock('@/lib/content-loader', () => ({
  getSprintById: jest.fn(),
  getConceptMetadata: jest.fn(),
}))

import { formatLearningContextForPrompt } from '../learning-context'
import type { LearningContext } from '@/types/context'

describe('formatLearningContextForPrompt', () => {
  it('returns empty string for empty context', () => {
    expect(formatLearningContextForPrompt({})).toBe('')
  })

  it('includes sprint info', () => {
    const context: LearningContext = {
      currentSprint: { id: 's1', title: 'LLM Basics', conceptsCompleted: ['c1', 'c2'], conceptsTotal: 5, percentComplete: 40 },
    }
    const result = formatLearningContextForPrompt(context)
    expect(result).toContain('LLM Basics')
    expect(result).toContain('2/5 concepts completed')
    expect(result).toContain('40%')
  })

  it('includes current concept', () => {
    const context: LearningContext = {
      currentConcept: { id: 'c1', title: 'Prompt Engineering', tags: ['fundamentals', 'practical'], order: 2 },
    }
    const result = formatLearningContextForPrompt(context)
    expect(result).toContain('Prompt Engineering')
    expect(result).toContain('fundamentals, practical')
  })

  it('includes recent concepts', () => {
    const context: LearningContext = {
      recentConcepts: [
        { id: 'c1', title: 'Tokens', completedAt: '2026-01-01T00:00:00Z' },
        { id: 'c2', title: 'Embeddings', completedAt: '2026-01-02T00:00:00Z' },
      ],
    }
    const result = formatLearningContextForPrompt(context)
    expect(result).toContain('Tokens')
    expect(result).toContain('Embeddings')
  })

  it('includes struggling areas and recommended path', () => {
    const context: LearningContext = {
      strugglingAreas: ['RAG', 'Agents'],
      recommendedPath: 'foundation-first',
    }
    const result = formatLearningContextForPrompt(context)
    expect(result).toContain('RAG, Agents')
    expect(result).toContain('foundation-first')
  })
})
