import type { JSX } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  Lock,
  TestTube2,
  FileCheck,
  Eye,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LearningObjectives } from './components/LearningObjectives'
import { WeekContentTabs } from '@/components/curriculum/WeekContentTabs'

// Concept visualization icons - Week 2: AI Safety & Governance
function getConceptIllustration(slug: string) {
  const illustrations: Record<string, JSX.Element> = {
    'safety-governance-fundamentals': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Shield className="h-7 w-7 text-primary" />
          <Lock className="h-6 w-6 text-success" />
        </div>
      </div>
    ),
    'jailbreak-defense': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Lock className="h-7 w-7 text-error" />
          <Shield className="h-6 w-6 text-warning" />
        </div>
      </div>
    ),
    'ai-testing-nfrs': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <TestTube2 className="h-7 w-7 text-info" />
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
      </div>
    ),
    'compliance-patterns': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <FileCheck className="h-7 w-7 text-primary" />
          <Shield className="h-6 w-6 text-success" />
        </div>
      </div>
    ),
    'transparency-explainability': (
      <div className="flex items-center justify-center w-16 h-16 opacity-60">
        <div className="flex items-center gap-1.5">
          <Eye className="h-7 w-7 text-info" />
          <FileCheck className="h-6 w-6 text-primary" />
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground">Week 2</span>
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
                  href={`/curriculum/week-2/concepts/${concept.slug}`}
                  className="group border rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-950 dark:to-cyan-950"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                      {getConceptIllustration(concept.slug)}
                    </div>
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
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-6" />
                  </div>
                </Link>
              ))}
            </div>
          }
          labContent={
            lab ? (
              <Link
                href={`/curriculum/week-2/lab/${lab.slug}`}
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
                href={`/curriculum/week-2/project/${project.slug}`}
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
            <Link href="/curriculum/week-3">
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
