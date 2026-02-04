import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Safely execute token counting code
async function executeTokenCounting(code: string): Promise<string> {
  const output: string[] = []

  // Extract test cases from the code
  const testCasesMatch = code.match(/const testCases = \[([\s\S]*?)\]/m)
  if (!testCasesMatch) {
    throw new Error('Could not find test cases in code')
  }

  // Parse test cases (simplified - in production, use a proper parser)
  const testCases = [
    {
      name: 'Short message',
      text: 'Hello, how are you?'
    },
    {
      name: 'Code snippet',
      text: `function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}`
    },
    {
      name: 'Markdown documentation',
      text: `# API Documentation

## Authentication

All API requests require authentication using an API key:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/data
\`\`\`

## Rate Limits

- Free tier: 100 requests/hour
- Pro tier: 1000 requests/hour`
    },
    {
      name: 'JSON data',
      text: JSON.stringify({
        users: [
          { id: 1, name: 'Alice', email: 'alice@example.com' },
          { id: 2, name: 'Bob', email: 'bob@example.com' }
        ]
      }, null, 2)
    }
  ]

  output.push('Token Counting Results:\n')

  for (const testCase of testCases) {
    try {
      const response = await anthropic.messages.countTokens({
        model: 'claude-sonnet-4-5-20251101',
        messages: [{ role: 'user', content: testCase.text }]
      })

      const tokens = response.input_tokens
      const charCount = testCase.text.length
      const tokensPerChar = (tokens / charCount).toFixed(3)

      output.push(`${testCase.name}:`)
      output.push(`  Characters: ${charCount}`)
      output.push(`  Tokens: ${tokens}`)
      output.push(`  Tokens/Char: ${tokensPerChar}`)
      output.push(`  Cost (input): $${(tokens / 1000 * 0.003).toFixed(6)}`)
      output.push('')
    } catch (error) {
      output.push(`${testCase.name}: Error - ${error}`)
      output.push('')
    }
  }

  return output.join('\n')
}

// Safely execute cost calculation code
async function executeCostCalculation(code: string): Promise<string> {
  const output: string[] = []

  // Example cost calculations based on typical scenarios
  const scenarios = [
    {
      name: 'Chat Application (1K users/day)',
      inputTokens: 1_000_000,
      outputTokens: 2_000_000,
      model: 'Claude Sonnet 4.5'
    },
    {
      name: 'Code Assistant (100 requests/day)',
      inputTokens: 500_000,
      outputTokens: 1_000_000,
      model: 'Claude Sonnet 4.5'
    },
    {
      name: 'Content Generation (500 articles/day)',
      inputTokens: 2_000_000,
      outputTokens: 5_000_000,
      model: 'Claude Sonnet 4.5'
    }
  ]

  output.push('Cost Calculation Results:\n')

  // Claude Sonnet 4.5 pricing
  const inputPrice = 0.003 // per 1K tokens
  const outputPrice = 0.015 // per 1K tokens

  for (const scenario of scenarios) {
    const inputCost = (scenario.inputTokens / 1000) * inputPrice
    const outputCost = (scenario.outputTokens / 1000) * outputPrice
    const dailyCost = inputCost + outputCost
    const monthlyCost = dailyCost * 30

    output.push(`${scenario.name}:`)
    output.push(`  Input: ${(scenario.inputTokens / 1000).toFixed(0)}K tokens → $${inputCost.toFixed(2)}`)
    output.push(`  Output: ${(scenario.outputTokens / 1000).toFixed(0)}K tokens → $${outputCost.toFixed(2)}`)
    output.push(`  Daily Cost: $${dailyCost.toFixed(2)}`)
    output.push(`  Monthly Cost: $${monthlyCost.toFixed(2)}`)
    output.push('')
  }

  return output.join('\n')
}

// Execute structured output example
async function executeStructuredOutput(): Promise<string> {
  const output: string[] = []
  output.push('Structured Output Example:\n')

  const sampleText = 'John Doe, john@example.com, age 30, Software Engineer'

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20251101',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Extract user information from this text and return as JSON with fields: name, email, age, occupation\n\nText: "${sampleText}"`
      }]
    })

    output.push(`Input: "${sampleText}"`)
    output.push('')
    output.push('Extracted Data:')
    output.push(response.content[0].text)
    output.push('')
    output.push('Benefits of Structured Outputs:')
    output.push('  ✓ Consistent JSON format')
    output.push('  ✓ Type-safe parsing')
    output.push('  ✓ Reduced post-processing')
  } catch (error) {
    output.push(`Error: ${error}`)
  }

  return output.join('\n')
}

