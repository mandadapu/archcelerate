'use client'

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { mdxComponents } from '@/src/lib/mdx/components'

interface ArchitectureTourContentProps {
  mdxSource: MDXRemoteSerializeResult
}

export function ArchitectureTourContent({ mdxSource }: ArchitectureTourContentProps) {
  return (
    <div className="prose prose-slate max-w-none">
      <MDXRemote {...mdxSource} components={mdxComponents} />
    </div>
  )
}
