// lib/workflows/workflow-executor.ts
import { createClient } from '@/lib/supabase/server'
import {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowNodeType,
  NodeExecutionResult,
  WorkflowExecutionResult,
  WorkflowExecutorConfig,
  DEFAULT_WORKFLOW_CONFIG,
  LLMCallNodeData,
  RAGQueryNodeData,
  WebSearchNodeData,
  DataTransformNodeData,
  ConditionalNodeData,
  OutputNodeData,
} from './types'
import {
  topologicalSort,
  validateGraph,
  resolveNodeInputs,
  getDownstreamNodes,
} from './graph-utils'
import { executeLLMCallNode } from './node-executors/llm-call'
import { executeRAGQueryNode } from './node-executors/rag-query'
import { executeWebSearchNode } from './node-executors/web-search'
import { executeDataTransformNode } from './node-executors/data-transform'
import { executeConditionalNode } from './node-executors/conditional'
import { executeOutputNode } from './node-executors/output'

export class WorkflowExecutor {
  private userId: string
  private workflowId: string
  private config: WorkflowExecutorConfig
  private executionId: string | null = null
  private nodeResults = new Map<string, NodeExecutionResult>()
  private activeHandles = new Map<string, string>() // conditional node → active handle
  private skippedNodes = new Set<string>()
  private totalTokens = 0
  private totalCost = 0
  private startTime = 0

  constructor(
    userId: string,
    workflowId: string,
    config: Partial<WorkflowExecutorConfig> = {}
  ) {
    this.userId = userId
    this.workflowId = workflowId
    this.config = { ...DEFAULT_WORKFLOW_CONFIG, ...config }
  }

