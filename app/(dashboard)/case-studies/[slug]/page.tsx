import type { JSX } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { loadMDXContent } from '@/lib/mdx'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const caseStudyPaths: Record<string, string> = {
  'rag-production-failures': 'content/week6/rag-production-failures.mdx',
  'langgraph-clinical-edge-cases':
    'content/case-studies/langgraph-clinical-edge-cases.mdx',
  'explainable-healthcare-agents':
    'content/case-studies/explainable-healthcare-agents.mdx',
  'cyber-defense-pipeline':
    'content/case-studies/cyber-defense-pipeline.mdx',
  'ai-medication-adherence':
    'content/case-studies/ai-medication-adherence.mdx',
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const contentPath = caseStudyPaths[slug]
  if (!contentPath) return { title: 'Case Study' }

  try {
    const { frontmatter } = await loadMDXContent(contentPath)
    return {
      title: (frontmatter as Record<string, string>).title || 'Case Study',
      description: (frontmatter as Record<string, string>).description,
    }
  } catch {
    return { title: 'Case Study' }
  }
}

export default async function CaseStudyPage({
  params,
}: Props): Promise<JSX.Element | null> {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const contentPath = caseStudyPaths[slug]
  if (!contentPath) notFound()

  let content: JSX.Element | null = null
  let frontmatter: Record<string, string> = {}

  try {
    const result = await loadMDXContent(contentPath)
    content = result.content as JSX.Element
    frontmatter = result.frontmatter as Record<string, string>
  } catch (error) {
    console.error('Failed to load case study:', error)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <Link href="/case-studies">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Case Studies
          </Button>
        </Link>

        {frontmatter.title && (
          <h1 className="text-3xl font-bold mb-2">{frontmatter.title}</h1>
        )}
        {frontmatter.description && (
          <p className="text-muted-foreground">{frontmatter.description}</p>
        )}
      </div>

      {content ? (
        <article className="prose prose-lg dark:prose-invert max-w-none">
          {content}
        </article>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Failed to load case study content
          </p>
        </div>
      )}

      <div className="mt-12 border-t pt-8">
        <Link href="/case-studies">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Case Studies
          </Button>
        </Link>
      </div>
    </div>
  )
}
