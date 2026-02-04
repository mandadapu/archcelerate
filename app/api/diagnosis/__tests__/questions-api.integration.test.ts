/**
 * Integration tests for the diagnosis questions API
 * Tests multi-level question retrieval
 */

import { GET } from '../questions/route'
import { NextRequest } from 'next/server'

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
  }))
})

// Mock Anthropic
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: '[]' }],
      }),
    },
  }))
})

describe('GET /api/diagnosis/questions', () => {
  describe('level parameter handling', () => {
    it('should accept beginner level parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/diagnosis/questions?level=beginner')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.questions).toBeDefined()
      expect(Array.isArray(data.questions)).toBe(true)
      expect(data.level).toBe('beginner')
    })

    it('should accept intermediate level parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/diagnosis/questions?level=intermediate')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.questions).toBeDefined()
      expect(data.level).toBe('intermediate')
    })

    it('should accept advanced level parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/diagnosis/questions?level=advanced')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.questions).toBeDefined()
      expect(data.level).toBe('advanced')
    })

    it('should default to intermediate when level not specified', async () => {
      const request = new NextRequest('http://localhost:3000/api/diagnosis/questions')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.level).toBe('intermediate')
    })

    it('should reject invalid difficulty level', async () => {
      const request = new NextRequest('http://localhost:3000/api/diagnosis/questions?level=expert')
      const response = await GET(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid difficulty level')
    })
  })

  describe('question selection', () => {
    it('should return fallback questions when cache and generation fail', async () => {
      const request = new NextRequest('http://localhost:3000/api/diagnosis/questions?level=beginner')
      const response = await GET(request)
      const data = await response.json()

      expect(data.questions).toBeDefined()
      expect(data.questions.length).toBeGreaterThan(0)
      expect(data.source).toBe('fallback')
    })

    it('should return different questions for beginner and intermediate levels', async () => {
      const requestBeginner = new NextRequest('http://localhost:3000/api/diagnosis/questions?level=beginner')
      const responseBeginner = await GET(requestBeginner)
      const dataBeginner = await responseBeginner.json()

      const requestIntermediate = new NextRequest('http://localhost:3000/api/diagnosis/questions?level=intermediate')
      const responseIntermediate = await GET(requestIntermediate)
      const dataIntermediate = await responseIntermediate.json()

      const beginnerIds = new Set(dataBeginner.questions.map((q: any) => q.id))
      const intermediateIds = new Set(dataIntermediate.questions.map((q: any) => q.id))

      // Should have no overlap (different difficulty levels)
      const overlap = [...beginnerIds].filter(id => intermediateIds.has(id))
      expect(overlap.length).toBe(0)
    })

    it('should return questions with correct structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/diagnosis/questions?level=intermediate')
      const response = await GET(request)
      const data = await response.json()

      const question = data.questions[0]
      expect(question).toHaveProperty('id')
      expect(question).toHaveProperty('type')
      expect(question).toHaveProperty('question')
      expect(question).toHaveProperty('options')
      expect(question).toHaveProperty('correctAnswers')
      expect(question).toHaveProperty('skillArea')
      expect(question).toHaveProperty('difficulty')
    })
  })

  describe('randomization', () => {
    it('should return questions in random order on subsequent requests', async () => {
      const request1 = new NextRequest('http://localhost:3000/api/diagnosis/questions?level=intermediate')
      const response1 = await GET(request1)
      const data1 = await response1.json()

      const request2 = new NextRequest('http://localhost:3000/api/diagnosis/questions?level=intermediate')
      const response2 = await GET(request2)
      const data2 = await response2.json()

      // Questions should be in different orders
      const ids1 = data1.questions.map((q: any) => q.id)
      const ids2 = data2.questions.map((q: any) => q.id)

      // Unlikely to be in exact same order if randomized
      const sameOrder = ids1.every((id: string, i: number) => id === ids2[i])
      expect(sameOrder).toBe(false)
    })
  })
})
