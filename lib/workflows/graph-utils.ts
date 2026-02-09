// lib/workflows/graph-utils.ts
import { WorkflowNode, WorkflowEdge, NodeExecutionResult } from './types'

/**
 * Topological sort using Kahn's algorithm.
 * Returns node IDs in execution order.
 * Throws if the graph contains a cycle.
 */
export function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string[] {
  const nodeIds = new Set(nodes.map((n) => n.id))
  const inDegree = new Map<string, number>()
  const adjacency = new Map<string, string[]>()

  // Initialize
  for (const id of nodeIds) {
    inDegree.set(id, 0)
    adjacency.set(id, [])
  }

  // Build graph
  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      adjacency.get(edge.source)!.push(edge.target)
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    }
  }

  // Start with nodes that have no incoming edges
  const queue: string[] = []
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id)
  }

  const sorted: string[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    sorted.push(current)

    for (const neighbor of adjacency.get(current) || []) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1
      inDegree.set(neighbor, newDegree)
      if (newDegree === 0) queue.push(neighbor)
    }
  }

  if (sorted.length !== nodeIds.size) {
    throw new Error('Workflow contains a cycle — cannot execute')
  }

  return sorted
}

/**
 * Validate the workflow graph structure.
 * Returns an array of error messages (empty = valid).
 */
export function validateGraph(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string[] {
  const errors: string[] = []
  const nodeIds = new Set(nodes.map((n) => n.id))
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  // Must have at least one input and one output node
  const inputNodes = nodes.filter((n) => n.type === 'input')
  const outputNodes = nodes.filter((n) => n.type === 'output')

  if (inputNodes.length === 0) {
    errors.push('Workflow must have at least one Input node')
  }
  if (outputNodes.length === 0) {
    errors.push('Workflow must have at least one Output node')
  }

  // Check that all edges reference valid nodes
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge references unknown source node: ${edge.source}`)
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge references unknown target node: ${edge.target}`)
    }
  }

  // Check for cycles
  try {
    topologicalSort(nodes, edges)
  } catch {
    errors.push('Workflow contains a cycle')
  }

  // Check that output nodes have at least one incoming edge
  for (const output of outputNodes) {
    const hasIncoming = edges.some((e) => e.target === output.id)
    if (!hasIncoming) {
      errors.push(`Output node "${output.data.label}" has no incoming connections`)
    }
  }

  // Check conditional nodes have at least one outgoing edge
  const conditionalNodes = nodes.filter((n) => n.type === 'conditional')
  for (const cond of conditionalNodes) {
    const outgoing = edges.filter((e) => e.source === cond.id)
    if (outgoing.length === 0) {
      errors.push(`Conditional node "${cond.data.label}" has no outgoing connections`)
    }
  }

  return errors
}

/**
 * Resolve inputs for a node by gathering outputs from upstream nodes.
 * Returns a combined string of all upstream outputs.
 */
export function resolveNodeInputs(
  nodeId: string,
  edges: WorkflowEdge[],
  nodeResults: Map<string, NodeExecutionResult>,
  activeHandles?: Map<string, string> // conditional node ID → active handle ('true' | 'false')
): string {
  const incomingEdges = edges.filter((e) => e.target === nodeId)

  if (incomingEdges.length === 0) {
    return ''
  }

  const inputs: string[] = []

  for (const edge of incomingEdges) {
    // Skip edges from inactive conditional branches
    if (activeHandles && edge.sourceHandle) {
      const activeHandle = activeHandles.get(edge.source)
      if (activeHandle && edge.sourceHandle !== activeHandle) {
        continue
      }
    }

    const result = nodeResults.get(edge.source)
    if (result && result.status === 'completed' && result.output) {
      inputs.push(result.output)
    }
  }

  return inputs.join('\n\n')
}

/**
 * Interpolate {{input}} placeholders in a template string.
 */
export function interpolateTemplate(template: string, input: string): string {
  return template.replace(/\{\{input\}\}/g, input)
}

/**
 * Get all downstream node IDs from a given node (for skipping branches).
 */
export function getDownstreamNodes(
  nodeId: string,
  edges: WorkflowEdge[],
  sourceHandle?: string
): Set<string> {
  const downstream = new Set<string>()
  const queue: string[] = []

  // Start with direct targets from the specific handle
  const startEdges = sourceHandle
    ? edges.filter((e) => e.source === nodeId && e.sourceHandle === sourceHandle)
    : edges.filter((e) => e.source === nodeId)

  for (const edge of startEdges) {
    queue.push(edge.target)
  }

  while (queue.length > 0) {
    const current = queue.shift()!
    if (downstream.has(current)) continue
    downstream.add(current)

    for (const edge of edges) {
      if (edge.source === current && !downstream.has(edge.target)) {
        queue.push(edge.target)
      }
    }
  }

  return downstream
}
