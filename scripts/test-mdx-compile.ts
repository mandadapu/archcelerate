import { loadMDXContent } from '@/lib/mdx'

async function test() {
  try {
    console.log('Testing MDX compilation for responsible-ai.mdx...\n')
    const result = await loadMDXContent('content/week2/responsible-ai.mdx')
    console.log('✅ Successfully compiled!')
    console.log('Frontmatter:', result.frontmatter)
  } catch (error) {
    console.error('❌ Compilation failed:\n')
    console.error(error)
    if (error instanceof Error) {
      console.error('\nError message:', error.message)
      if (error.stack) {
        console.error('\nStack trace:')
        console.error(error.stack.split('\n').slice(0, 10).join('\n'))
      }
    }
    process.exit(1)
  }
}

test()
