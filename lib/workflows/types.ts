// lib/workflows/types.ts

// ============ Node Types ============

export type WorkflowNodeType =
  | 'input'
  | 'llm_call'
  | 'rag_query'
  | 'web_search'
  | 'data_transform'
  | 'conditional'
  | 'output'

export interface InputNodeData {
  label: string
  description: string
}

export interface LLMCallNodeData {
  label: string
  model: 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-5-20250929'
  systemPrompt: string
  userPromptTemplate: string // Use {{input}} for upstream data
  maxTokens: number
  temperature: number
}

export interface RAGQueryNodeData {
  label: string
  queryTemplate: string // Use {{input}} for upstream data
  topK: number
  minRelevance: number
}

export interface WebSearchNodeData {
  label: string
  queryTemplate: string // Use {{input}} for upstream data
  maxResults: number
}

export interface DataTransformNodeData {
  label: string
  transformType: 'extract_json' | 'template' | 'combine' | 'split'
  config: string // JSONPath, template string, separator, or delimiter
}

export interface ConditionalNodeData {
  label: string
  conditionType: 'contains' | 'not_contains' | 'length_gt' | 'length_lt' | 'equals'
  conditionValue: string
}

export interface OutputNodeData {
  label: string
  formatTemplate: string // Optional — use {{input}} for upstream data
}

export type WorkflowNodeData =
  | InputNodeData
  | LLMCallNodeData
  | RAGQueryNodeData
  | WebSearchNodeData
  | DataTransformNodeData
  | ConditionalNodeData
  | OutputNodeData

// ============ Graph Structures ============

export interface WorkflowNode {
  id: string
  type: WorkflowNodeType
  position: { x: number; y: number }
  data: WorkflowNodeData
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string // 'true' | 'false' for conditional nodes
  targetHandle?: string
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

// ============ Database Records ============

export interface Workflow {
  id: string
  user_id: string
  name: string
  description: string | null
  definition: WorkflowDefinition
  status: 'draft' | 'published'
  is_template: boolean
  created_at: string
  updated_at: string
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  user_id: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  input: Record<string, any> | null
  output: Record<string, any> | null
  total_tokens: number
  total_cost: number
  started_at: string
  completed_at: string | null
  error_message: string | null
}

export interface WorkflowNodeExecution {
  id: string
  execution_id: string
  node_id: string
  node_type: WorkflowNodeType
  node_label: string | null
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  input: Record<string, any> | null
  output: Record<string, any> | null
  tokens_used: number
  cost: number
  latency_ms: number
  started_at: string | null
  completed_at: string | null
  error_message: string | null
}

// ============ Execution Results ============

export interface NodeExecutionResult {
  output: string
  tokensUsed: number
  cost: number
  latencyMs: number
  status: 'completed' | 'failed' | 'skipped'
  errorMessage?: string
  metadata?: Record<string, any>
}

export interface WorkflowExecutionResult {
  executionId: string
  output: string
  nodeResults: Map<string, NodeExecutionResult>
  totalTokens: number
  totalCost: number
  status: 'completed' | 'failed'
  errorMessage?: string
}

// ============ Config ============

export interface WorkflowExecutorConfig {
  timeout: number // ms, default 300000 (5 min)
  maxNodes: number // max nodes in a workflow, default 20
}

export const DEFAULT_WORKFLOW_CONFIG: WorkflowExecutorConfig = {
  timeout: 300000,
  maxNodes: 20,
}

// ============ Defaults for Node Data ============

export const DEFAULT_LLM_CALL: LLMCallNodeData = {
  label: 'LLM Call',
  model: 'claude-haiku-4-5-20251001',
  systemPrompt: 'You are a helpful assistant.',
  userPromptTemplate: '{{input}}',
  maxTokens: 1024,
  temperature: 0.7,
}

export const DEFAULT_RAG_QUERY: RAGQueryNodeData = {
  label: 'RAG Query',
  queryTemplate: '{{input}}',
  topK: 5,
  minRelevance: 0.5,
}

export const DEFAULT_WEB_SEARCH: WebSearchNodeData = {
  label: 'Web Search',
  queryTemplate: '{{input}}',
  maxResults: 5,
}

export const DEFAULT_DATA_TRANSFORM: DataTransformNodeData = {
  label: 'Transform',
  transformType: 'template',
  config: '{{input}}',
}

export const DEFAULT_CONDITIONAL: ConditionalNodeData = {
  label: 'Condition',
  conditionType: 'contains',
  conditionValue: '',
}

export const DEFAULT_OUTPUT: OutputNodeData = {
  label: 'Output',
  formatTemplate: '{{input}}',
}

export const DEFAULT_INPUT: InputNodeData = {
  label: 'Input',
  description: 'Workflow input',
}
