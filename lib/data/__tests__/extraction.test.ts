/**
 * @jest-environment node
 */

import { extractCSV, extractJSON, extractXML, extractAuto } from '../extraction'

describe('extractCSV', () => {
  it('parses inline CSV with headers', async () => {
    const csv = 'name,age\nAlice,30\nBob,25'
    const result = await extractCSV(csv)
    expect(result.success).toBe(true)
    expect(result.rows).toBe(2)
    expect(result.data![0]).toEqual({ name: 'Alice', age: 30 })
    expect(result.columns).toEqual(['name', 'age'])
  })

  it('skips empty rows', async () => {
    const csv = 'name,age\nAlice,30\n\nBob,25\n'
    const result = await extractCSV(csv)
    expect(result.success).toBe(true)
    expect(result.rows).toBe(2)
  })
})

describe('extractJSON', () => {
  it('parses inline JSON object', async () => {
    const result = await extractJSON('{"key": "value"}')
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ key: 'value' })
    expect(result.type).toBe('object')
  })

  it('parses inline JSON array', async () => {
    const result = await extractJSON('[1, 2, 3]')
    expect(result.success).toBe(true)
    expect(result.data).toEqual([1, 2, 3])
    expect(result.type).toBe('array')
  })

  it('returns error for invalid JSON', async () => {
    const result = await extractJSON('{not json}')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe('extractXML', () => {
  it('parses inline XML', async () => {
    const xml = '<root><item>hello</item></root>'
    const result = await extractXML(xml)
    expect(result.success).toBe(true)
    expect(result.data.root.item).toBe('hello')
  })

  it('handles XML attributes', async () => {
    const xml = '<root><item id="1">val</item></root>'
    const result = await extractXML(xml)
    expect(result.success).toBe(true)
    expect(result.data.root.item['@_id']).toBe('1')
  })
})

describe('extractAuto', () => {
  it('detects JSON', async () => {
    const result = await extractAuto('{"a": 1}')
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ a: 1 })
  })

  it('detects XML', async () => {
    const result = await extractAuto('<root><a>1</a></root>')
    expect(result.success).toBe(true)
    expect(result.data.root.a).toBe(1)
  })

  it('detects CSV', async () => {
    const result = await extractAuto('name,age\nAlice,30')
    expect(result.success).toBe(true)
    expect(result.data![0]).toEqual({ name: 'Alice', age: 30 })
  })

  it('returns error for undetectable format', async () => {
    const result = await extractAuto('justaplainword')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Could not detect')
  })
})
