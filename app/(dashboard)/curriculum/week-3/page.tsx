import type { JSX } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getWeekData } from '@/lib/curriculum/get-week-data'
import {
  Clock,
  ChevronRight,
  Database,
  Grid3x3,
  Workflow,
  Building2,
  Brain,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WeekContentTabs } from '@/components/curriculum/WeekContentTabs'
import { LearningObjectives } from '@/components/curriculum/LearningObjectives'

// Concept visualization icons - Week 3: RAG & Memory Fundamentals
function getConceptIllustration(slug: string) {
  const illustrations: Record<string, JSX.Element> = {
    'rag-memory-fundamentals': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Database className="h-7 w-7 text-primary" />
          <Brain className="h-6 w-6 text-info" />
        </div>
      </div>
    ),
    'vector-embeddings': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Grid3x3 className="h-7 w-7 text-warning" />
          <Database className="h-6 w-6 text-primary" />
        </div>
      </div>
    ),
    'rag-pipelines': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Workflow className="h-7 w-7 text-success" />
          <Database className="h-6 w-6 text-primary" />
        </div>
      </div>
    ),
    'production-rag-architecture': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Building2 className="h-7 w-7 text-info" />
          <Workflow className="h-6 w-6 text-primary" />
        </div>
      </div>
    ),
    'memory-systems': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Brain className="h-7 w-7 text-warning" />
          <Database className="h-6 w-6 text-primary" />
        </div>
      </div>
    ),
  }

  return illustrations[slug] || <ChevronRight className="h-8 w-8 text-muted-foreground opacity-40" />
}

export const metadata: Metadata = {
  title: 'Week 3: RAG & Memory Fundamentals (The Knowledge Base)',
  description: 'Build retrieval-augmented generation systems with vector databases'
}

export default async function Week3Page() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null // Middleware should redirect
  }

  const data = await getWeekData(3, session.user.email)
  if (!data) {
    return <div className="container max-w-4xl py-8">Week 3 not found</div>
  }
  const { week, concepts, lab, project, progress } = data

  const objectives = week.objectives as string[]

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground">Week 3</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">{week.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {week.description}
          </p>
        </div>

        {/* Technical Milestones - Premium Collapsible */}
        <LearningObjectives objectives={objectives} />

        {/* Content Tabs */}
        <WeekContentTabs
          conceptsCompleted={progress?.conceptsCompleted ?? 0}
          conceptsTotal={progress?.conceptsTotal ?? concepts.length}
          labCompleted={progress?.labCompleted ?? false}
          projectCompleted={progress?.projectCompleted ?? false}
          hasLab={!!lab}
          hasProject={!!project}
          conceptsContent={
            <div className="grid gap-4">
              {concepts.map((concept, i) => (
                <Link
                  key={concept.id}
                  href={`/curriculum/week-3/concepts/${concept.slug}`}
                  className="group border rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-950 dark:to-cyan-950"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 pt-1">
                      {getConceptIllustration(concept.slug)}
                    </div>

                    {/* Content column */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                        Concept {i + 1}
                      </div>
                      <h3 className="font-semibold text-lg leading-tight text-foreground mb-2">
                        {concept.title}
                      </h3>
                      {concept.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {concept.description}
                        </p>
                      )}
                      {concept.estimatedMinutes && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{concept.estimatedMinutes} minutes</span>
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-6" />
                  </div>
                </Link>
              ))}
            </div>
          }
          labContent={
            lab ? (
              <Link
                href={`/curriculum/week-3/lab/${lab.slug}`}
                className="group border rounded-lg p-6 hover:border-purple-400 transition-colors block bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-950 dark:to-cyan-950"
              >
                <h3 className="font-semibold text-xl mb-2">{lab.title}</h3>
                <p className="text-muted-foreground">{lab.description}</p>
                <div className="mt-4 text-sm text-muted-foreground">
                  {(lab.exercises as any[]).length} exercises
                </div>
              </Link>
            ) : null
          }
          projectContent={
            project ? (
              <Link
                href={`/curriculum/week-3/project/${project.slug}`}
                className="group border rounded-lg p-6 hover:border-purple-400 transition-colors block bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-purple-950 dark:to-cyan-950"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-xl mb-2">{project.title}</h3>
                    <p className="text-muted-foreground">{project.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      {project.estimatedHours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{project.estimatedHours} hours</span>
                        </div>
                      )}
                      <div>
                        {(project.requirements as string[]).length} requirements
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ) : null
          }
        />
        {/* Next Week Button */}
        <div className="border-t pt-8 mt-8">
          <div className="flex justify-end">
            <Link href="/curriculum/week-4">
              <Button variant="outline" size="lg">
                Next Week
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