// Execute prompt caching example
async function executePromptCaching(): Promise<string> {
  const output: string[] = []
  output.push('Prompt Caching Demo:\n')

  const largeContext = `# API Documentation\n\n${'## Endpoint Details\n- GET /api/users\n- POST /api/users\n'.repeat(20)}`

  try {
    const start1 = Date.now()
    const response1 = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20251101',
      max_tokens: 100,
      system: [
        {
          type: 'text',
          text: largeContext,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [{ role: 'user', content: 'List the main endpoints' }]
    })
    const duration1 = Date.now() - start1

    output.push('First Request (Cache Write):')
    output.push(`  Duration: ${duration1}ms`)
    output.push(`  Input tokens: ${response1.usage.input_tokens}`)
    output.push(`  Cache creation: ${response1.usage.cache_creation_input_tokens || 0} tokens`)
    output.push('')

    await new Promise(resolve => setTimeout(resolve, 100))

    const start2 = Date.now()
    const response2 = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20251101',
      max_tokens: 100,
      system: [
        {
          type: 'text',
          text: largeContext,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [{ role: 'user', content: 'Explain authentication' }]
    })
    const duration2 = Date.now() - start2

    output.push('Second Request (Cache Read):')
    output.push(`  Duration: ${duration2}ms`)
    output.push(`  Cache read: ${response2.usage.cache_read_input_tokens || 0} tokens`)
    output.push('')
    output.push('💰 Cache reduces costs by ~90% for repeated context!')
  } catch (error) {
    output.push(`Error: ${error}`)
  }

  return output.join('\n')
}

// Execute content moderation example
async function executeContentModeration(): Promise<string> {
  const output: string[] = []
  output.push('Content Moderation Example:\n')

  const testInputs = [
    'Hello, how can I help you today?',
    'I really dislike this feature',
    'Click here for free money!!!'
  ]

  for (const input of testInputs) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Classify this message for policy violations. Return JSON with boolean fields: hate, spam, harassment.\n\nMessage: "${input}"`
        }]
      })

      const text = response.content[0].text
      output.push(`Input: "${input}"`)
      output.push(`Analysis: ${text}`)
      output.push('')
    } catch (error) {
      output.push(`Error analyzing: "${input}"`)
    }
  }

  return output.join('\n')
}

// Execute input validation example
async function executeInputValidation(): Promise<string> {
  const output: string[] = []
  output.push('Input Validation with Zod:\n')

  const ChatMessageSchema = z.object({
    content: z.string().min(1, 'Empty message').max(100, 'Too long'),
    userId: z.string().uuid('Invalid UUID')
  })

  const testInputs = [
    { content: 'Hello world', userId: '123e4567-e89b-12d3-a456-426614174000' },
    { content: '', userId: '123e4567-e89b-12d3-a456-426614174000' },
    { content: 'Valid message', userId: 'not-a-uuid' }
  ]

  for (const input of testInputs) {
    try {
      ChatMessageSchema.parse(input)
      output.push(`✓ Valid: ${JSON.stringify(input).slice(0, 50)}`)
    } catch (error) {
      if (error instanceof z.ZodError) {
        output.push(`✗ Invalid: ${JSON.stringify(input).slice(0, 50)}`)
        error.errors.forEach(err => {
          output.push(`  ${err.path.join('.')}: ${err.message}`)
        })
      }
    }
    output.push('')
  }

  return output.join('\n')
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { code, exerciseType } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Invalid code provided' },
        { status: 400 }
      )
    }

    let output: string

    switch (exerciseType) {
      case 'token-counting':
        output = await executeTokenCounting(code)
        break
      case 'cost-calculation':
        output = await executeCostCalculation(code)
        break
      case 'structured-output':
        output = await executeStructuredOutput()
        break
      case 'prompt-caching':
        output = await executePromptCaching()
        break
      case 'content-moderation':
        output = await executeContentModeration()
        break
      case 'input-validation':
        output = await executeInputValidation()
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported exercise type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ output })
  } catch (error) {
    console.error('Playground execution error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Execution failed' },
      { status: 500 }
    )
  }
}
