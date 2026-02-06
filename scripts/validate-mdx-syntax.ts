/**
 * MDX Syntax Validation Script
 *
 * Validates all MDX files for common syntax errors that cause compilation failures.
 * Run this before commits to catch issues early.
 *
 * Usage:
 *   npx tsx scripts/validate-mdx-syntax.ts
 *   npx tsx scripts/validate-mdx-syntax.ts --fix  # Auto-fix common issues
 */

import * as fs from 'fs/promises'
import * as path from 'path'

interface ValidationError {
  file: string
  line: number
  column: number
  error: string
  snippet: string
  suggestion?: string
}

interface ValidationResult {
  totalFiles: number
  validFiles: number
  errors: ValidationError[]
  warnings: ValidationError[]
}

const CONTENT_DIR = path.join(__dirname, '..', 'content')
const AUTO_FIX = process.argv.includes('--fix')

// Regex patterns for common MDX syntax errors
const VALIDATION_PATTERNS = {
  // Unescaped < followed by digit or $
  unescapedLessThanDigit: {
    pattern: /(?<!&lt;)(?<!&gt;)<([0-9$])/g,
    severity: 'error' as const,
    message: 'Unescaped < followed by digit or $',
    suggestion: (match: string) => match.replace('<', '&lt;')
  },

  // Unescaped > followed by digit or $
  unescapedGreaterThanDigit: {
    pattern: /(?<!&lt;)(?<!&gt;)>([0-9$])/g,
    severity: 'error' as const,
    message: 'Unescaped > followed by digit or $',
    suggestion: (match: string) => match.replace('>', '&gt;')
  },

  // Unescaped < in table cells followed by space and digit/dollar
  unescapedLessThanInTable: {
    pattern: /\|\s*<\s+(\$?[\d.])/g,
    severity: 'error' as const,
    message: 'Unescaped < in table cell',
    suggestion: (match: string) => match.replace('<', '&lt;')
  },

  // Unescaped > in table cells followed by space and digit/dollar
  unescapedGreaterThanInTable: {
    pattern: /\|\s*>\s+(\$?[\d.])/g,
    severity: 'error' as const,
    message: 'Unescaped > in table cell',
    suggestion: (match: string) => match.replace('>', '&gt;')
  },

  // Unclosed JSX tags (basic check)
  unclosedJSXTag: {
    pattern: /<([A-Z][a-zA-Z]*)[^>]*>(?!.*<\/\1>)/g,
    severity: 'warning' as const,
    message: 'Possible unclosed JSX tag',
    suggestion: null
  }
}

async function getAllMDXFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      const subFiles = await getAllMDXFiles(fullPath)
      files.push(...subFiles)
    } else if (entry.name.endsWith('.mdx')) {
      files.push(fullPath)
    }
  }

  return files
}

async function validateMDXFile(filePath: string): Promise<ValidationError[]> {
  const errors: ValidationError[] = []
  const content = await fs.readFile(filePath, 'utf-8')
  const lines = content.split('\n')
  const relativePath = path.relative(process.cwd(), filePath)

  // Track if we're inside a code block
  let inCodeBlock = false
  let inFrontmatter = false

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum]
    const lineNumber = lineNum + 1

    // Track code blocks (skip validation inside code blocks)
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    // Track frontmatter (skip validation in frontmatter)
    if (lineNum === 0 && line.trim() === '---') {
      inFrontmatter = true
      continue
    }
    if (inFrontmatter && line.trim() === '---') {
      inFrontmatter = false
      continue
    }

    // Skip validation inside code blocks and frontmatter
    if (inCodeBlock || inFrontmatter) {
      continue
    }

    // Run all validation patterns
    for (const [patternName, config] of Object.entries(VALIDATION_PATTERNS)) {
      const matches = [...line.matchAll(config.pattern)]

      for (const match of matches) {
        const column = (match.index || 0) + 1
        const snippet = line.substring(
          Math.max(0, (match.index || 0) - 20),
          Math.min(line.length, (match.index || 0) + match[0].length + 20)
        ).trim()

        errors.push({
          file: relativePath,
          line: lineNumber,
          column,
          error: config.message,
          snippet: `...${snippet}...`,
          suggestion: config.suggestion ? config.suggestion(match[0]) : undefined
        })
      }
    }
  }

  return errors
}

async function autoFixMDXFile(filePath: string, errors: ValidationError[]): Promise<number> {
  if (errors.length === 0 || !AUTO_FIX) return 0

  const content = await fs.readFile(filePath, 'utf-8')
  let lines = content.split('\n')
  let fixCount = 0

  // Track if we're inside a code block
  let inCodeBlock = false
  let inFrontmatter = false

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum]

    // Track code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    // Track frontmatter
    if (lineNum === 0 && line.trim() === '---') {
      inFrontmatter = true
      continue
    }
    if (inFrontmatter && line.trim() === '---') {
      inFrontmatter = false
      continue
    }

    // Skip fixing inside code blocks and frontmatter
    if (inCodeBlock || inFrontmatter) {
      continue
    }

    let modifiedLine = line

    // Apply fixes for patterns that have suggestions
    for (const config of Object.values(VALIDATION_PATTERNS)) {
      if (config.suggestion) {
        const matches = [...modifiedLine.matchAll(config.pattern)]
        if (matches.length > 0) {
          // Replace all matches
          modifiedLine = modifiedLine.replace(config.pattern, (match) => {
            fixCount++
            return config.suggestion!(match)
          })
        }
      }
    }

    lines[lineNum] = modifiedLine
  }

  if (fixCount > 0) {
    await fs.writeFile(filePath, lines.join('\n'), 'utf-8')
  }

  return fixCount
}

