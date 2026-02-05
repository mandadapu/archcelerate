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
  Brain,
  Code2,
  Plug,
  CheckSquare,
  Layers,
  Blocks
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Concept visualization icons - Week 1: LLM Fundamentals
function getConceptIllustration(slug: string) {
  const illustrations: Record<string, JSX.Element> = {
    'llm-fundamentals': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Brain className="h-7 w-7 text-primary" />
          <Code2 className="h-6 w-6 text-info" />
        </div>
      </div>
    ),
    'prompt-engineering': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Code2 className="h-7 w-7 text-success" />
          <CheckSquare className="h-6 w-6 text-primary" />
        </div>
      </div>
    ),
    'api-integration': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Plug className="h-7 w-7 text-warning" />
          <Layers className="h-6 w-6 text-primary" />
        </div>
      </div>
    ),
    'production-readiness': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <CheckSquare className="h-7 w-7 text-success" />
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
      </div>
    ),
    'architecture-decisions': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Layers className="h-7 w-7 text-info" />
          <Blocks className="h-6 w-6 text-primary" />
        </div>
      </div>
    ),
    'visual-builders': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Blocks className="h-7 w-7 text-warning" />
          <Brain className="h-6 w-6 text-primary" />
        </div>
      </div>
    ),
  }

  return illustrations[slug] || <ChevronRight className="h-8 w-8 text-muted-foreground opacity-40" />
}

export const metadata: Metadata = {
  title: 'Week 1: LLM Fundamentals (The Engine)',
  description: 'Master foundation LLM capabilities: tokens, models, prompting, API integration, and production patterns'
}

export default async function Week1Page() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null // Middleware should redirect
  }

  // Fetch Week 1 data
  const week = await prisma.curriculumWeek.findUnique({
    where: { weekNumber: 1 }
  })

  if (!week) {
    return <div className="container max-w-4xl py-8">Week 1 not found</div>
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

  // Organize objectives by category
  const objectiveCategories = [
    {
      title: "Core Technical Understanding",
      icon: "🎯",
      objectives: objectives.slice(0, 4)
    },
    {
      title: "Architecture & Design",
      icon: "🏗️",
      objectives: objectives.slice(4, 8)
    },
    {
      title: "Production Readiness",
      icon: "🔒",
      objectives: objectives.slice(8, 14)
    },
    {
      title: "Cost & Performance",
      icon: "💰",
      objectives: objectives.slice(14, 18)
    },
    {
      title: "Week 1 Capstone",
      icon: "🚀",
      objectives: objectives.slice(18)
    }
  ]

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="text-sm text-muted-foreground mb-2">Week 1</div>
          <h1 className="text-4xl font-bold">{week.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {week.description}
          </p>
        </div>

        {/* Technical Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Milestones</CardTitle>
            <CardDescription>
              This week covers {objectives.length} key objectives across {objectiveCategories.length} focus areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {objectiveCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    {category.title}
                  </h3>
                  <ul className="space-y-2 ml-7">
                    {category.objectives.map((objective, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {progress && (
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
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
                href={`/curriculum/week-1/concepts/${concept.slug}`}
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
              href={`/curriculum/week-1/lab/${lab.slug}`}
              className="group border rounded-lg p-6 hover:border-primary transition-colors block"
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
              href={`/curriculum/week-1/project/${project.slug}`}
              className="group border rounded-lg p-6 hover:border-primary transition-colors block bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950"
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
                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
