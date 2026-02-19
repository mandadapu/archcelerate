/**
 * @jest-environment node
 */

// Mock quiz questions with a known fixture
jest.mock('@/lib/quiz/questions', () => ({
  quizQuestions: [
    {
      id: 'q1',
      type: 'single-choice',
      options: [{ id: 'o1' }, { id: 'o2' }],
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      options: [{ id: 'o3' }, { id: 'o4' }, { id: 'o5' }],
    },
  ],
}))

import { validateQuizAnswers } from '../validation'

describe('validateQuizAnswers', () => {
  it('returns valid for correct answers', () => {
    const answers = [
      { questionId: 'q1', selectedOptions: ['o1'] },
      { questionId: 'q2', selectedOptions: ['o3', 'o4'] },
    ]
    const result = validateQuizAnswers(answers)
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('returns error for wrong answer count', () => {
    const answers = [{ questionId: 'q1', selectedOptions: ['o1'] }]
    const result = validateQuizAnswers(answers)
    expect(result.isValid).toBe(false)
    expect(result.errors[0]).toContain('Expected 2 answers, got 1')
  })

  it('returns error for invalid question ID', () => {
    const answers = [
      { questionId: 'q1', selectedOptions: ['o1'] },
      { questionId: 'invalid', selectedOptions: ['o3'] },
    ]
    const result = validateQuizAnswers(answers)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('Invalid question ID'))).toBe(true)
  })

  it('returns error for invalid option ID', () => {
    const answers = [
      { questionId: 'q1', selectedOptions: ['o1'] },
      { questionId: 'q2', selectedOptions: ['bad_option'] },
    ]
    const result = validateQuizAnswers(answers)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('Invalid options'))).toBe(true)
  })

  it('returns error for single-choice with multiple selections', () => {
    const answers = [
      { questionId: 'q1', selectedOptions: ['o1', 'o2'] },
      { questionId: 'q2', selectedOptions: ['o3'] },
    ]
    const result = validateQuizAnswers(answers)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('only one answer'))).toBe(true)
  })

  it('returns error for empty selection', () => {
    const answers = [
      { questionId: 'q1', selectedOptions: [] },
      { questionId: 'q2', selectedOptions: ['o3'] },
    ]
    const result = validateQuizAnswers(answers)
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('no answer selected'))).toBe(true)
  })
})