async function main() {
  console.log('🔍 MDX Syntax Validation')
  console.log('━'.repeat(50))
  console.log()

  if (AUTO_FIX) {
    console.log('⚠️  Auto-fix mode enabled - will modify files')
    console.log()
  }

  const mdxFiles = await getAllMDXFiles(CONTENT_DIR)
  console.log(`📁 Found ${mdxFiles.length} MDX files`)
  console.log()

  const result: ValidationResult = {
    totalFiles: mdxFiles.length,
    validFiles: 0,
    errors: [],
    warnings: []
  }

  let totalFixesApplied = 0

  for (const file of mdxFiles) {
    const errors = await validateMDXFile(file)

    if (errors.length === 0) {
      result.validFiles++
    } else {
      // Separate errors and warnings
      const fileErrors = errors.filter(e =>
        VALIDATION_PATTERNS[Object.keys(VALIDATION_PATTERNS).find(k =>
          VALIDATION_PATTERNS[k as keyof typeof VALIDATION_PATTERNS].message === e.error
        )!]?.severity === 'error'
      )
      const fileWarnings = errors.filter(e =>
        VALIDATION_PATTERNS[Object.keys(VALIDATION_PATTERNS).find(k =>
          VALIDATION_PATTERNS[k as keyof typeof VALIDATION_PATTERNS].message === e.error
        )!]?.severity === 'warning'
      )

      result.errors.push(...fileErrors)
      result.warnings.push(...fileWarnings)

      // Auto-fix if enabled
      if (AUTO_FIX) {
        const fixCount = await autoFixMDXFile(file, fileErrors)
        totalFixesApplied += fixCount
      }
    }
  }

  // Print results
  console.log('📊 Validation Results')
  console.log('━'.repeat(50))
  console.log(`✅ Valid files:   ${result.validFiles}/${result.totalFiles}`)
  console.log(`❌ Files with errors: ${result.totalFiles - result.validFiles}`)
  console.log(`🔴 Total errors:  ${result.errors.length}`)
  console.log(`🟡 Total warnings: ${result.warnings.length}`)

  if (AUTO_FIX && totalFixesApplied > 0) {
    console.log(`🔧 Auto-fixes applied: ${totalFixesApplied}`)
  }

  console.log()

  // Print errors
  if (result.errors.length > 0) {
    console.log('❌ Errors Found:')
    console.log('━'.repeat(50))

    // Group errors by file
    const errorsByFile = result.errors.reduce((acc, error) => {
      if (!acc[error.file]) acc[error.file] = []
      acc[error.file].push(error)
      return acc
    }, {} as Record<string, ValidationError[]>)

    for (const [file, fileErrors] of Object.entries(errorsByFile)) {
      console.log(`\n📄 ${file}`)
      for (const error of fileErrors) {
        console.log(`   Line ${error.line}:${error.column} - ${error.error}`)
        console.log(`   ${error.snippet}`)
        if (error.suggestion && !AUTO_FIX) {
          console.log(`   💡 Suggestion: ${error.suggestion}`)
        }
      }
    }
    console.log()
  }

  // Print warnings
  if (result.warnings.length > 0 && !AUTO_FIX) {
    console.log('⚠️  Warnings Found:')
    console.log('━'.repeat(50))

    const warningsByFile = result.warnings.reduce((acc, warning) => {
      if (!acc[warning.file]) acc[warning.file] = []
      acc[warning.file].push(warning)
      return acc
    }, {} as Record<string, ValidationError[]>)

    for (const [file, fileWarnings] of Object.entries(warningsByFile)) {
      console.log(`\n📄 ${file}`)
      for (const warning of fileWarnings.slice(0, 3)) { // Show max 3 warnings per file
        console.log(`   Line ${warning.line}:${warning.column} - ${warning.error}`)
        console.log(`   ${warning.snippet}`)
      }
      if (fileWarnings.length > 3) {
        console.log(`   ... and ${fileWarnings.length - 3} more warnings`)
      }
    }
    console.log()
  }

  // Summary
  if (result.errors.length === 0) {
    console.log('✅ All MDX files are valid!')
    process.exit(0)
  } else {
    if (AUTO_FIX) {
      console.log(`✅ Auto-fixed ${totalFixesApplied} issues`)
      console.log('🔄 Run the script again without --fix to verify')
      process.exit(0)
    } else {
      console.log('❌ Validation failed!')
      console.log('💡 Run with --fix flag to auto-fix common issues:')
      console.log('   npx tsx scripts/validate-mdx-syntax.ts --fix')
      process.exit(1)
    }
  }
}

main().catch((error) => {
  console.error('❌ Error running validation:', error)
  process.exit(1)
})
