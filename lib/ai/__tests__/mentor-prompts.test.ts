/**
 * @jest-environment node
 */

jest.mock('@/lib/ai/learning-context', () => ({
  formatLearningContextForPrompt: jest.fn(() => 'Mocked context info'),
}))

import { getMentorSystemPrompt, getQuickHelpPrompts } from '../mentor-prompts'
import type { LearningContext } from '@/types/context'

describe('getMentorSystemPrompt', () => {
  it('returns base prompt without context', () => {
    const prompt = getMentorSystemPrompt()
    expect(prompt).toContain('AI mentor')
    expect(prompt).toContain('Core Guidelines')
    expect(prompt).not.toContain('Current Learning Context')
  })

  it('includes context section when context provided', () => {
    const context: LearningContext = {}
    const prompt = getMentorSystemPrompt(context)
    expect(prompt).toContain('Current Learning Context')
    expect(prompt).toContain('Mocked context info')
  })

  it('includes sprint-1 guidance', () => {
    const context: LearningContext = { currentSprint: { id: 'sprint-1', title: 'Sprint 1', conceptsCompleted: [], conceptsTotal: 5, percentComplete: 0 } }
    const prompt = getMentorSystemPrompt(context)
    expect(prompt).toContain('LLM fundamentals')
  })

  it('includes fundamentals tag guidance', () => {
    const context: LearningContext = { currentConcept: { id: 'c1', title: 'Intro', tags: ['fundamentals'], order: 1 } }
    const prompt = getMentorSystemPrompt(context)
    expect(prompt).toContain('beginner-friendly')
  })

  it('includes coding tag guidance', () => {
    const context: LearningContext = { currentConcept: { id: 'c1', title: 'Lab', tags: ['coding'], order: 1 } }
    const prompt = getMentorSystemPrompt(context)
    expect(prompt).toContain('code examples')
  })

  it('includes practical tag guidance', () => {
    const context: LearningContext = { currentConcept: { id: 'c1', title: 'Real', tags: ['practical'], order: 1 } }
    const prompt = getMentorSystemPrompt(context)
    expect(prompt).toContain('real-world')
  })

  it('includes struggling areas', () => {
    const context: LearningContext = { strugglingAreas: ['RAG', 'Agents'] }
    const prompt = getMentorSystemPrompt(context)
    expect(prompt).toContain('RAG')
    expect(prompt).toContain('Agents')
  })

  it('includes foundation-first path guidance', () => {
    const context: LearningContext = { recommendedPath: 'foundation-first' }
    const prompt = getMentorSystemPrompt(context)
    expect(prompt).toContain('fundamentals are solid')
  })

  it('includes fast-track path guidance', () => {
    const context: LearningContext = { recommendedPath: 'fast-track' }
    const prompt = getMentorSystemPrompt(context)
    expect(prompt).toContain('move faster')
  })
})

describe('getQuickHelpPrompts', () => {
  it('returns all 5 prompt keys', () => {
    const prompts = getQuickHelpPrompts()
    expect(Object.keys(prompts)).toHaveLength(5)
    expect(prompts).toHaveProperty('conceptExplanation')
    expect(prompts).toHaveProperty('debugging')
    expect(prompts).toHaveProperty('bestPractices')
    expect(prompts).toHaveProperty('nextSteps')
    expect(prompts).toHaveProperty('realWorld')
  })
})
