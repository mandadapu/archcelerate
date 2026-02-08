// lib/agents/agent-executor.ts
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { calculateCost } from '@/lib/governance/logger'
import { Tool, AgentStep, AgentExecutionResult, AgentConfig } from './types'

const DEFAULT_CONFIG: AgentConfig = {
  maxIterations: 10,
  timeout: 300000, // 5 minutes
  stopOnError: false
}

export class AgentExecutor {
  private userId: string
  private agentDefinitionId: string
  private systemPrompt: string
  private tools: Tool[]
  private config: AgentConfig
  private anthropic: Anthropic
  private executionId: string | null = null
  private steps: AgentStep[] = []
  private totalTokens = 0
  private totalCost = 0
  private startTime: number = 0

  constructor(
    userId: string,
    agentDefinitionId: string,
    systemPrompt: string,
    tools: Tool[],
    config: Partial<AgentConfig> = {}
  ) {
    this.userId = userId
    this.agentDefinitionId = agentDefinitionId
    this.systemPrompt = systemPrompt
    this.tools = tools
    this.config = { ...DEFAULT_CONFIG, ...config }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    this.anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: process.env.NODE_ENV === 'test'
    })
  }

  async execute(input: string): Promise<AgentExecutionResult> {
    this.startTime = Date.now()
    const supabase = await createClient()

    try {
      // Create execution record
      const { data: execution, error: execError } = await supabase
        .from('agent_executions')
        .insert({
          user_id: this.userId,
          agent_definition_id: this.agentDefinitionId,
          input,
          status: 'running'
        })
        .select()
        .single()

      if (execError || !execution) {
        throw new Error(`Failed to create execution record: ${execError?.message}`)
      }

      this.executionId = execution.id

      // Run ReAct loop
      const result = await this.runReActLoop(input)

      // Update execution record
      await supabase
        .from('agent_executions')
        .update({
          output: result.output,
          total_tokens: result.totalTokens,
          total_cost: result.totalCost,
          status: result.status,
          error_message: result.errorMessage,
          completed_at: new Date().toISOString()
        })
        .eq('id', this.executionId)

      return result
    } catch (error) {
      // Update execution as failed
      if (this.executionId) {
        await supabase
          .from('agent_executions')
          .update({
            status: 'error',
            error_message: error instanceof Error ? error.message : String(error),
            completed_at: new Date().toISOString()
          })
          .eq('id', this.executionId)
      }

      return {
        executionId: this.executionId || 'unknown',
        output: '',
        steps: this.steps,
        totalTokens: this.totalTokens,
        totalCost: this.totalCost,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private async runReActLoop(input: string): Promise<AgentExecutionResult> {
    let currentInput = input
    let iteration = 0
    let finalOutput = ''

    const conversationHistory: Array<{
      role: 'user' | 'assistant'
      content: string | Array<any>
    }> = [
      {
        role: 'user',
        content: input
      }
    ]

    while (iteration < this.config.maxIterations) {
      // Check timeout
      if (Date.now() - this.startTime > this.config.timeout) {
        return {
          executionId: this.executionId!,
          output: finalOutput || 'Execution timed out',
          steps: this.steps,
          totalTokens: this.totalTokens,
          totalCost: this.totalCost,
          status: 'timeout'
        }
      }

      iteration++

      try {
        // Get next action from Claude
        const actionResult = await this.getNextAction(conversationHistory)

        if (!actionResult) {
          throw new Error('Failed to get action from Claude')
        }

        const { action, actionInput, thought, tokensUsed, latency, assistantContent } = actionResult

        // Check if agent wants to finish
        if (action === 'finish') {
          finalOutput = actionInput.output || actionInput.answer || 'Task completed'

          // Record final step
          const step: AgentStep = {
            stepNumber: iteration,
            thought,
            action: 'finish',
            actionInput,
            observation: 'Task completed',
            tokensUsed,
            latencyMs: latency
          }
          this.steps.push(step)
          await this.recordStep(step)

          return {
            executionId: this.executionId!,
            output: finalOutput,
            steps: this.steps,
            totalTokens: this.totalTokens,
            totalCost: this.totalCost,
            status: 'success'
          }
        }

        // Execute tool
        const tool = this.tools.find(t => t.name === action)
        if (!tool) {
          const errorMsg = `Tool '${action}' not found`
          const step: AgentStep = {
            stepNumber: iteration,
            thought,
            action,
            actionInput,
            observation: errorMsg,
            tokensUsed,
            latencyMs: latency
          }
          this.steps.push(step)
          await this.recordStep(step)

          if (this.config.stopOnError) {
            return {
              executionId: this.executionId!,
              output: errorMsg,
              steps: this.steps,
              totalTokens: this.totalTokens,
              totalCost: this.totalCost,
              status: 'error',
              errorMessage: errorMsg
            }
          }

          // Add error to conversation and continue
          conversationHistory.push({
            role: 'assistant',
            content: assistantContent
          })
          conversationHistory.push({
            role: 'user',
            content: `Error: ${errorMsg}. Please try a different approach.`
          })
          continue
        }

        // Execute tool and get observation
        const toolStartTime = Date.now()
        let observation: string

        try {
          observation = await tool.execute(actionInput)

          // Record tool call
          await this.recordToolCall(tool.name, actionInput, observation, Date.now() - toolStartTime)
        } catch (error) {
          observation = `Error executing tool: ${error instanceof Error ? error.message : String(error)}`

          if (this.config.stopOnError) {
            return {
              executionId: this.executionId!,
              output: observation,
              steps: this.steps,
              totalTokens: this.totalTokens,
              totalCost: this.totalCost,
              status: 'error',
              errorMessage: observation
            }
          }
        }

        // Record step
        const step: AgentStep = {
          stepNumber: iteration,
          thought,
          action,
          actionInput,
          observation,
          tokensUsed,
          latencyMs: latency
        }
        this.steps.push(step)
        await this.recordStep(step)

        // Add to conversation history
        conversationHistory.push({
          role: 'assistant',
          content: assistantContent
        })
        conversationHistory.push({
          role: 'user',
          content: observation
        })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)

        if (this.config.stopOnError) {
          return {
            executionId: this.executionId!,
            output: errorMsg,
            steps: this.steps,
            totalTokens: this.totalTokens,
            totalCost: this.totalCost,
            status: 'error',
            errorMessage: errorMsg
          }
        }

        // Add error to conversation and continue
        conversationHistory.push({
          role: 'user',
          content: `An error occurred: ${errorMsg}. Please try a different approach.`
        })
      }
    }

    // Max iterations reached
    return {
      executionId: this.executionId!,
      output: finalOutput || 'Max iterations reached without completion',
      steps: this.steps,
      totalTokens: this.totalTokens,
      totalCost: this.totalCost,
      status: 'max_iterations'
    }
  }

  private async getNextAction(conversationHistory: Array<{ role: 'user' | 'assistant'; content: string | Array<any> }>) {
    const startTime = Date.now()

    // Convert tools to Anthropic function calling format
    const toolDefinitions = this.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters
    }))

    // Add finish tool
    toolDefinitions.push({
      name: 'finish',
      description: 'Call this when you have completed the task and have a final answer',
      input_schema: {
        type: 'object',
        properties: {
          output: {
            type: 'string',
            description: 'The final output or answer'
          }
        },
        required: ['output']
      }
    })

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: this.systemPrompt,
        messages: conversationHistory,
        tools: toolDefinitions
      })

      const latency = Date.now() - startTime
      const tokensUsed = response.usage.input_tokens + response.usage.output_tokens
      const cost = calculateCost(
        'claude-sonnet-4-5-20250929',
        response.usage.input_tokens,
        response.usage.output_tokens
      )

      this.totalTokens += tokensUsed
      this.totalCost += cost

      // Extract thought and action
      let thought = ''
      let action = ''
      let actionInput: Record<string, any> = {}

      // Find text content (thought) and tool use
      for (const block of response.content) {
        if (block.type === 'text') {
          thought = block.text
        } else if (block.type === 'tool_use') {
          action = block.name
          actionInput = block.input as Record<string, any>
        }
      }

      if (!action) {
        throw new Error('No action found in Claude response')
      }

      return {
        action,
        actionInput,
        thought,
        tokensUsed,
        latency,
        assistantContent: response.content
      }
    } catch (error) {
      throw new Error(`Failed to get action from Claude: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async recordStep(step: AgentStep) {
    if (!this.executionId) return

    const supabase = await createClient()
    await supabase.from('agent_steps').insert({
      execution_id: this.executionId,
      step_number: step.stepNumber,
      thought: step.thought,
      action: step.action,
      action_input: step.actionInput,
      observation: step.observation,
      tokens_used: step.tokensUsed,
      latency_ms: step.latencyMs
    })
  }

  private async recordToolCall(
    toolName: string,
    input: Record<string, any>,
    output: string,
    latencyMs: number
  ) {
    if (!this.executionId) return

    const supabase = await createClient()
    await supabase.from('tool_calls').insert({
      execution_id: this.executionId,
      tool_name: toolName,
      input,
      output,
      latency_ms: latencyMs,
      status: output.startsWith('Error') ? 'error' : 'success'
    })
  }
}
