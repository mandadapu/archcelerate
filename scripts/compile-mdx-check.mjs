/**
 * MDX Compilation Check
 *
 * Compiles all MDX files using @mdx-js/mdx to catch syntax errors
 * that regex-based validation misses (e.g., bare JSX-like tags, unclosed elements).
 *
 * Usage: node scripts/compile-mdx-check.mjs
 */

import * as fs from 'fs'
import * as path from 'path'
import { compile } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = path.join(__dirname, '..', 'content')

function getAllMdxFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      files.push(...getAllMdxFiles(fullPath))
    } else if (item.name.endsWith('.mdx')) {
      files.push(fullPath)
    }
  }

  return files
}

async function main() {
  const mdxFiles = getAllMdxFiles(CONTENT_DIR)
  const failures = []

  for (const filePath of mdxFiles) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const relativePath = path.relative(process.cwd(), filePath)

    try {
      await compile(content, {
        remarkPlugins: [remarkGfm],
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failures.push({ file: relativePath, error: message })
    }
  }

  if (failures.length > 0) {
    console.error(`MDX compilation failed for ${failures.length} file(s):\n`)
    for (const { file, error } of failures) {
      console.error(`  ${file}:`)
      console.error(`    ${error}\n`)
    }
    process.exit(1)
  }

  console.log(`All MDX files compiled successfully (${mdxFiles.length} files)`)
}

main().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
