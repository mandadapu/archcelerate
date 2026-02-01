// tests/api/chat.test.ts
import { describe, it, expect, beforeAll } from 'vitest'

describe('/api/chat', () => {
  let authToken: string

  beforeAll(async () => {
    // TODO: Get auth token from test user
  })

  it('should reject unauthenticated requests', async () => {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Hello' })
    })

    expect(res.status).toBe(401)
  })

  it('should validate input', async () => {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ content: '' }) // Empty content
    })

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid input')
  })

  it('should enforce rate limits', async () => {
    // Send 11 requests (limit is 10/minute)
    const requests = Array(11).fill(null).map((_, i) =>
      fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ content: `Message ${i}` })
      })
    )

    const responses = await Promise.all(requests)
    const lastResponse = responses[10]

    expect(lastResponse.status).toBe(429)
  })

  it('should return chat response with governance metadata', async () => {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ content: 'Hello, how are you?' })
    })

    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data).toHaveProperty('message')
    expect(data).toHaveProperty('conversationId')
    expect(data).toHaveProperty('usage')
    expect(data).toHaveProperty('rateLimit')
    expect(data).toHaveProperty('budget')
  })
})
