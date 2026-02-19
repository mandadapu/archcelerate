/**
 * @jest-environment node
 */

import { getReviewSystemPrompt, PROJECT_RUBRICS } from '../review-prompts'

describe('PROJECT_RUBRICS', () => {
  it('has rubric for project 1', () => {
    expect(PROJECT_RUBRICS[1]).toBeDefined()
    expect(PROJECT_RUBRICS[1]).toContain('Chat Assistant')
  })
})

describe('getReviewSystemPrompt', () => {
  const files = [
    { path: 'src/app.ts', content: 'console.log("hello")' },
    { path: 'src/utils.ts', content: 'export const x = 1' },
  ]

  it('includes rubric for known project number', () => {
    const prompt = getReviewSystemPrompt(1, files)
    expect(prompt).toContain('Chat Assistant')
    expect(prompt).toContain('Streaming implementation')
  })

  it('falls back for unknown project number', () => {
    const prompt = getReviewSystemPrompt(99, files)
    expect(prompt).toContain('General AI project review')
  })

  it('includes file list with char counts', () => {
    const prompt = getReviewSystemPrompt(1, files)
    expect(prompt).toContain('src/app.ts (20 chars)')
    expect(prompt).toContain('src/utils.ts (18 chars)')
  })

  it('includes JSON format instructions', () => {
    const prompt = getReviewSystemPrompt(1, files)
    expect(prompt).toContain('overall_score')
    expect(prompt).toContain('Scoring Guide')
  })
})
