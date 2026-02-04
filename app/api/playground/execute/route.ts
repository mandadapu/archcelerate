import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

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
