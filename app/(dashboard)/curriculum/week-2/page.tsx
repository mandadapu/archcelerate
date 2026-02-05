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
  Shield,
  Lock,
  TestTube2,
  FileCheck,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Concept visualization icons - Week 2: AI Safety & Governance
function getConceptIllustration(slug: string) {
  const illustrations: Record<string, JSX.Element> = {
    'safety-governance-fundamentals': (
      <div className="flex items-center gap-2 opacity-50">
        <Shield className="h-9 w-9 text-primary" />
        <div className="flex flex-col gap-1">
          <Lock className="h-5 w-5 text-success" />
          <Eye className="h-5 w-5 text-info" />
        </div>
      </div>
    ),
    'jailbreak-defense': (
      <div className="flex items-center gap-2 opacity-50">
        <Lock className="h-9 w-9 text-error" />
        <Shield className="h-7 w-7 text-success" />
      </div>
    ),
    'ai-testing-nfrs': (
      <div className="flex items-center gap-2 opacity-50">
        <TestTube2 className="h-8 w-8 text-primary" />
        <div className="flex flex-col gap-1">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <FileCheck className="h-5 w-5 text-primary/70" />
        </div>
      </div>
    ),
    'compliance-patterns': (
      <div className="flex items-center gap-2 opacity-50">
        <FileCheck className="h-9 w-9 text-primary" />
        <Shield className="h-7 w-7 text-success" />
      </div>
    ),
    'transparency-explainability': (
      <div className="flex items-center gap-2 opacity-50">
        <Eye className="h-9 w-9 text-info" />
        <div className="flex flex-col gap-1">
          <FileCheck className="h-5 w-5 text-primary" />
          <Shield className="h-5 w-5 text-success/70" />
        </div>
      </div>
    ),
  }

  return illustrations[slug] || <ChevronRight className="h-8 w-8 text-muted-foreground opacity-40" />
}

export const metadata: Metadata = {
  title: 'Week 2: AI Safety & Governance (The Guardrails)',
  description: 'Build production AI with proper governance, fairness, compliance, and safety controls'
}

export default async function Week2Page() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null // Middleware should redirect
  }

  // Fetch Week 2 data
  const week = await prisma.curriculumWeek.findUnique({
    where: { weekNumber: 2 }
  })

  if (!week) {
    return <div className="container max-w-4xl py-8">Week 2 not found</div>
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
        {/* Header */}
        <div>
          <div className="text-sm text-muted-foreground mb-2">Week 2</div>
          <h1 className="text-4xl font-bold">{week.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {week.description}
          </p>
        </div>

        {/* Learning Objectives */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {objectives.map((objective, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {progress && (
          <Card className="bg-red-50 dark:bg-red-950 border-red-200">
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
                href={`/curriculum/week-2/concepts/${concept.slug}`}
                className="group border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10"
              >
                <div className="flex items-center gap-4">
                  {/* Icon first */}
                  <div className="flex-shrink-0">
                    {getConceptIllustration(concept.slug)}
                  </div>

                  {/* Label and title together */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">
                        Concept {i + 1}
                      </span>
                      {concept.estimatedMinutes && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {concept.estimatedMinutes} min
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg leading-tight text-foreground">
                      {concept.title}
                    </h3>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
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
              href={`/curriculum/week-2/lab/${lab.slug}`}
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
              href={`/curriculum/week-2/project/${project.slug}`}
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
