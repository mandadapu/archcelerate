import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { serialize } from 'next-mdx-remote/serialize'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'
import { ArchitectureTourContent } from './content'

export default async function ArchitectureTourPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const filePath = path.join(process.cwd(), 'content', 'architecture-tour.mdx')
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { content, data } = matter(fileContent)

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight],
    },
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <span>/</span>
        <span>{data.title}</span>
      </div>

      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-900">{data.title}</h1>
        <p className="text-slate-600 mt-2">{data.description}</p>
        <div className="flex gap-4 mt-4 text-sm text-slate-600">
          <span>⏱️ {data.estimatedMinutes} min</span>
        </div>
      </div>

      {/* MDX Content */}
      <ArchitectureTourContent mdxSource={mdxSource} />
    </div>
  )
}
