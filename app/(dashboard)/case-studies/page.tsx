import type { JSX } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Production Case Studies',
  description: 'Real-world AI system failures, fallback architectures, and production fixes',
}

const caseStudies = [
  {
    slug: 'rag-production-failures',
    title: 'RAG Production Failure Patterns',
    description:
      'Diagnosing context poisoning, stale retrieval, and latency spikes in a production RAG pipeline',
    tags: ['RAG', 'pgvector', 'LangGraph', 'Healthcare'],
  },
  {
    slug: 'langgraph-clinical-edge-cases',
    title: 'LangGraph Edge Cases in Clinical AI',
    description:
      'Preventing fabrication in cyclic workflows and building graceful human handoff architecture',
    tags: ['LangGraph', 'Clinical AI', 'HIPAA', 'Human-in-the-Loop'],
  },
]

export default async function CaseStudiesPage(): Promise<JSX.Element | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Production Case Studies</h1>
        <p className="text-muted-foreground">
          Real-world AI system failures and architectural solutions from
          production environments
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {caseStudies.map((study) => (
          <Link key={study.slug} href={`/case-studies/${study.slug}`}>
            <Card className="h-full hover:border-purple-400 hover:shadow-md transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{study.title}</CardTitle>
                <CardDescription>{study.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {study.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  Read case study <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
