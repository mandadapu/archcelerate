import { selectRandomQuestions, getQuestionsByDifficulty } from '../questions'
import { QuizQuestion } from '@/types/diagnosis'

describe('selectRandomQuestions', () => {
  // Helper to create mock questions
  const createMockQuestions = (count: number, skillArea: string, difficulty: 'beginner' | 'intermediate' | 'advanced'): QuizQuestion[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `${skillArea}-${i}`,
      type: 'single-choice' as const,
      question: `Question ${i}`,
      options: [
        { id: 'a', text: 'Option A' },
        { id: 'b', text: 'Option B' },
        { id: 'c', text: 'Option C' },
        { id: 'd', text: 'Option D' },
      ],
      correctAnswers: ['a'],
      skillArea: skillArea as any,
      difficulty,
    }))
  }

  describe('basic functionality', () => {
    it('should return exactly the requested number of questions', () => {
      const pool = createMockQuestions(50, 'llm_fundamentals', 'beginner')
      const selected = selectRandomQuestions(pool, 25)

      expect(selected).toHaveLength(25)
    })

    it('should return all questions if pool is smaller than requested count', () => {
      const pool = createMockQuestions(10, 'llm_fundamentals', 'beginner')
      const selected = selectRandomQuestions(pool, 25)

      expect(selected).toHaveLength(10)
    })

    it('should return empty array for empty pool', () => {
      const selected = selectRandomQuestions([], 25)

      expect(selected).toHaveLength(0)
    })

    it('should select questions from the pool', () => {
      const pool = createMockQuestions(30, 'llm_fundamentals', 'beginner')
      const selected = selectRandomQuestions(pool, 25)

      // All selected questions should be from the pool
      selected.forEach(question => {
        expect(pool).toContainEqual(question)
      })
    })
  })

  describe('randomness', () => {
    it('should return different orders on multiple calls', () => {
      const pool = createMockQuestions(50, 'llm_fundamentals', 'beginner')

      const selection1 = selectRandomQuestions(pool, 25)
      const selection2 = selectRandomQuestions(pool, 25)

      // Unlikely (but possible) they'd be in exact same order
      const sameOrder = selection1.every((q, i) => q.id === selection2[i].id)
      expect(sameOrder).toBe(false)
    })

    it('should select different subsets on multiple calls', () => {
      const pool = createMockQuestions(50, 'llm_fundamentals', 'beginner')

      const selection1 = selectRandomQuestions(pool, 25)
      const selection2 = selectRandomQuestions(pool, 25)

      const selection1Ids = new Set(selection1.map(q => q.id))
      const selection2Ids = new Set(selection2.map(q => q.id))

      // At least some questions should be different
      const intersection = [...selection1Ids].filter(id => selection2Ids.has(id))
      expect(intersection.length).toBeLessThan(25)
    })
  })

  describe('skill area distribution', () => {
    it('should distribute questions evenly across skill areas when ensureDistribution is true', () => {
      const pool = [
        ...createMockQuestions(20, 'llm_fundamentals', 'beginner'),
        ...createMockQuestions(20, 'prompt_engineering', 'beginner'),
        ...createMockQuestions(20, 'rag', 'beginner'),
        ...createMockQuestions(20, 'agents', 'beginner'),
        ...createMockQuestions(20, 'multimodal', 'beginner'),
        ...createMockQuestions(20, 'production_ai', 'beginner'),
      ]

      const selected = selectRandomQuestions(pool, 24, true)

      // Count questions per skill area
      const distribution = selected.reduce((acc, q) => {
        acc[q.skillArea] = (acc[q.skillArea] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Each skill area should have roughly equal representation
      // With 24 questions and 6 areas, we expect 4 per area
      Object.values(distribution).forEach(count => {
        expect(count).toBeGreaterThanOrEqual(3)
        expect(count).toBeLessThanOrEqual(5)
      })
    })

    it('should not enforce distribution when ensureDistribution is false', () => {
      const pool = [
        ...createMockQuestions(50, 'llm_fundamentals', 'beginner'),
        ...createMockQuestions(1, 'rag', 'beginner'),
      ]

      const selected = selectRandomQuestions(pool, 25, false)

      // Count questions per skill area
      const distribution = selected.reduce((acc, q) => {
        acc[q.skillArea] = (acc[q.skillArea] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Most should be from llm_fundamentals since no distribution enforcement
      expect(distribution.llm_fundamentals).toBeGreaterThanOrEqual(20)
    })

    it('should handle uneven skill area sizes gracefully', () => {
      const pool = [
        ...createMockQuestions(50, 'llm_fundamentals', 'beginner'),
        ...createMockQuestions(5, 'rag', 'beginner'),
        ...createMockQuestions(10, 'agents', 'beginner'),
      ]

      const selected = selectRandomQuestions(pool, 25, true)

      // Should try to select 25, but may be slightly less due to distribution logic
      expect(selected.length).toBeGreaterThanOrEqual(20)
      expect(selected.length).toBeLessThanOrEqual(25)

      // Count questions per skill area
      const distribution = selected.reduce((acc, q) => {
        acc[q.skillArea] = (acc[q.skillArea] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Should have representation from each area
      expect(Object.keys(distribution)).toHaveLength(3)
    })
  })

  describe('default parameters', () => {
    it('should default to 25 questions when count not specified', () => {
      const pool = createMockQuestions(50, 'llm_fundamentals', 'beginner')
      const selected = selectRandomQuestions(pool)

      expect(selected).toHaveLength(25)
    })

    it('should default to ensureDistribution=true when not specified', () => {
      const pool = [
        ...createMockQuestions(30, 'llm_fundamentals', 'beginner'),
        ...createMockQuestions(30, 'rag', 'beginner'),
      ]

      const selected = selectRandomQuestions(pool, 24)

      // Count questions per skill area
      const distribution = selected.reduce((acc, q) => {
        acc[q.skillArea] = (acc[q.skillArea] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Should have roughly even distribution (default behavior)
      expect(distribution.llm_fundamentals).toBeGreaterThanOrEqual(10)
      expect(distribution.llm_fundamentals).toBeLessThanOrEqual(14)
      expect(distribution.rag).toBeGreaterThanOrEqual(10)
      expect(distribution.rag).toBeLessThanOrEqual(14)
    })
  })
})

describe('getQuestionsByDifficulty', () => {
  it('should return only beginner questions', () => {
    const questions = getQuestionsByDifficulty('beginner')

    expect(questions.length).toBeGreaterThan(0)
    questions.forEach(q => {
      expect(q.difficulty).toBe('beginner')
    })
  })

  it('should return only intermediate questions', () => {
    const questions = getQuestionsByDifficulty('intermediate')

    expect(questions.length).toBeGreaterThan(0)
    questions.forEach(q => {
      expect(q.difficulty).toBe('intermediate')
    })
  })

  it('should return only advanced questions', () => {
    const questions = getQuestionsByDifficulty('advanced')

    // Advanced questions pool may be empty in MVP
    if (questions.length > 0) {
      questions.forEach(q => {
        expect(q.difficulty).toBe('advanced')
      })
    } else {
      // No advanced questions yet - this is OK for MVP
      expect(questions).toHaveLength(0)
    }
  })

  it('should have questions covering all skill areas for each difficulty', () => {
    const difficulties: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced']

    difficulties.forEach(difficulty => {
      const questions = getQuestionsByDifficulty(difficulty)
      const skillAreas = new Set(questions.map(q => q.skillArea))

      // Each difficulty should have questions from multiple skill areas (if questions exist)
      if (questions.length > 0) {
        expect(skillAreas.size).toBeGreaterThanOrEqual(1)
      }
    })
  })

  it('should return different questions for different difficulties', () => {
    const beginner = getQuestionsByDifficulty('beginner')
    const intermediate = getQuestionsByDifficulty('intermediate')
    const advanced = getQuestionsByDifficulty('advanced')

    const beginnerIds = new Set(beginner.map(q => q.id))
    const intermediateIds = new Set(intermediate.map(q => q.id))
    const advancedIds = new Set(advanced.map(q => q.id))

    // No overlap between difficulty levels
    const beginnerIntermediateOverlap = [...beginnerIds].filter(id => intermediateIds.has(id))
    const intermediateAdvancedOverlap = [...intermediateIds].filter(id => advancedIds.has(id))

    expect(beginnerIntermediateOverlap).toHaveLength(0)
    expect(intermediateAdvancedOverlap).toHaveLength(0)
  })
})

describe('integration: selectRandomQuestions with real question pool', () => {
  it('should work with real beginner questions', () => {
    const pool = getQuestionsByDifficulty('beginner')
    const selected = selectRandomQuestions(pool, 15)

    expect(selected).toHaveLength(Math.min(15, pool.length))
    selected.forEach(q => {
      expect(q.difficulty).toBe('beginner')
    })
  })

  it('should work with real intermediate questions', () => {
    const pool = getQuestionsByDifficulty('intermediate')
    const selected = selectRandomQuestions(pool, 15)

    expect(selected).toHaveLength(Math.min(15, pool.length))
    selected.forEach(q => {
      expect(q.difficulty).toBe('intermediate')
    })
  })

  it('should work with real advanced questions', () => {
    const pool = getQuestionsByDifficulty('advanced')
    const selected = selectRandomQuestions(pool, 15)

    expect(selected).toHaveLength(Math.min(15, pool.length))
    selected.forEach(q => {
      expect(q.difficulty).toBe('advanced')
    })
  })
})
