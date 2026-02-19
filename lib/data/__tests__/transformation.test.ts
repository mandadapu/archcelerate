/**
 * @jest-environment node
 */

import {
  transformData,
  filterData,
  aggregateData,
  sortData,
  joinData,
  deduplicateData,
  pivotData,
  exportData,
} from '../transformation'

const sampleData = [
  { name: 'Alice', dept: 'eng', salary: 100 },
  { name: 'Bob', dept: 'eng', salary: 120 },
  { name: 'Carol', dept: 'sales', salary: 90 },
  { name: 'Dave', dept: 'sales', salary: 110 },
]

describe('transformData', () => {
  it('maps each row', () => {
    const result = transformData(sampleData, 'return { upper: row.name.toUpperCase() }')
    expect(result.success).toBe(true)
    expect(result.data![0]).toEqual({ upper: 'ALICE' })
    expect(result.rows).toBe(4)
  })

  it('returns error for invalid code', () => {
    const result = transformData(sampleData, 'throw new Error("fail")')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe('filterData', () => {
  it('filters rows by condition', () => {
    const result = filterData(sampleData, 'row.salary > 100')
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
    expect(result.filteredOut).toBe(2)
  })

  it('returns error for invalid condition', () => {
    const result = filterData(sampleData, '!!!invalid')
    expect(result.success).toBe(false)
  })
})

describe('aggregateData', () => {
  it('groups and sums', () => {
    const result = aggregateData(sampleData, 'dept', {
      totalSalary: { field: 'salary', fn: 'sum' },
    })
    expect(result.success).toBe(true)
    expect(result.groups).toBe(2)
    const eng = result.data!.find((r: any) => r.dept === 'eng')
    expect(eng.totalSalary).toBe(220)
  })

  it('calculates avg', () => {
    const result = aggregateData(sampleData, 'dept', {
      avgSalary: { field: 'salary', fn: 'avg' },
    })
    const sales = result.data!.find((r: any) => r.dept === 'sales')
    expect(sales.avgSalary).toBe(100)
  })

  it('calculates count', () => {
    const result = aggregateData(sampleData, 'dept', {
      count: { field: 'salary', fn: 'count' },
    })
    const eng = result.data!.find((r: any) => r.dept === 'eng')
    expect(eng.count).toBe(2)
  })

  it('calculates min and max', () => {
    const result = aggregateData(sampleData, 'dept', {
      minSal: { field: 'salary', fn: 'min' },
      maxSal: { field: 'salary', fn: 'max' },
    })
    const eng = result.data!.find((r: any) => r.dept === 'eng')
    expect(eng.minSal).toBe(100)
    expect(eng.maxSal).toBe(120)
  })
})

describe('sortData', () => {
  it('sorts ascending by default', () => {
    const result = sortData(sampleData, 'salary')
    expect(result.success).toBe(true)
    expect(result.data![0].salary).toBe(90)
    expect(result.data![3].salary).toBe(120)
  })

  it('sorts descending', () => {
    const result = sortData(sampleData, 'salary', 'desc')
    expect(result.data![0].salary).toBe(120)
  })

  it('sorts by multiple fields (array)', () => {
    const data = [
      { dept: 'b', name: 'Z' },
      { dept: 'a', name: 'Y' },
      { dept: 'a', name: 'X' },
    ]
    const result = sortData(data, ['dept', 'name'])
    expect(result.data![0]).toEqual({ dept: 'a', name: 'X' })
    expect(result.data![1]).toEqual({ dept: 'a', name: 'Y' })
  })
})

describe('joinData', () => {
  const left = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' },
  ]
  const right = [
    { id: 1, dept: 'eng' },
    { id: 2, dept: 'sales' },
    { id: 4, dept: 'hr' },
  ]

  it('inner join: only matching rows', () => {
    const result = joinData(left, right, 'id', 'id', 'inner')
    expect(result.data).toHaveLength(2)
    expect(result.data![0]).toEqual({ id: 1, name: 'Alice', dept: 'eng' })
  })

  it('left join: includes unmatched left rows', () => {
    const result = joinData(left, right, 'id', 'id', 'left')
    expect(result.data).toHaveLength(3)
    expect(result.data!.find((r: any) => r.name === 'Carol')).toBeDefined()
  })

  it('outer join: includes unmatched from both sides', () => {
    const result = joinData(left, right, 'id', 'id', 'outer')
    expect(result.data).toHaveLength(4) // Alice, Bob, Carol (left), HR (right)
  })
})

describe('deduplicateData', () => {
  it('removes duplicates by single key', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 1, name: 'Alice Dup' },
      { id: 2, name: 'Bob' },
    ]
    const result = deduplicateData(data, ['id'])
    expect(result.data).toHaveLength(2)
    expect(result.filteredOut).toBe(1)
  })

  it('deduplicates by composite key', () => {
    const data = [
      { dept: 'eng', name: 'Alice' },
      { dept: 'eng', name: 'Alice' },
      { dept: 'eng', name: 'Bob' },
    ]
    const result = deduplicateData(data, ['dept', 'name'])
    expect(result.data).toHaveLength(2)
  })
})

