import fs from 'fs/promises'
import path from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function test() {
  try {
    const filePath = path.join(__dirname, '..', 'content/week2/responsible-ai.mdx')
    console.log('Testing MDX compilation for:', filePath)
    console.log('File exists:', await fs.access(filePath).then(() => true).catch(() => false))

    const source = await fs.readFile(filePath, 'utf-8')
    console.log('File size:', source.length, 'bytes')
    console.log('\nAttempting MDX compilation...\n')

    const { content, frontmatter } = await compileMDX({
      source,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          development: false
        }
      }
    })

    console.log('✅ Successfully compiled!')
    console.log('Frontmatter:', frontmatter)
  } catch (error) {
    console.error('❌ Compilation failed!\n')
    console.error('Error:', error)
    if (error instanceof Error) {
      console.error('\nMessage:', error.message)
      console.error('\nStack:', error.stack)

      // Try to get more details from the error
      if (error.cause) {
        console.error('\nCause:', error.cause)
      }

      // Check for position information
      if (error.position) {
        console.error('\nPosition:', error.position)
      }
      if (error.line) {
        console.error('\nLine:', error.line, 'Column:', error.column)
      }

      // Log the full error object
      console.error('\nFull error object:', JSON.stringify(error, null, 2))
    }
    process.exit(1)
  }
}

test()