  async execute(
    definition: WorkflowDefinition,
    input: string
  ): Promise<WorkflowExecutionResult> {
    this.startTime = Date.now()
    const supabase = await createClient()

    // Validate graph
    const errors = validateGraph(definition.nodes, definition.edges)
    if (errors.length > 0) {
      return {
        executionId: 'invalid',
        output: '',
        nodeResults: new Map(),
        totalTokens: 0,
        totalCost: 0,
        status: 'failed',
        errorMessage: `Invalid workflow: ${errors.join('; ')}`,
      }
    }

    try {
      // Create execution record
      const { data: execution, error: execError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_id: this.workflowId,
          user_id: this.userId,
          input: { text: input },
          status: 'running',
        })
        .select()
        .single()

      if (execError || !execution) {
        throw new Error(`Failed to create execution: ${execError?.message}`)
      }

      this.executionId = execution.id

      // Topological sort for execution order
      const executionOrder = topologicalSort(definition.nodes, definition.edges)
      const nodeMap = new Map(definition.nodes.map((n) => [n.id, n]))

      // Execute nodes in order
      for (const nodeId of executionOrder) {
        // Check timeout
        if (Date.now() - this.startTime > this.config.timeout) {
          throw new Error('Workflow execution timed out')
        }

        const node = nodeMap.get(nodeId)
        if (!node) continue

        // Skip nodes in inactive branches
        if (this.skippedNodes.has(nodeId)) {
          const skipResult: NodeExecutionResult = {
            output: '',
            tokensUsed: 0,
            cost: 0,
            latencyMs: 0,
            status: 'skipped',
          }
          this.nodeResults.set(nodeId, skipResult)
          await this.recordNodeExecution(nodeId, node, skipResult)
          continue
        }

        // Resolve inputs from upstream nodes
        const nodeInput =
          node.type === 'input'
            ? input
            : resolveNodeInputs(
                nodeId,
                definition.edges,
                this.nodeResults,
                this.activeHandles
              )

        // Mark node as running
        await this.updateNodeStatus(nodeId, node, 'running')

        // Execute the node
        const result = await this.executeNode(node, nodeInput)
        this.nodeResults.set(nodeId, result)
        this.totalTokens += result.tokensUsed
        this.totalCost += result.cost

        // Record result
        await this.recordNodeExecution(nodeId, node, result)

        // Handle conditional branching
        if (node.type === 'conditional' && result.status === 'completed') {
          const branch = (result as NodeExecutionResult & { branch?: string }).branch
          if (branch) {
            this.activeHandles.set(nodeId, branch)
            // Mark nodes in the inactive branch for skipping
            const inactiveBranch = branch === 'true' ? 'false' : 'true'
            const toSkip = getDownstreamNodes(nodeId, definition.edges, inactiveBranch)
            // But don't skip nodes that are also reachable from the active branch
            const toKeep = getDownstreamNodes(nodeId, definition.edges, branch)
            for (const skipId of toSkip) {
              if (!toKeep.has(skipId)) {
                this.skippedNodes.add(skipId)
              }
            }
          }
        }

        // Abort on node failure
        if (result.status === 'failed') {
          throw new Error(
            `Node "${node.data.label}" failed: ${result.errorMessage}`
          )
        }
      }

      // Gather output from output nodes
      const outputNodes = definition.nodes.filter((n) => n.type === 'output')
      const outputs = outputNodes
        .map((n) => this.nodeResults.get(n.id)?.output)
        .filter(Boolean)
      const finalOutput = outputs.join('\n\n')

      // Update execution as completed
      await supabase
        .from('workflow_executions')
        .update({
          output: { text: finalOutput },
          total_tokens: this.totalTokens,
          total_cost: this.totalCost,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', this.executionId)

      return {
        executionId: this.executionId!,
        output: finalOutput,
        nodeResults: this.nodeResults,
        totalTokens: this.totalTokens,
        totalCost: this.totalCost,
        status: 'completed',
      }
    } catch (error) {
      // Update execution as failed
      if (this.executionId) {
        await supabase
          .from('workflow_executions')
          .update({
            status: 'failed',
            error_message:
              error instanceof Error ? error.message : String(error),
            completed_at: new Date().toISOString(),
          })
          .eq('id', this.executionId)
      }

      return {
        executionId: this.executionId || 'unknown',
        output: '',
        nodeResults: this.nodeResults,
        totalTokens: this.totalTokens,
        totalCost: this.totalCost,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      }
    }
  }

  private async executeNode(
    node: WorkflowNode,
    input: string
  ): Promise<NodeExecutionResult> {
    switch (node.type) {
      case 'input':
        return {
          output: input,
          tokensUsed: 0,
          cost: 0,
          latencyMs: 0,
          status: 'completed',
        }

      case 'llm_call':
        return executeLLMCallNode(node.data as LLMCallNodeData, input)

      case 'rag_query':
        return executeRAGQueryNode(
          node.data as RAGQueryNodeData,
          input,
          this.userId
        )

      case 'web_search':
        return executeWebSearchNode(node.data as WebSearchNodeData, input)

      case 'data_transform':
        return executeDataTransformNode(
          node.data as DataTransformNodeData,
          input
        )

      case 'conditional':
        return executeConditionalNode(node.data as ConditionalNodeData, input)

      case 'output':
        return executeOutputNode(node.data as OutputNodeData, input)

      default:
        return {
          output: '',
          tokensUsed: 0,
          cost: 0,
          latencyMs: 0,
          status: 'failed',
          errorMessage: `Unknown node type: ${node.type}`,
        }
    }
  }

  private async recordNodeExecution(
    nodeId: string,
    node: WorkflowNode,
    result: NodeExecutionResult
  ) {
    if (!this.executionId) return
    const supabase = await createClient()

    await supabase.from('workflow_node_executions').insert({
      execution_id: this.executionId,
      node_id: nodeId,
      node_type: node.type,
      node_label: node.data.label,
      status: result.status,
      input: null, // Don't store potentially large inputs
      output: result.output ? { text: result.output.slice(0, 5000) } : null,
      tokens_used: result.tokensUsed,
      cost: result.cost,
      latency_ms: result.latencyMs,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      error_message: result.errorMessage,
    })
  }

  private async updateNodeStatus(
    nodeId: string,
    node: WorkflowNode,
    status: string
  ) {
    if (!this.executionId) return
    // For running status, we insert a pending record that will be updated by recordNodeExecution
    // This is a simplified approach — we skip the intermediate update for MVP
  }
}
