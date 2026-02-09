// lib/workflows/node-executors/output.ts
import { OutputNodeData, NodeExecutionResult } from '../types'
import { interpolateTemplate } from '../graph-utils'

export function executeOutputNode(
  config: OutputNodeData,
  input: string
): NodeExecutionResult {
  const start = Date.now()

  const output = config.formatTemplate
    ? interpolateTemplate(config.formatTemplate, input)
    : input

  return {
    output,
    tokensUsed: 0,
    cost: 0,
    latencyMs: Date.now() - start,
    status: 'completed',
  }
}
