/**
 * @jest-environment node
 */

import {
  topologicalSort,
  validateGraph,
  resolveNodeInputs,
  interpolateTemplate,
  getDownstreamNodes,
} from '../graph-utils'
import type { WorkflowNode, WorkflowEdge, NodeExecutionResult } from '../types'

function makeNode(id: string, type: WorkflowNode['type'] = 'llm_call', label = id): WorkflowNode {
  return { id, type, position: { x: 0, y: 0 }, data: { label, description: '' } }
}

function makeEdge(source: string, target: string, sourceHandle?: string): WorkflowEdge {
  return { id: `${source}-${target}`, source, target, sourceHandle }
}

describe('topologicalSort', () => {
  it('sorts a linear chain', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')]
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'c')]
    expect(topologicalSort(nodes, edges)).toEqual(['a', 'b', 'c'])
  })

  it('sorts a diamond graph', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c'), makeNode('d')]
    const edges = [makeEdge('a', 'b'), makeEdge('a', 'c'), makeEdge('b', 'd'), makeEdge('c', 'd')]
    const sorted = topologicalSort(nodes, edges)
    expect(sorted[0]).toBe('a')
    expect(sorted[sorted.length - 1]).toBe('d')
    expect(sorted.indexOf('b')).toBeGreaterThan(sorted.indexOf('a'))
    expect(sorted.indexOf('c')).toBeGreaterThan(sorted.indexOf('a'))
  })

  it('throws on cycle', () => {
    const nodes = [makeNode('a'), makeNode('b')]
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'a')]
    expect(() => topologicalSort(nodes, edges)).toThrow('cycle')
  })

  it('handles single node', () => {
    const nodes = [makeNode('a')]
    expect(topologicalSort(nodes, [])).toEqual(['a'])
  })
})

describe('validateGraph', () => {
  it('returns error when no input node', () => {
    const nodes = [makeNode('o', 'output')]
    const edges: WorkflowEdge[] = []
    const errors = validateGraph(nodes, edges)
    expect(errors).toContain('Workflow must have at least one Input node')
  })

  it('returns error when no output node', () => {
    const nodes = [makeNode('i', 'input')]
    const errors = validateGraph(nodes, [])
    expect(errors).toContain('Workflow must have at least one Output node')
  })

  it('returns error for edge referencing unknown source', () => {
    const nodes = [makeNode('i', 'input'), makeNode('o', 'output')]
    const edges = [makeEdge('unknown', 'o'), makeEdge('i', 'o')]
    const errors = validateGraph(nodes, edges)
    expect(errors.some(e => e.includes('unknown source'))).toBe(true)
  })

  it('returns error for edge referencing unknown target', () => {
    const nodes = [makeNode('i', 'input'), makeNode('o', 'output')]
    const edges = [makeEdge('i', 'missing'), makeEdge('i', 'o')]
    const errors = validateGraph(nodes, edges)
    expect(errors.some(e => e.includes('unknown target'))).toBe(true)
  })

  it('detects cycle', () => {
    const nodes = [makeNode('i', 'input'), makeNode('a'), makeNode('b'), makeNode('o', 'output')]
    const edges = [makeEdge('i', 'a'), makeEdge('a', 'b'), makeEdge('b', 'a'), makeEdge('a', 'o')]
    const errors = validateGraph(nodes, edges)
    expect(errors).toContain('Workflow contains a cycle')
  })

  it('reports output node with no incoming connections', () => {
    const nodes = [makeNode('i', 'input'), makeNode('o', 'output', 'My Output')]
    const errors = validateGraph(nodes, [])
    expect(errors.some(e => e.includes('My Output') && e.includes('no incoming'))).toBe(true)
  })

  it('reports conditional node with no outgoing connections', () => {
    const nodes = [makeNode('i', 'input'), makeNode('c', 'conditional', 'My Cond'), makeNode('o', 'output')]
    const edges = [makeEdge('i', 'c'), makeEdge('i', 'o')]
    const errors = validateGraph(nodes, edges)
    expect(errors.some(e => e.includes('My Cond') && e.includes('no outgoing'))).toBe(true)
  })

  it('returns empty array for valid graph', () => {
    const nodes = [makeNode('i', 'input'), makeNode('o', 'output')]
    const edges = [makeEdge('i', 'o')]
    expect(validateGraph(nodes, edges)).toEqual([])
  })
})

