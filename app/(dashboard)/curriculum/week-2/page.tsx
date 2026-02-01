import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, Circle, Clock, Shield, DollarSign, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Week 2: Chat Assistant Production + Governance Foundations',
  description: 'Build production-ready chat applications with comprehensive governance'
}

export default async function Week2Page() {
  const supabase = createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch Week 2 data
  const { data: week } = await supabase
    .from('curriculum_weeks')
    .select('*')
    .eq('week_number', 2)
    .single()

  if (!week) {
    return <div className="container max-w-4xl py-8">Week 2 not found</div>
  }

  // Fetch concepts
  const { data: concepts } = await supabase
    .from('concepts')
    .select('*')
    .eq('week_id', week.id)
    .order('order_index', { ascending: true })

  // Fetch lab
  const { data: lab } = await supabase
    .from('labs')
    .select('*')
    .eq('week_id', week.id)
    .single()

  // Fetch project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('week_id', week.id)
    .single()

  // Fetch user progress
  const { data: progress } = await supabase
    .from('user_week_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_id', week.id)
    .single()

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

        {/* Week 2 Focus: Governance */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle>Week 2 Focus: Production + Governance</CardTitle>
            <CardDescription>
              Build production-ready AI applications with proper guardrails from day one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Guardrails</h4>
                  <p className="text-sm text-muted-foreground">
                    Input validation, content moderation, rate limiting
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Cost Control</h4>
                  <p className="text-sm text-muted-foreground">
                    Budget tracking, usage monitoring, optimization
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Observability</h4>
                  <p className="text-sm text-muted-foreground">
                    Logging, monitoring, audit trails, analytics
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {progress && (
          <Card className="bg-green-50 dark:bg-green-950 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Progress</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {progress.concepts_completed} / {progress.concepts_total} concepts
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {progress.concepts_completed === progress.concepts_total ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <span>Concepts</span>
                </div>
                <div className="flex items-center gap-2">
                  {progress.lab_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <span>Lab</span>
                </div>
                <div className="flex items-center gap-2">
                  {progress.project_completed ? (
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
            {concepts?.map((concept, i) => (
              <Link
                key={concept.id}
                href={`/curriculum/week-2/concepts/${concept.slug}`}
                className="border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Concept {i + 1}
                    </div>
                    <h3 className="font-semibold text-lg">{concept.title}</h3>
                    {concept.estimated_minutes && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{concept.estimated_minutes} minutes</span>
                      </div>
                    )}
                  </div>
                  <Circle className="h-5 w-5 text-gray-400" />
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
              href={`/curriculum/week-2/lab`}
              className="block border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-xl mb-2">{lab.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {lab.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {(lab.exercises as any[]).length} exercises
                    </span>
                  </div>
                </div>
                <Circle className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          </div>
        )}

        {/* Project */}
        {project && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Project</h2>
            <Link
              href={`/curriculum/week-2/project`}
              className="block border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-xl mb-2">{project.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                      ~{project.estimated_hours} hours
                    </span>
                    <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      {(project.requirements as any[]).length} requirements
                    </span>
                  </div>
                </div>
                <Circle className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          </div>
        )}

        {/* Governance Dashboard Link */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <CardTitle>Governance Dashboard</CardTitle>
            <CardDescription>
              Monitor your AI usage, costs, and compliance in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/governance">
              <Button>
                View Governance Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
