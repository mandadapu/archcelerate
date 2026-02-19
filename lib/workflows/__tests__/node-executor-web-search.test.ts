/**
 * @jest-environment node
 */

import { executeWebSearchNode } from '../node-executors/web-search'
import type { WebSearchNodeData } from '../types'

const config: WebSearchNodeData = { label: 'Search', queryTemplate: '{{input}}', maxResults: 3 }

describe('executeWebSearchNode', () => {
  const originalEnv = process.env.TAVILY_API_KEY
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.TAVILY_API_KEY = 'test-key'
  })

  afterEach(() => {
    process.env.TAVILY_API_KEY = originalEnv
    global.fetch = originalFetch
  })

  it('fails when TAVILY_API_KEY is missing', async () => {
    delete process.env.TAVILY_API_KEY
    const result = await executeWebSearchNode(config, 'query')
    expect(result.status).toBe('failed')
    expect(result.errorMessage).toContain('not configured')
  })

  it('fails when fetch returns non-ok status', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 403 })
    const result = await executeWebSearchNode(config, 'query')
    expect(result.status).toBe('failed')
    expect(result.errorMessage).toContain('403')
  })

  it('returns message for empty results', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    })
    const result = await executeWebSearchNode(config, 'query')
    expect(result.status).toBe('completed')
    expect(result.output).toBe('No search results found.')
  })

  it('formats results with title, URL, content', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: [
          { title: 'Result 1', url: 'https://example.com', content: 'Content 1' },
        ],
      }),
    })
    const result = await executeWebSearchNode(config, 'query')
    expect(result.status).toBe('completed')
    expect(result.output).toContain('[1] Result 1')
    expect(result.output).toContain('https://example.com')
    expect(result.output).toContain('Content 1')
  })

  it('fails when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
    const result = await executeWebSearchNode(config, 'query')
    expect(result.status).toBe('failed')
    expect(result.errorMessage).toContain('Network error')
  })
})
