/**
 * @jest-environment node
 */

jest.mock('@anthropic-ai/sdk', () => {
  const mockCreate = jest.fn()
  const MockAnthropic = jest.fn(() => ({
    messages: { create: mockCreate },
  }))
  ;(MockAnthropic as any).__mockCreate = mockCreate
  return MockAnthropic
})

jest.mock('../utils', () => ({
  sanitizeForPrompt: jest.fn((s: string) => s),
  retryLLMCall: jest.fn((fn: () => Promise<number>) => fn()),
}))

jest.mock('../constants', () => ({
  RAG_CONFIG: {
    models: { evaluation: 'claude-haiku-4-5-20251001' },
    evaluation: { temperature: 0, passThreshold: 0.7 },
  },
}))

import Anthropic from '@anthropic-ai/sdk'
import {
  evaluateFaithfulness,
  evaluateRelevance,
  evaluateCoverage,
  evaluateRAGResponse,
  createTestDataset,
} from '../evaluation'
import type { SearchResult } from '../retrieval'

const mockCreate = (Anthropic as any).__mockCreate as jest.Mock

const makeChunks = (scores: number[]): SearchResult[] =>
  scores.map((s, i) => ({
    chunkId: `c${i}`,
    documentId: `d${i}`,
    content: `content ${i}`,
    relevanceScore: s,
    metadata: {},
  }))

describe('evaluateRelevance (pure)', () => {
  it('returns 0 for empty chunks', async () => {
    expect(await evaluateRelevance('query', [])).toBe(0)
  })

  it('returns average relevance score', async () => {
    const chunks = makeChunks([0.8, 0.6])
    expect(await evaluateRelevance('query', chunks)).toBeCloseTo(0.7)
  })
})

describe('createTestDataset', () => {
  it('returns 8 entries with question and groundTruth', () => {
    const dataset = createTestDataset()
    expect(dataset).toHaveLength(8)
    for (const entry of dataset) {
      expect(entry.question).toBeTruthy()
      expect(entry.groundTruth).toBeTruthy()
    }
  })
})

describe('evaluateFaithfulness', () => {
  beforeEach(() => jest.clearAllMocks())

  it('parses valid score from API', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '0.85' }],
    })
    const result = await evaluateFaithfulness('answer', makeChunks([0.9]))
    expect(result).toBeCloseTo(0.85)
  })

  it('returns 0.5 fallback for NaN response', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not a number' }],
    })
    const result = await evaluateFaithfulness('answer', makeChunks([0.9]))
    expect(result).toBe(0.5)
  })
})

describe('evaluateCoverage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls Claude without ground truth', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '0.9' }],
    })
    const result = await evaluateCoverage('question', 'answer')
    expect(result).toBeCloseTo(0.9)
    expect(mockCreate).toHaveBeenCalledTimes(1)
    const prompt = mockCreate.mock.calls[0][0].messages[0].content
    expect(prompt).toContain('question')
    expect(prompt).not.toContain('Ground Truth')
  })

  it('calls Claude with ground truth comparison', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '0.75' }],
    })
    const result = await evaluateCoverage('question', 'answer', 'expected')
    expect(result).toBeCloseTo(0.75)
    const prompt = mockCreate.mock.calls[0][0].messages[0].content
    expect(prompt).toContain('Ground Truth')
  })
})

describe('evaluateRAGResponse', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns aggregate metrics with overall average', async () => {
    // faithfulness and coverage both call the API
    mockCreate
      .mockResolvedValueOnce({ content: [{ type: 'text', text: '0.8' }] }) // faithfulness
      .mockResolvedValueOnce({ content: [{ type: 'text', text: '0.7' }] }) // coverage

    const chunks = makeChunks([0.9]) // relevance = 0.9
    const result = await evaluateRAGResponse('q', 'a', chunks)

    expect(result.faithfulness).toBeCloseTo(0.8)
    expect(result.relevance).toBeCloseTo(0.9)
    expect(result.coverage).toBeCloseTo(0.7)
    expect(result.overall).toBeCloseTo((0.8 + 0.9 + 0.7) / 3)
  })
})
