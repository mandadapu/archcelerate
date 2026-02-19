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

jest.mock('@/lib/db', () => ({
  prisma: {},
}))

import Anthropic from '@anthropic-ai/sdk'
import { moderateContent } from '../content-moderator'

const mockCreate = (Anthropic as any).__mockCreate as jest.Mock

describe('moderateContent', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns flagged: false for safe content', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify({
          hate: false,
          sexual: false,
          violence: false,
          self_harm: false,
          harassment: false,
        }),
      }],
    })

    const result = await moderateContent('user-1', 'Hello, how are you?', 'input')

    expect(result.flagged).toBe(false)
    expect(result.action).toBe('allowed')
    expect(result.categories.hate).toBe(false)
  })

  it('returns flagged: true when categories are violated', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify({
          hate: true,
          sexual: false,
          violence: false,
          self_harm: false,
          harassment: true,
        }),
      }],
    })

    const result = await moderateContent('user-1', 'harmful content', 'input')

    expect(result.flagged).toBe(true)
    expect(result.action).toBe('blocked')
    expect(result.categories.hate).toBe(true)
    expect(result.categories.harassment).toBe(true)
  })

  it('fails open on API error (returns allowed)', async () => {
    mockCreate.mockRejectedValue(new Error('API timeout'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const result = await moderateContent('user-1', 'some content', 'input')

    expect(result.flagged).toBe(false)
    expect(result.action).toBe('allowed')
    expect(result.categories).toEqual({
      hate: false,
      sexual: false,
      violence: false,
      self_harm: false,
      harassment: false,
    })
    consoleSpy.mockRestore()
  })

  it('fails open on invalid JSON response', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not valid json' }],
    })
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const result = await moderateContent('user-1', 'content', 'output')

    expect(result.flagged).toBe(false)
    expect(result.action).toBe('allowed')
    consoleSpy.mockRestore()
  })

  it('calls Claude with the correct model', async () => {
    mockCreate.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify({
          hate: false, sexual: false, violence: false,
          self_harm: false, harassment: false,
        }),
      }],
    })

    await moderateContent('user-1', 'test', 'input')

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
      })
    )
  })
})
