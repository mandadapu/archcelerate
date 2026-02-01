// lib/agents/types.ts

export interface Tool {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, {
      type: string
      description: string
      enum?: string[]
    }>
    required: string[]
  }
  execute: (params: Record<string, any>) => Promise<string>
}

export interface AgentStep {
  stepNumber: number
  thought: string
  action: string
  actionInput: Record<string, any>
  observation: string
  tokensUsed: number
  latencyMs: number
}

export interface AgentExecutionResult {
  executionId: string
  output: string
  steps: AgentStep[]
  totalTokens: number
  totalCost: number
  status: 'success' | 'error' | 'timeout' | 'max_iterations'
  errorMessage?: string
}

export interface AgentConfig {
  maxIterations: number
  timeout: number
  stopOnError: boolean
}
