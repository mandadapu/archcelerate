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
  {
    slug: 'explainable-healthcare-agents',
    title: 'Explainable Healthcare AI with Specialized Agents',
    description:
      'Building a multi-agent system with 6 specialized agents for file processing, privacy protection, data prep, matching, and interpretable predictions',
    tags: ['Multi-Agent', 'Explainability', 'HIPAA', 'SHAP', 'Healthcare'],
  },
  {
    slug: 'cyber-defense-pipeline',
    title: 'AI Cyber-Defense Pipeline with Multi-Model Routing',
    description:
      'Building a 4-agent security log analysis pipeline using LangGraph with Haiku, Sonnet, and Opus for cost-optimized threat detection and incident reporting',
    tags: ['Multi-Agent', 'LangGraph', 'Cost Optimization', 'Security'],
  },
  {
    slug: 'ai-medication-adherence',
    title: 'AI for Medication Adherence',
    description:
      'How predictive ML models close the gap between prescribed medications and patient behavior — a $500 billion problem hiding in plain sight',
    tags: ['Healthcare', 'Predictive ML', 'Feynman Method', 'Production AI'],
  },
  {
    slug: 'zero-exposure-proxy-healthcare',
    title: 'Zero-Exposure Proxy Pattern for Healthcare AI',
    description:
      'How certificate pinning, credential isolation, and a hardened API proxy eliminate the biggest mobile security vulnerabilities when handling sensitive medical data',
    tags: ['Security', 'Healthcare', 'HIPAA', 'Mobile Architecture'],
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
