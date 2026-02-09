// lib/workflows/node-executors/llm-call.ts
import Anthropic from '@anthropic-ai/sdk'
import { LLMCallNodeData, NodeExecutionResult } from '../types'
import { interpolateTemplate } from '../graph-utils'
import { calculateCost } from '@/lib/governance/logger'

export async function executeLLMCallNode(
  config: LLMCallNodeData,
  input: string
): Promise<NodeExecutionResult> {
  const start = Date.now()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      output: '',
      tokensUsed: 0,
      cost: 0,
      latencyMs: Date.now() - start,
      status: 'failed',
      errorMessage: 'ANTHROPIC_API_KEY not configured',
    }
  }

  const anthropic = new Anthropic({ apiKey })
  const userMessage = interpolateTemplate(config.userPromptTemplate, input)

  try {
    const response = await anthropic.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: config.systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const outputText =
      response.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as Anthropic.TextBlock).text)
        .join('') || ''

    const inputTokens = response.usage.input_tokens
    const outputTokens = response.usage.output_tokens
    const cost = calculateCost(config.model, inputTokens, outputTokens)

    return {
      output: outputText,
      tokensUsed: inputTokens + outputTokens,
      cost,
      latencyMs: Date.now() - start,
      status: 'completed',
      metadata: { model: config.model, inputTokens, outputTokens },
    }
  } catch (error) {
    return {
      output: '',
      tokensUsed: 0,
      cost: 0,
      latencyMs: Date.now() - start,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : String(error),
    }
  }
}
