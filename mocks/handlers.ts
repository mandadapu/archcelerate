const { http, HttpResponse } = require('msw')

const handlers = [
  // Mock Anthropic API
  http.post('https://api.anthropic.com/v1/messages', () => {
    return HttpResponse.json({
      id: 'msg_test123',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: 'This is a test response from Claude'
        }
      ],
      model: 'claude-3-5-sonnet-20241022',
      usage: {
        input_tokens: 10,
        output_tokens: 20
      }
    })
  }),

  // Mock Tavily Search API
  http.post('https://api.tavily.com/search', () => {
    return HttpResponse.json({
      results: [
        {
          title: 'Test Result',
          url: 'https://example.com',
          content: 'Test search result content'
        }
      ]
    })
  }),

  // Mock OpenAI Embeddings API
  http.post('https://api.openai.com/v1/embeddings', () => {
    return HttpResponse.json({
      data: [
        {
          embedding: new Array(1536).fill(0).map(() => Math.random()),
          index: 0
        }
      ],
      model: 'text-embedding-ada-002',
      usage: {
        prompt_tokens: 8,
        total_tokens: 8
      }
    })
  })
]

module.exports = { handlers }
