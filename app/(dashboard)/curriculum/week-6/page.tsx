import { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Search,
  Database,
  Sparkles,
  ArrowUpDown,
  Settings,
  GitBranch,
  Filter,
  Columns,
  Activity,
  BarChart3,
  Eye,
  Gauge,
  TrendingUp,
  Server,
  Rocket
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LearningObjectives } from './components/LearningObjectives'
import { WeekHeader } from './components/WeekHeader'

// Concept visualization icons - Week 6: Advanced RAG (The Optimizer)
// Using teal/cyan theme for technical "optimizer/filter" feel, distinguishing from Week 5's indigo/blue
function getConceptIllustration(slug: string) {
  const illustrations: Record<string, JSX.Element> = {
    'hybrid-retrieval-reranking': (
      <div className="w-20 flex items-center justify-start opacity-75 group-hover:opacity-90 transition-opacity">
        <div className="flex items-center gap-1.5">
          <Search className="h-7 w-7 text-teal-600" />
          <ArrowUpDown className="h-5 w-5 text-cyan-500" />
          <Database className="h-6 w-6 text-teal-500" />
        </div>
      </div>
    ),
    'query-transformation-patterns': (
      <div className="w-20 flex items-center justify-start opacity-75 group-hover:opacity-90 transition-opacity">
        <div className="flex items-center gap-1.5">
          <Settings className="h-7 w-7 text-teal-600" />
          <GitBranch className="h-6 w-6 text-cyan-500" />
        </div>
      </div>
    ),
    'context-window-optimization': (
      <div className="w-20 flex items-center justify-start opacity-75 group-hover:opacity-90 transition-opacity">
        <div className="flex items-center gap-1.5">
          <Filter className="h-7 w-7 text-teal-600" />
          <Columns className="h-6 w-6 text-cyan-500" />
        </div>
      </div>
    ),
    'enterprise-rag-hardening': (
      <div className="w-20 flex items-center justify-start opacity-75 group-hover:opacity-90 transition-opacity">
        <div className="flex items-center gap-1.5">
          <Shield className="h-7 w-7 text-teal-600" />
          <Activity className="h-6 w-6 text-cyan-500" />
          <BarChart3 className="h-5 w-5 text-teal-500" />
        </div>
      </div>
    ),
    'observability-basics': (
      <div className="w-20 flex items-center justify-start opacity-75 group-hover:opacity-90 transition-opacity">
        <div className="flex items-center gap-1.5">
          <Eye className="h-7 w-7 text-teal-600" />
          <Activity className="h-6 w-6 text-cyan-500" />
        </div>
      </div>
    ),
    'monitoring-ai-systems': (
      <div className="w-20 flex items-center justify-start opacity-75 group-hover:opacity-90 transition-opacity">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="h-7 w-7 text-teal-600" />
          <Gauge className="h-6 w-6 text-cyan-500" />
        </div>
      </div>
    ),
    'performance-optimization': (
      <div className="w-20 flex items-center justify-start opacity-75 group-hover:opacity-90 transition-opacity">
        <div className="flex items-center gap-1.5">
          <Zap className="h-7 w-7 text-cyan-500" />
          <Database className="h-6 w-6 text-teal-600" />
          <TrendingUp className="h-5 w-5 text-teal-500" />
        </div>
      </div>
    ),
    'production-deployment': (
      <div className="w-20 flex items-center justify-start opacity-75 group-hover:opacity-90 transition-opacity">
        <div className="flex items-center gap-1.5">
          <Server className="h-6 w-6 text-gray-500" />
          <Rocket className="h-7 w-7 text-teal-600" />
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
      </div>
    ),
  }

  return illustrations[slug] || <ChevronRight className="h-8 w-8 text-muted-foreground opacity-40" />
}

export const metadata: Metadata = {
  title: 'Week 6: Advanced RAG (The Optimizer)',
  description: 'Deploy AI systems with monitoring, caching, and reliability'
}

export default async function Week6Page() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null // Middleware should redirect
  }

  // Fetch Week 6 data
  const week = await prisma.curriculumWeek.findUnique({
    where: { weekNumber: 6 }
  })

  if (!week) {
    return <div className="container max-w-4xl py-8">Week 6 not found</div>
  }

  // Fetch concepts
  const concepts = await prisma.concept.findMany({
    where: { weekId: week.id },
    orderBy: { orderIndex: 'asc' }
  })

  // Fetch lab
  const lab = await prisma.lab.findFirst({
    where: { weekId: week.id }
  })

  // Fetch project
  const project = await prisma.weekProject.findFirst({
    where: { weekId: week.id }
  })

  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  // Fetch user progress
  const progress = user ? await prisma.userWeekProgress.findUnique({
    where: {
      userId_weekId: {
        userId: user.id,
        weekId: week.id
      }
    }
  }) : null

  const objectives = week.objectives as string[]

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        {/* Header with Overview Tooltip */}
        <WeekHeader title={week.title} description={week.description || ''} />

        {/* Learning Objectives - Premium Collapsible */}
        <LearningObjectives objectives={objectives} />

        {/* Progress Overview */}
        {progress && (
          <Card className="bg-teal-50 dark:bg-teal-950 border-teal-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Progress</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {progress.conceptsCompleted} / {progress.conceptsTotal} concepts
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {progress.conceptsCompleted === progress.conceptsTotal ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <span>Concepts</span>
                </div>
                <div className="flex items-center gap-2">
                  {progress.labCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <span>Lab</span>
                </div>
                <div className="flex items-center gap-2">
                  {progress.projectCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <span>Project</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Concepts */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Concepts</h2>
          <div className="grid gap-4">
            {concepts.map((concept, i) => (
              <Link
                key={concept.id}
                href={`/curriculum/week-6/concepts/${concept.slug}`}
                className="group border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 pt-1">
                    {getConceptIllustration(concept.slug)}
                  </div>

                  {/* Content column */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
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
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-6" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Lab */}
        {lab && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Lab</h2>
            <Link
              href={`/curriculum/week-6/lab/${lab.slug}`}
              className="group border rounded-lg p-6 hover:border-blue-600 transition-colors block bg-blue-50/50 dark:bg-blue-950/50"
            >
              <h3 className="font-semibold text-xl mb-2">{lab.title}</h3>
              <p className="text-muted-foreground">{lab.description}</p>
              <div className="mt-4 text-sm text-muted-foreground">
                {(lab.exercises as any[]).length} exercises
              </div>
            </Link>
          </div>
        )}

        {/* Project */}
        {project && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Project</h2>
            <Link
              href={`/curriculum/week-6/project/${project.slug}`}
              className="group border rounded-lg p-6 hover:border-violet-600 transition-colors block bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950"
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
                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