describe('pivotData', () => {
  const data = [
    { quarter: 'Q1', product: 'A', revenue: 100 },
    { quarter: 'Q1', product: 'B', revenue: 200 },
    { quarter: 'Q2', product: 'A', revenue: 150 },
    { quarter: 'Q2', product: 'A', revenue: 50 },
  ]

  it('pivots with sum aggregation', () => {
    const result = pivotData(data, 'quarter', 'product', 'revenue', 'sum')
    expect(result.success).toBe(true)
    const q1 = result.data!.find((r: any) => r.quarter === 'Q1')
    expect(q1.A).toBe(100)
    expect(q1.B).toBe(200)
    const q2 = result.data!.find((r: any) => r.quarter === 'Q2')
    expect(q2.A).toBe(200) // 150 + 50
  })

  it('pivots with count aggregation', () => {
    const result = pivotData(data, 'quarter', 'product', 'revenue', 'count')
    const q2 = result.data!.find((r: any) => r.quarter === 'Q2')
    expect(q2.A).toBe(2)
  })

  it('pivots with avg aggregation', () => {
    const result = pivotData(data, 'quarter', 'product', 'revenue', 'avg')
    const q2 = result.data!.find((r: any) => r.quarter === 'Q2')
    expect(q2.A).toBe(100) // (150 + 50) / 2
  })

  it('pivots with min/max', () => {
    const minResult = pivotData(data, 'quarter', 'product', 'revenue', 'min')
    const maxResult = pivotData(data, 'quarter', 'product', 'revenue', 'max')
    const q2Min = minResult.data!.find((r: any) => r.quarter === 'Q2')
    const q2Max = maxResult.data!.find((r: any) => r.quarter === 'Q2')
    expect(q2Min.A).toBe(50)
    expect(q2Max.A).toBe(150)
  })
})

describe('exportData', () => {
  const data = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]

  it('exports to JSON', async () => {
    const result = await exportData(data, 'json')
    expect(result.success).toBe(true)
    expect(JSON.parse(result.content!)).toEqual(data)
  })

  it('exports to CSV', async () => {
    const result = await exportData(data, 'csv')
    expect(result.success).toBe(true)
    expect(result.content).toContain('id')
    expect(result.content).toContain('Alice')
  })

  it('exports to SQL with tableName', async () => {
    const result = await exportData(data, 'sql', undefined, { tableName: 'users' })
    expect(result.success).toBe(true)
    expect(result.content).toContain('INSERT INTO users VALUES')
    expect(result.content).toContain("'Alice'")
  })

  it('fails SQL export without tableName', async () => {
    const result = await exportData(data, 'sql')
    expect(result.success).toBe(false)
    expect(result.error).toContain('tableName')
  })

  it('fails for unknown format', async () => {
    const result = await exportData(data, 'yaml' as any)
    expect(result.success).toBe(false)
  })
})
