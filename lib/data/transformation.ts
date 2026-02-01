import Papa from 'papaparse'

export interface TransformationResult {
  success: boolean
  data?: any[]
  error?: string
  rows?: number
  filteredOut?: number
  groups?: number
}

/**
 * Transform data using JavaScript code
 */
export function transformData(
  data: any[],
  transformCode: string
): TransformationResult {
  try {
    // Create a safe function from the code
    const transformFn = new Function('row', `'use strict'; ${transformCode}`) as (row: any) => any

    const transformed = data.map(transformFn)

    return {
      success: true,
      data: transformed,
      rows: transformed.length
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Filter data array using a condition
 */
export function filterData(
  data: any[],
  condition: string
): TransformationResult {
  try {
    const conditionFn = new Function('row', `'use strict'; return ${condition}`) as (row: any) => boolean
    const filtered = data.filter(conditionFn)

    return {
      success: true,
      data: filtered,
      rows: filtered.length,
      filteredOut: data.length - filtered.length
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Aggregate data by grouping and applying functions
 */
export function aggregateData(
  data: any[],
  groupBy: string,
  aggregations: Record<string, { field: string; fn: 'sum' | 'avg' | 'count' | 'min' | 'max' }>
): TransformationResult {
  try {
    const groups = new Map()

    // Group data
    for (const row of data) {
      const key = row[groupBy]
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key).push(row)
    }

    // Apply aggregations
    const result = []
    for (const [key, rows] of groups.entries()) {
      const aggregated: any = { [groupBy]: key }

      for (const [name, config] of Object.entries(aggregations)) {
        const values = rows.map(r => r[config.field])

        switch (config.fn) {
          case 'sum':
            aggregated[name] = values.reduce((a, b) => a + b, 0)
            break
          case 'avg':
            aggregated[name] = values.reduce((a, b) => a + b, 0) / values.length
            break
          case 'count':
            aggregated[name] = values.length
            break
          case 'min':
            aggregated[name] = Math.min(...values)
            break
          case 'max':
            aggregated[name] = Math.max(...values)
            break
        }
      }

      result.push(aggregated)
    }

    return {
      success: true,
      data: result,
      groups: result.length
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Sort data by field(s)
 */
export function sortData(
  data: any[],
  sortBy: string | string[],
  order: 'asc' | 'desc' = 'asc'
): TransformationResult {
  try {
    const fields = Array.isArray(sortBy) ? sortBy : [sortBy]

    const sorted = [...data].sort((a, b) => {
      for (const field of fields) {
        const aVal = a[field]
        const bVal = b[field]

        if (aVal < bVal) return order === 'asc' ? -1 : 1
        if (aVal > bVal) return order === 'asc' ? 1 : -1
      }
      return 0
    })

    return {
      success: true,
      data: sorted,
      rows: sorted.length
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Join two datasets
 */
export function joinData(
  left: any[],
  right: any[],
  leftKey: string,
  rightKey: string,
  type: 'inner' | 'left' | 'right' | 'outer' = 'inner'
): TransformationResult {
  try {
    const result: any[] = []

    // Create lookup for right dataset
    const rightMap = new Map(right.map(row => [row[rightKey], row]))

    for (const leftRow of left) {
      const rightRow = rightMap.get(leftRow[leftKey])

      if (rightRow) {
        // Match found - merge rows
        result.push({ ...leftRow, ...rightRow })
      } else if (type === 'left' || type === 'outer') {
        // Left join or outer join - include left row even without match
        result.push(leftRow)
      }
    }

    // For outer join, add unmatched right rows
    if (type === 'outer') {
      const leftKeys = new Set(left.map(row => row[leftKey]))
      for (const rightRow of right) {
        if (!leftKeys.has(rightRow[rightKey])) {
          result.push(rightRow)
        }
      }
    }

    return {
      success: true,
      data: result,
      rows: result.length
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Export data to various formats
 */
export async function exportData(
  data: any[],
  format: 'csv' | 'json' | 'sql',
  filePath?: string,
  options?: { tableName?: string }
): Promise<{ success: boolean; content?: string; error?: string; filePath?: string }> {
  try {
    let content: string

    switch (format) {
      case 'csv':
        content = Papa.unparse(data)
        break
      case 'json':
        content = JSON.stringify(data, null, 2)
        break
      case 'sql':
        if (!options?.tableName) {
          return { success: false, error: 'tableName required for SQL format' }
        }
        const values = data.map(row => {
          const cols = Object.keys(row)
          const vals = Object.values(row).map(v =>
            typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v === null ? 'NULL' : v
          )
          return `(${vals.join(', ')})`
        })
        content = `INSERT INTO ${options.tableName} VALUES\n${values.join(',\n')};`
        break
      default:
        return { success: false, error: `Unknown format: ${format}` }
    }

    // Write to file if path provided
    if (filePath) {
      const fs = await import('fs/promises')
      await fs.writeFile(filePath, content, 'utf-8')
      return { success: true, filePath, content }
    }

    return { success: true, content }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Deduplicate data by key(s)
 */
export function deduplicateData(
  data: any[],
  keys: string[]
): TransformationResult {
  try {
    const seen = new Set()
    const deduplicated = data.filter(row => {
      const key = keys.map(k => row[k]).join('::')
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })

    return {
      success: true,
      data: deduplicated,
      rows: deduplicated.length,
      filteredOut: data.length - deduplicated.length
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Reshape data (pivot/unpivot)
 */
export function pivotData(
  data: any[],
  index: string,
  columns: string,
  values: string,
  aggFn: 'sum' | 'avg' | 'count' | 'min' | 'max' = 'sum'
): TransformationResult {
  try {
    const result: any[] = []
    const pivotMap = new Map()

    // Group data by index
    for (const row of data) {
      const indexKey = row[index]
      const columnKey = row[columns]
      const value = row[values]

      if (!pivotMap.has(indexKey)) {
        pivotMap.set(indexKey, { [index]: indexKey })
      }

      const current = pivotMap.get(indexKey)[columnKey]
      const pivotRow = pivotMap.get(indexKey)

      if (current === undefined) {
        pivotRow[columnKey] = [value]
      } else {
        pivotRow[columnKey].push(value)
      }
    }

    // Apply aggregation function
    for (const [, pivotRow] of pivotMap.entries()) {
      const finalRow: any = { [index]: pivotRow[index] }

      for (const [key, vals] of Object.entries(pivotRow)) {
        if (key === index) continue

        const values = vals as number[]
        switch (aggFn) {
          case 'sum':
            finalRow[key] = values.reduce((a, b) => a + b, 0)
            break
          case 'avg':
            finalRow[key] = values.reduce((a, b) => a + b, 0) / values.length
            break
          case 'count':
            finalRow[key] = values.length
            break
          case 'min':
            finalRow[key] = Math.min(...values)
            break
          case 'max':
            finalRow[key] = Math.max(...values)
            break
        }
      }

      result.push(finalRow)
    }

    return {
      success: true,
      data: result,
      rows: result.length
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}
