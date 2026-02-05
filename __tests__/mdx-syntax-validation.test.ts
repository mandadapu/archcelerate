import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { expect } from '@jest/globals'

/**
 * MDX Syntax Validation Tests
 *
 * These tests catch common MDX syntax errors that cause "Failed to load concept content" errors.
 * Run these tests before committing changes to content files.
 */

describe('MDX Syntax Validation', () => {
  // Get all MDX files from content directory
  const getAllMdxFiles = (dir: string): string[] => {
    const files: string[] = []
    const items = readdirSync(dir, { withFileTypes: true })

    for (const item of items) {
      const fullPath = join(dir, item.name)
      if (item.isDirectory()) {
        files.push(...getAllMdxFiles(fullPath))
      } else if (item.name.endsWith('.mdx')) {
        files.push(fullPath)
      }
    }

    return files
  }

  const contentDir = join(process.cwd(), 'content')
  const mdxFiles = getAllMdxFiles(contentDir)

  describe('Comparison Operator Escaping', () => {
    test.each(mdxFiles)('%s should have escaped less-than before numbers', (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      const relativePath = filePath.replace(process.cwd(), '')

      // Match <digit patterns that are NOT part of HTML entities or tags
      const unescapedLessThanPattern = /(?<!&lt;)(?<!&amp;lt;)<(\d)/g
      const matches = [...content.matchAll(unescapedLessThanPattern)]

      if (matches.length > 0) {
        const examples = matches.slice(0, 3).map(m => {
          const lineNum = content.substring(0, m.index).split('\n').length
          const line = content.split('\n')[lineNum - 1]
          return `  Line ${lineNum}: ${line.trim()}`
        }).join('\n')

        expect(matches.length).toBe(0)
      }
    })

    test.each(mdxFiles)('%s should have escaped greater-than before numbers', (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      const relativePath = filePath.replace(process.cwd(), '')

      // Match >digit patterns that are NOT part of HTML entities or tags
      const unescapedGreaterThanPattern = /(?<!&gt;)(?<!&amp;gt;)>(\d)/g
      const matches = [...content.matchAll(unescapedGreaterThanPattern)]

      if (matches.length > 0) {
        const examples = matches.slice(0, 3).map(m => {
          const lineNum = content.substring(0, m.index).split('\n').length
          const line = content.split('\n')[lineNum - 1]
          return `  Line ${lineNum}: ${line.trim()}`
        }).join('\n')

        fail(`Found ${matches.length} unescaped '>' before numbers in ${relativePath}:\n${examples}\n\nFix: Replace '>digit' with '&gt;digit'`)
      }
    })

    test.each(mdxFiles)('%s should have properly escaped comparison operators in text', (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      const relativePath = filePath.replace(process.cwd(), '')

      // Skip code blocks
      const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '')

      // Common patterns that need escaping in prose/markdown (not in code)
      const problematicPatterns = [
        { pattern: /\b(latency|cost|time|tokens|score|value|similarity|relevance|precision|recall)\s+<\s*\d/gi, fix: 'Use &lt; instead of <' },
        { pattern: /\b(latency|cost|time|tokens|score|value|similarity|relevance|precision|recall)\s+>\s*\d/gi, fix: 'Use &gt; instead of >' },
      ]

      for (const { pattern, fix } of problematicPatterns) {
        const matches = [...withoutCodeBlocks.matchAll(pattern)]

        if (matches.length > 0) {
          const examples = matches.slice(0, 2).map(m => {
            const lineNum = content.substring(0, m.index).split('\n').length
            const line = content.split('\n')[lineNum - 1]
            return `  Line ${lineNum}: ${line.trim()}`
          }).join('\n')

          fail(`Found ${matches.length} unescaped comparison operators in ${relativePath}:\n${examples}\n\nFix: ${fix}`)
        }
      }
    })
  })

  describe('Common MDX Pitfalls', () => {
    test.each(mdxFiles)('%s should not have JSX-like syntax with numbers', (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      const relativePath = filePath.replace(process.cwd(), '')

      // Skip code blocks
      const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '')

      // Check for patterns like <3 or >10 that aren't HTML entities
      const jsxLikeNumberPattern = /(?<!&[lg]t;)(?<!&amp;[lg]t;)[<>]\d+(?![^<]*>)/g
      const matches = [...withoutCodeBlocks.matchAll(jsxLikeNumberPattern)]

      if (matches.length > 0) {
        const examples = matches.slice(0, 3).map(m => {
          const lineNum = content.substring(0, m.index).split('\n').length
          const line = content.split('\n')[lineNum - 1]
          return `  Line ${lineNum}: ${line.trim()}`
        }).join('\n')

        fail(`Found ${matches.length} JSX-like number patterns in ${relativePath}:\n${examples}\n\nThese can cause MDX to interpret them as invalid tags.`)
      }
    })

    test.each(mdxFiles)('%s should have valid frontmatter', (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      const relativePath = filePath.replace(process.cwd(), '')

      // Check if file starts with frontmatter
      if (!content.trim().startsWith('---')) {
        fail(`${relativePath} is missing frontmatter (should start with '---')`)
      }

      // Check for closing frontmatter delimiter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (!frontmatterMatch) {
        fail(`${relativePath} has malformed frontmatter (missing closing '---')`)
      }
    })

    test.each(mdxFiles)('%s should not have unclosed JSX tags', (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      const relativePath = filePath.replace(process.cwd(), '')

      // Skip code blocks
      const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '')

      // Simple check for common unclosed tags (not comprehensive, but catches obvious issues)
      const tagStack: string[] = []
      const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link']

      // Very basic tag matching (this could be improved with a proper parser)
      const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g
      const matches = [...withoutCodeBlocks.matchAll(tagPattern)]

      for (const match of matches) {
        const fullTag = match[0]
        const tagName = match[1].toLowerCase()

        if (selfClosingTags.includes(tagName)) continue
        if (fullTag.startsWith('</')) {
          // Closing tag
          if (tagStack[tagStack.length - 1] === tagName) {
            tagStack.pop()
          }
        } else if (!fullTag.endsWith('/>')) {
          // Opening tag (not self-closing)
          tagStack.push(tagName)
        }
      }

      if (tagStack.length > 0) {
        fail(`${relativePath} may have unclosed JSX tags: ${tagStack.join(', ')}`)
      }
    })
  })

  describe('Content Quality', () => {
    test.each(mdxFiles)('%s should not be empty', (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      const relativePath = filePath.replace(process.cwd(), '')

      if (content.trim().length === 0) {
        fail(`${relativePath} is empty`)
      }
    })

    test.each(mdxFiles)('%s should have meaningful content after frontmatter', (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      const relativePath = filePath.replace(process.cwd(), '')

      // Remove frontmatter
      const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '')

      if (withoutFrontmatter.trim().length < 100) {
        fail(`${relativePath} has less than 100 characters of content (excluding frontmatter)`)
      }
    })
  })
})
