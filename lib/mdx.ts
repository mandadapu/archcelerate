import fs from 'fs/promises'
import path from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { CodePlayground } from '@/components/curriculum/CodePlayground'
import { mdxComponents } from '@/src/lib/mdx/components'

export async function loadMDXContent(contentPath: string) {
  const filePath = path.join(process.cwd(), contentPath)

  try {
    const source = await fs.readFile(filePath, 'utf-8')

    const { content, frontmatter } = await compileMDX({
      source,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeHighlight, rehypeSlug]
        }
      },
      components: {
        CodePlayground,
        ...mdxComponents
      }
    })

    return { content, frontmatter }
  } catch (error) {
    console.error('Error loading MDX content:', error)
    throw error
  }
}
