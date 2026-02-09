// lib/workflows/node-executors/data-transform.ts
import { DataTransformNodeData, NodeExecutionResult } from '../types'
import { interpolateTemplate } from '../graph-utils'

export function executeDataTransformNode(
  config: DataTransformNodeData,
  input: string
): NodeExecutionResult {
  const start = Date.now()

  try {
    let output: string

    switch (config.transformType) {
      case 'template':
        output = interpolateTemplate(config.config, input)
        break

      case 'extract_json': {
        // Extract a field from JSON input using a dot-notation path
        const parsed = JSON.parse(input)
        const path = config.config.split('.')
        let value: unknown = parsed
        for (const key of path) {
          if (value && typeof value === 'object' && key in value) {
            value = (value as Record<string, unknown>)[key]
          } else {
            value = undefined
            break
          }
        }
        output = value !== undefined ? String(value) : ''
        break
      }

      case 'combine':
        // config is the separator; input may have multiple sections separated by \n\n
        output = input.replace(/\n\n/g, config.config || '\n')
        break

      case 'split': {
        // Split input by delimiter and return as numbered items
        const delimiter = config.config || '\n'
        const parts = input.split(delimiter).filter(Boolean)
        output = parts.map((p, i) => `${i + 1}. ${p.trim()}`).join('\n')
        break
      }

      default:
        output = input
    }

    return {
      output,
      tokensUsed: 0,
      cost: 0,
      latencyMs: Date.now() - start,
      status: 'completed',
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
