import fs from 'fs/promises'
import path from 'path'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { CodePlayground } from '@/components/curriculum/CodePlayground'
import { mdxComponents } from '@/src/lib/mdx/components'
import { getCached, setCached } from '@/lib/redis/client'

// Cache file reads using Next.js Data Cache + Redis
const getFileContent = unstable_cache(
  async (filePath: string): Promise<string> => {
    const cacheKey = `mdx:source:${filePath}`

    try {
      // Try to get from Redis cache
      const cached = await getCached<{ content: string; mtime: number }>(cacheKey)

      if (cached) {
        // Check if file has been modified
        const stats = await fs.stat(filePath)
        if (stats.mtimeMs === cached.mtime) {
          return cached.content
        }
      }

      // Read from file system
      const content = await fs.readFile(filePath, 'utf-8')
      const stats = await fs.stat(filePath)

      // Cache for 1 hour (3600 seconds)
      await setCached(cacheKey, { content, mtime: stats.mtimeMs }, 3600)

      return content
    } catch (error) {
      // If Redis fails, fallback to direct file read
      return fs.readFile(filePath, 'utf-8')
    }
  },
  ['mdx-file-content'],
  {
    revalidate: 3600, // Revalidate every 1 hour
    tags: ['mdx-content']
  }
)

// Cache compiled MDX in memory per request using React cache()
const compileMDXCached = cache(async (source: string, contentPath: string) => {
  return compileMDX({
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
})

export async function loadMDXContent(contentPath: string) {
  const filePath = path.join(process.cwd(), contentPath)
  const startTime = Date.now()

  try {
    // Get file content (cached in Redis + Next.js Data Cache)
    const source = await getFileContent(filePath)

    // Compile MDX (cached in memory per request)
    const { content, frontmatter } = await compileMDXCached(source, contentPath)

    const loadTime = Date.now() - startTime
    if (loadTime > 100) {
      console.log(`[MDX] Loaded ${contentPath} in ${loadTime}ms`)
    }

    return { content, frontmatter }
  } catch (error) {
    console.error('Error loading MDX content:', error)
    throw error
  }
}

// Helper function to clear MDX cache (useful for development)
export async function clearMDXCache(contentPath?: string) {
  const { revalidateTag } = await import('next/cache')
  const { deleteCached } = await import('@/lib/redis/client')

  if (contentPath) {
    const filePath = path.join(process.cwd(), contentPath)
    await deleteCached(`mdx:source:${filePath}`)
  }

  // Revalidate all MDX content
  revalidateTag('mdx-content')
}
