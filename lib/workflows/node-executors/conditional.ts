// lib/workflows/node-executors/conditional.ts
import { ConditionalNodeData, NodeExecutionResult } from '../types'

/**
 * Evaluates a condition against the input.
 * Returns 'true' or 'false' as the output string,
 * which determines which branch to follow.
 */
export function executeConditionalNode(
  config: ConditionalNodeData,
  input: string
): NodeExecutionResult & { branch: 'true' | 'false' } {
  const start = Date.now()

  let result: boolean

  switch (config.conditionType) {
    case 'contains':
      result = input.toLowerCase().includes(config.conditionValue.toLowerCase())
      break
    case 'not_contains':
      result = !input.toLowerCase().includes(config.conditionValue.toLowerCase())
      break
    case 'length_gt':
      result = input.length > parseInt(config.conditionValue, 10)
      break
    case 'length_lt':
      result = input.length < parseInt(config.conditionValue, 10)
      break
    case 'equals':
      result = input.trim().toLowerCase() === config.conditionValue.trim().toLowerCase()
      break
    default:
      result = false
  }

  const branch = result ? 'true' : 'false'

  return {
    output: input, // Pass through the input
    tokensUsed: 0,
    cost: 0,
    latencyMs: Date.now() - start,
    status: 'completed',
    branch,
    metadata: { condition: config.conditionType, value: config.conditionValue, result },
  }
}
