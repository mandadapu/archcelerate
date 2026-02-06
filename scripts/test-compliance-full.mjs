import fs from 'fs/promises'
import path from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function test() {
  try {
    const filePath = path.join(__dirname, '..', 'content/week2/compliance-patterns.mdx')
    console.log('Testing MDX compilation for:', filePath)
    console.log('File exists:', await fs.access(filePath).then(() => true).catch(() => false))

    const source = await fs.readFile(filePath, 'utf-8')
    console.log('File size:', source.length, 'bytes')
    console.log('\nAttempting MDX compilation with production plugins...\n')

    const { content, frontmatter } = await compileMDX({
      source,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeHighlight, rehypeSlug]
        }
      }
    })

    console.log('✅ Successfully compiled!')
    console.log('Frontmatter:', frontmatter)
  } catch (error) {
    console.error('❌ Compilation failed!\n')
    console.error('Error:', error)
    if (error.message) {
      console.error('\nMessage:', error.message)
    }
    if (error.stack) {
      console.error('\nStack:', error.stack.split('\n').slice(0, 15).join('\n'))
    }
    process.exit(1)
  }
}

test()
