import Papa from 'papaparse'
import { XMLParser } from 'fast-xml-parser'
import * as JSONPath from 'jsonpath'

export interface ExtractionResult {
  success: boolean
  data?: any
  error?: string
  rows?: number
  columns?: string[]
  type?: string
}

/**
 * Extract data from CSV file or string
 */
export async function extractCSV(input: string, hasHeader: boolean = true): Promise<ExtractionResult> {
  try {
    let content: string

    // Check if input is a file path or CSV content
    if (input.includes('\n') || input.includes(',')) {
      content = input
    } else {
      // Read from file
      const fs = await import('fs/promises')
      content = await fs.readFile(input, 'utf-8')
    }

    const parsed = Papa.parse(content, {
      header: hasHeader,
      skipEmptyLines: true,
      dynamicTyping: true
    })

    if (parsed.errors.length > 0) {
      return {
        success: false,
        error: `CSV parsing errors: ${parsed.errors.map(e => e.message).join(', ')}`,
        rows: 0
      }
    }

    return {
      success: true,
      data: parsed.data,
      rows: parsed.data.length,
      columns: parsed.meta.fields || []
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Extract data from JSON file, URL, or string
 */
export async function extractJSON(source: string, jsonPath?: string): Promise<ExtractionResult> {
  try {
    let data: any

    // Check if source is URL
    if (source.startsWith('http://') || source.startsWith('https://')) {
      const response = await fetch(source)
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }
      data = await response.json()
    }
    // Check if it's already JSON (starts with { or [)
    else if (source.trim().startsWith('{') || source.trim().startsWith('[')) {
      data = JSON.parse(source)
    }
    // Otherwise, read from file
    else {
      const fs = await import('fs/promises')
      const content = await fs.readFile(source, 'utf-8')
      data = JSON.parse(content)
    }

    // Apply JSONPath if provided
    if (jsonPath) {
      data = JSONPath.query(data, jsonPath)
    }

    return {
      success: true,
      data,
      type: Array.isArray(data) ? 'array' : typeof data
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Extract data from XML file or string
 */
export async function extractXML(source: string): Promise<ExtractionResult> {
  try {
    let content: string

    // Check if source is XML content (starts with <)
    if (source.trim().startsWith('<')) {
      content = source
    } else {
      // Read from file
      const fs = await import('fs/promises')
      content = await fs.readFile(source, 'utf-8')
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    })
    const data = parser.parse(content)

    return {
      success: true,
      data
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Auto-detect format and extract data
 */
export async function extractAuto(source: string): Promise<ExtractionResult> {
  // Try to detect format
  const trimmed = source.trim()

  if (trimmed.startsWith('<')) {
    return extractXML(source)
  } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return extractJSON(source)
  } else if (trimmed.includes(',') || trimmed.includes('\n')) {
    return extractCSV(source)
  } else {
    // Assume it's a file path
    if (source.endsWith('.json')) {
      return extractJSON(source)
    } else if (source.endsWith('.xml')) {
      return extractXML(source)
    } else if (source.endsWith('.csv')) {
      return extractCSV(source)
    }
  }

  return {
    success: false,
    error: 'Could not detect data format'
  }
}
