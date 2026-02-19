/**
 * @jest-environment node
 */

jest.mock('../constants', () => ({
  RAG_CONFIG: {
    limits: { maxFileSize: 1000 },
    upload: {
      allowedExtensions: ['.pdf', '.txt', '.md'],
      allowedMimeTypes: ['application/pdf', 'text/plain', 'text/markdown'],
    },
    evaluation: { maxRetries: 3 },
  },
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: 'File too large',
    INVALID_FILE_TYPE: 'Invalid file type',
  },
}))

import {
  estimateTokens,
  sanitizeForPrompt,
  parseJSONFromLLM,
  chunkArray,
  createErrorResponse,
  retryLLMCall,
} from '../utils'

describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0)
  })

  it('estimates tokens as ceil(length / 4)', () => {
    expect(estimateTokens('hello')).toBe(2) // ceil(5/4)
    expect(estimateTokens('12345678')).toBe(2) // ceil(8/4)
    expect(estimateTokens('123456789')).toBe(3) // ceil(9/4)
  })
})

describe('sanitizeForPrompt', () => {
  it('removes triple backticks', () => {
    expect(sanitizeForPrompt('before ```code``` after')).toBe('before code after')
  })

  it('trims whitespace', () => {
    expect(sanitizeForPrompt('  hello  ')).toBe('hello')
  })

  it('truncates at 10000 characters', () => {
    const long = 'a'.repeat(15000)
    expect(sanitizeForPrompt(long).length).toBe(10000)
  })
})

describe('parseJSONFromLLM', () => {
  it('parses valid JSON', () => {
    const result = parseJSONFromLLM('{"key": "value"}', { fallback: true })
    expect(result).toEqual({ key: 'value' })
  })

  it('extracts JSON embedded in text', () => {
    const result = parseJSONFromLLM('Here is the result: {"answer": 42} hope that helps', {})
    expect(result).toEqual({ answer: 42 })
  })

  it('returns fallback when no JSON found', () => {
    const fallback = { default: true }
    expect(parseJSONFromLLM('no json here', fallback)).toBe(fallback)
  })

  it('returns fallback on invalid JSON', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const fallback = { default: true }
    expect(parseJSONFromLLM('{invalid json}', fallback)).toBe(fallback)
    jest.restoreAllMocks()
  })
})

describe('chunkArray', () => {
  it('splits evenly', () => {
    expect(chunkArray([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
  })

  it('handles uneven split', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  it('returns empty array for empty input', () => {
    expect(chunkArray([], 3)).toEqual([])
  })

  it('returns single chunk when size >= array length', () => {
    expect(chunkArray([1, 2], 10)).toEqual([[1, 2]])
  })
})

describe('createErrorResponse', () => {
  it('maps auth error to 401', async () => {
    const resp = createErrorResponse('Unauthorized', 'auth')
    expect(resp.status).toBe(401)
    const body = await resp.json()
    expect(body.error).toBe('Unauthorized')
    expect(body.type).toBe('auth')
  })

  it('maps validation to 400', async () => {
    const resp = createErrorResponse('Bad input', 'validation')
    expect(resp.status).toBe(400)
  })

  it('maps rate_limit to 429', async () => {
    const resp = createErrorResponse('Too many', 'rate_limit')
    expect(resp.status).toBe(429)
  })

  it('maps budget to 402', async () => {
    const resp = createErrorResponse('Over budget', 'budget')
    expect(resp.status).toBe(402)
  })

  it('maps server to 500', async () => {
    const resp = createErrorResponse('Internal error', 'server')
    expect(resp.status).toBe(500)
  })
})

describe('retryLLMCall', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns result on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok')
    const result = await retryLLMCall(fn, 3)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on failure then succeeds', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok')
    const result = await retryLLMCall(fn, 3)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('throws after exhausting retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'))
    await expect(retryLLMCall(fn, 2)).rejects.toThrow('always fails')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
