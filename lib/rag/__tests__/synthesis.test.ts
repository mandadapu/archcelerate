/**
 * @jest-environment node
 */

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  const mockCreate = jest.fn()
  const MockAnthropic = jest.fn(() => ({
    messages: { create: mockCreate },
  }))
  ;(MockAnthropic as any).__mockCreate = mockCreate
  return MockAnthropic
})

// Mock RAG utilities
jest.mock('../utils', () => ({
  sanitizeForPrompt: jest.fn((input: string) => input),
  parseJSONFromLLM: jest.fn((text: string, fallback: any) => {
    try {
      return JSON.parse(text)
    } catch {
      return fallback
    }
  }),
  getTokenUsage: jest.fn(() => ({ promptTokens: 100, completionTokens: 50 })),
}))

jest.mock('../constants', () => ({
  RAG_CONFIG: {
    models: { synthesis: 'claude-sonnet-4-5-20250929' },
  },
}))

import Anthropic from '@anthropic-ai/sdk'
import { synthesizeFromMultipleSources, detectContradictions } from '../synthesis'
import type { SearchResult } from '../retrieval'

const mockCreate = (Anthropic as any).__mockCreate as jest.Mock

const makeResult = (overrides: Partial<SearchResult> = {}): SearchResult => ({
  chunkId: 'chunk-1',
  documentId: 'doc-1',
  content: 'some content',
  relevanceScore: 0.9,
  metadata: {},
  ...overrides,
})

describe('synthesizeFromMultipleSources', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls Claude and returns parsed synthesis result', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify({
          answer: 'Synthesized answer from [Source 1]',
          confidence: 0.85,
          sources: ['Source 1'],
        }),
      }],
      usage: { input_tokens: 100, output_tokens: 50 },
    })

    const results = [
      makeResult({ documentId: 'doc-1', content: 'First source info' }),
      makeResult({ documentId: 'doc-2', content: 'Second source info' }),
    ]

    const synthesis = await synthesizeFromMultipleSources('What is X?', results)

    expect(synthesis.answer).toBe('Synthesized answer from [Source 1]')
    expect(synthesis.confidence).toBe(0.85)
    expect(synthesis.tokenUsage).toEqual({ input: 100, output: 50 })
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'claude-sonnet-4-5-20250929' })
    )
  })

  it('groups results by document in the prompt context', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"answer":"test","confidence":0.5,"sources":[]}' }],
      usage: { input_tokens: 50, output_tokens: 25 },
    })

    const results = [
      makeResult({ documentId: 'doc-1', content: 'chunk A' }),
      makeResult({ documentId: 'doc-1', content: 'chunk B' }),
      makeResult({ documentId: 'doc-2', content: 'chunk C' }),
    ]

    await synthesizeFromMultipleSources('query', results)

    // Verify the prompt groups by document
    const callArgs = mockCreate.mock.calls[0][0]
    const prompt = callArgs.messages[0].content
    expect(prompt).toContain('Source 1')
    expect(prompt).toContain('Source 2')
    expect(prompt).toContain('chunk A')
    expect(prompt).toContain('chunk C')
  })

  it('uses fallback when LLM returns invalid JSON', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'This is not JSON, just a plain text answer' }],
      usage: { input_tokens: 50, output_tokens: 25 },
    })

    const results = [makeResult({ documentId: 'doc-1' })]
    const synthesis = await synthesizeFromMultipleSources('query', results)

    // Fallback values
    expect(synthesis.answer).toBe('This is not JSON, just a plain text answer')
    expect(synthesis.confidence).toBe(0.5)
  })
})

describe('detectContradictions', () => {
  it('returns empty array for non-contradictory sources', () => {
    const results = [
      makeResult({ content: 'The system works efficiently with large datasets' }),
      makeResult({ content: 'Performance improves significantly with caching enabled' }),
    ]

    const contradictions = detectContradictions(results)
    expect(contradictions).toEqual([])
  })

  it('detects contradiction when one source has negation and they share 3+ words', () => {
    const results = [
      makeResult({ content: 'The system works efficiently with large datasets every time' }),
      makeResult({ content: 'The system does not work efficiently with large datasets anymore' }),
    ]

    const contradictions = detectContradictions(results)
    expect(contradictions.length).toBeGreaterThan(0)
    expect(contradictions[0]).toContain('Potential contradiction')
  })

  it('ignores negation difference when insufficient common words', () => {
    const results = [
      makeResult({ content: 'The cat sat on the mat' }),
      makeResult({ content: 'The dog does not bark loudly at night' }),
    ]

    const contradictions = detectContradictions(results)
    expect(contradictions).toEqual([])
  })

  it('handles single result with no contradictions', () => {
    const results = [makeResult({ content: 'Only one source' })]
    const contradictions = detectContradictions(results)
    expect(contradictions).toEqual([])
  })
})