describe('resolveNodeInputs', () => {
  it('returns empty string when no incoming edges', () => {
    expect(resolveNodeInputs('a', [], new Map())).toBe('')
  })

  it('returns upstream output', () => {
    const edges = [makeEdge('a', 'b')]
    const results = new Map<string, NodeExecutionResult>([
      ['a', { output: 'hello', tokensUsed: 0, cost: 0, latencyMs: 0, status: 'completed' }],
    ])
    expect(resolveNodeInputs('b', edges, results)).toBe('hello')
  })

  it('joins multiple upstream outputs', () => {
    const edges = [makeEdge('a', 'c'), makeEdge('b', 'c')]
    const results = new Map<string, NodeExecutionResult>([
      ['a', { output: 'first', tokensUsed: 0, cost: 0, latencyMs: 0, status: 'completed' }],
      ['b', { output: 'second', tokensUsed: 0, cost: 0, latencyMs: 0, status: 'completed' }],
    ])
    expect(resolveNodeInputs('c', edges, results)).toBe('first\n\nsecond')
  })

  it('skips inactive conditional branch', () => {
    const edges = [
      { ...makeEdge('cond', 'a'), sourceHandle: 'true' },
      { ...makeEdge('cond', 'b'), sourceHandle: 'false' },
    ]
    const results = new Map<string, NodeExecutionResult>([
      ['cond', { output: 'data', tokensUsed: 0, cost: 0, latencyMs: 0, status: 'completed' }],
    ])
    const activeHandles = new Map([['cond', 'true']])

    expect(resolveNodeInputs('a', edges, results, activeHandles)).toBe('data')
    expect(resolveNodeInputs('b', edges, results, activeHandles)).toBe('')
  })
})

describe('interpolateTemplate', () => {
  it('replaces {{input}} placeholder', () => {
    expect(interpolateTemplate('Hello {{input}}!', 'world')).toBe('Hello world!')
  })

  it('replaces multiple placeholders', () => {
    expect(interpolateTemplate('{{input}} and {{input}}', 'X')).toBe('X and X')
  })

  it('returns template unchanged when no placeholder', () => {
    expect(interpolateTemplate('no placeholder', 'val')).toBe('no placeholder')
  })
})

describe('getDownstreamNodes', () => {
  it('finds all downstream nodes in a chain', () => {
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'c'), makeEdge('c', 'd')]
    const downstream = getDownstreamNodes('a', edges)
    expect(downstream).toEqual(new Set(['b', 'c', 'd']))
  })

  it('finds branching downstream nodes', () => {
    const edges = [makeEdge('a', 'b'), makeEdge('a', 'c'), makeEdge('b', 'd')]
    const downstream = getDownstreamNodes('a', edges)
    expect(downstream).toEqual(new Set(['b', 'c', 'd']))
  })

  it('filters by sourceHandle', () => {
    const edges = [
      { ...makeEdge('a', 'b'), sourceHandle: 'true' },
      { ...makeEdge('a', 'c'), sourceHandle: 'false' },
      makeEdge('b', 'd'),
    ]
    const downstream = getDownstreamNodes('a', edges, 'true')
    expect(downstream).toEqual(new Set(['b', 'd']))
    expect(downstream.has('c')).toBe(false)
  })

  it('returns empty set for leaf node', () => {
    const edges = [makeEdge('a', 'b')]
    expect(getDownstreamNodes('b', edges)).toEqual(new Set())
  })
})
