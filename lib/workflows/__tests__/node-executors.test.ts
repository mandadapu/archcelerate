/**
 * @jest-environment node
 */

import { executeConditionalNode } from '../node-executors/conditional'
import { executeDataTransformNode } from '../node-executors/data-transform'
import { executeOutputNode } from '../node-executors/output'
import type { ConditionalNodeData, DataTransformNodeData, OutputNodeData } from '../types'

describe('executeConditionalNode', () => {
  const makeConfig = (conditionType: ConditionalNodeData['conditionType'], conditionValue: string): ConditionalNodeData => ({
    label: 'test', conditionType, conditionValue,
  })

  it('contains: true when input contains value (case-insensitive)', () => {
    const result = executeConditionalNode(makeConfig('contains', 'hello'), 'say Hello world')
    expect(result.branch).toBe('true')
    expect(result.status).toBe('completed')
  })

  it('contains: false when input does not contain value', () => {
    const result = executeConditionalNode(makeConfig('contains', 'xyz'), 'hello world')
    expect(result.branch).toBe('false')
  })

  it('not_contains: true when value absent', () => {
    expect(executeConditionalNode(makeConfig('not_contains', 'xyz'), 'hello').branch).toBe('true')
  })

  it('not_contains: false when value present', () => {
    expect(executeConditionalNode(makeConfig('not_contains', 'hello'), 'hello world').branch).toBe('false')
  })

  it('length_gt: compares input length', () => {
    expect(executeConditionalNode(makeConfig('length_gt', '5'), 'abcdef').branch).toBe('true')
    expect(executeConditionalNode(makeConfig('length_gt', '5'), 'abc').branch).toBe('false')
  })

  it('length_lt: compares input length', () => {
    expect(executeConditionalNode(makeConfig('length_lt', '5'), 'abc').branch).toBe('true')
    expect(executeConditionalNode(makeConfig('length_lt', '5'), 'abcdefgh').branch).toBe('false')
  })

  it('equals: trims and case-insensitive', () => {
    expect(executeConditionalNode(makeConfig('equals', 'yes'), '  YES  ').branch).toBe('true')
    expect(executeConditionalNode(makeConfig('equals', 'yes'), 'no').branch).toBe('false')
  })

  it('unknown condition type defaults to false', () => {
    const config = { label: 'test', conditionType: 'unknown' as any, conditionValue: '' }
    expect(executeConditionalNode(config, 'anything').branch).toBe('false')
  })

  it('passes through input as output', () => {
    const result = executeConditionalNode(makeConfig('contains', 'a'), 'abc')
    expect(result.output).toBe('abc')
  })
})

describe('executeDataTransformNode', () => {
  const makeConfig = (transformType: DataTransformNodeData['transformType'], config: string): DataTransformNodeData => ({
    label: 'test', transformType, config,
  })

  it('template: interpolates {{input}}', () => {
    const result = executeDataTransformNode(makeConfig('template', 'Result: {{input}}'), 'data')
    expect(result.output).toBe('Result: data')
    expect(result.status).toBe('completed')
  })

  it('extract_json: extracts nested field', () => {
    const input = JSON.stringify({ user: { name: 'Alice' } })
    const result = executeDataTransformNode(makeConfig('extract_json', 'user.name'), input)
    expect(result.output).toBe('Alice')
  })

  it('extract_json: returns empty string for missing field', () => {
    const input = JSON.stringify({ user: {} })
    const result = executeDataTransformNode(makeConfig('extract_json', 'user.name'), input)
    expect(result.output).toBe('')
  })

  it('extract_json: returns failed on invalid JSON', () => {
    const result = executeDataTransformNode(makeConfig('extract_json', 'key'), 'not json')
    expect(result.status).toBe('failed')
    expect(result.errorMessage).toBeDefined()
  })

  it('combine: replaces double newlines with separator', () => {
    const result = executeDataTransformNode(makeConfig('combine', ' | '), 'a\n\nb\n\nc')
    expect(result.output).toBe('a | b | c')
  })

  it('split: creates numbered items', () => {
    const result = executeDataTransformNode(makeConfig('split', ','), 'a,b,c')
    expect(result.output).toBe('1. a\n2. b\n3. c')
  })

  it('unknown transform type passes through input', () => {
    const config = { label: 'test', transformType: 'unknown' as any, config: '' }
    const result = executeDataTransformNode(config, 'passthrough')
    expect(result.output).toBe('passthrough')
  })
})

describe('executeOutputNode', () => {
  it('applies formatTemplate', () => {
    const config: OutputNodeData = { label: 'out', formatTemplate: '## {{input}}' }
    const result = executeOutputNode(config, 'hello')
    expect(result.output).toBe('## hello')
    expect(result.status).toBe('completed')
  })

  it('passes through input when no formatTemplate', () => {
    const config: OutputNodeData = { label: 'out', formatTemplate: '' }
    const result = executeOutputNode(config, 'raw data')
    expect(result.output).toBe('raw data')
  })
})
