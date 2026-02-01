import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, ArrowLeft, ExternalLink, Github, Shield, DollarSign, Activity } from 'lucide-react'
import { ProjectSubmissionForm } from './project-submission-form'

export const metadata: Metadata = {
  title: 'Week 2 Project: Production Chat Assistant (Enhanced)',
  description: 'Build production-ready chat application with full governance implementation'
}

export default async function Week2ProjectPage() {
  const supabase = createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch Week 2
  const { data: week } = await supabase
    .from('curriculum_weeks')
    .select('*')
    .eq('week_number', 2)
    .single()

  if (!week) {
    return <div>Week 2 not found</div>
  }

  // Fetch project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('week_id', week.id)
    .single()

  if (!project) {
    return <div>Project not found</div>
  }

  const requirements = project.requirements as string[]
  const successCriteria = project.success_criteria as string[]

  // Fetch user's project submission
  const { data: submission } = await supabase
    .from('project_submissions')
    .select('*')
    .eq('user_id', user.id)
    .eq('project_id', project.id)
    .single()

  const isSubmitted = submission?.status === 'submitted'

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        {/* Back button */}
        <Link href="/curriculum/week-2">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Week 2
          </Button>
        </Link>

        {/* Header */}
        <div>
          <div className="text-sm text-muted-foreground mb-2">Week 2 Project</div>
          <h1 className="text-4xl font-bold">{project.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {project.description}
          </p>
          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full">
              ~{project.estimated_hours} hours
            </span>
            {isSubmitted && (
              <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Submitted
              </span>
            )}
          </div>
        </div>

        {/* Governance Focus */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle>Project Focus: Production + Governance</CardTitle>
            <CardDescription>
              This project demonstrates your ability to build production-ready AI systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Guardrails</h4>
                  <p className="text-xs text-muted-foreground">
                    Validation, moderation, rate limiting
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Cost Control</h4>
                  <p className="text-xs text-muted-foreground">
                    Budget tracking, usage monitoring
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Observability</h4>
                  <p className="text-xs text-muted-foreground">
                    Logging, monitoring, analytics
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>
              Your project must implement all of these features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Success Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Success Criteria</CardTitle>
            <CardDescription>
              How we&apos;ll evaluate your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {successCriteria.map((criterion, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 border-2 border-gray-400 rounded-full mt-0.5 flex-shrink-0" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Architecture Guidance */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <CardTitle>Architecture Guidance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Recommended Stack:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Next.js 14 + TypeScript (or Python + FastAPI)</li>
                <li>Supabase (Auth + Database) or PostgreSQL</li>
                <li>Redis (Upstash) for rate limiting</li>
                <li>Claude API (Anthropic SDK)</li>
                <li>Vercel or similar for deployment</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Key Components to Implement:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>lib/governance/* - All governance services</li>
                <li>app/api/chat - Main chat endpoint with full governance pipeline</li>
                <li>app/(dashboard)/governance - Governance dashboard</li>
                <li>Database schema - Users, conversations, messages, governance logs</li>
                <li>Frontend - Chat UI with conversation history</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Reference Implementation:</h4>
              <p className="text-sm text-muted-foreground">
                You can review the code we built together in Week 2 as a reference.
                Your implementation should demonstrate understanding and include your own improvements.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Project</CardTitle>
            <CardDescription>
              {isSubmitted
                ? 'Your project has been submitted. You can update it anytime.'
                : 'Submit your GitHub repository and deployed application'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectSubmissionForm
              projectId={project.id}
              weekId={week.id}
              initialData={{
                githubUrl: submission?.github_url || '',
                deployedUrl: submission?.deployed_url || '',
                writeupContent: submission?.writeup_content || ''
              }}
              isSubmitted={isSubmitted}
            />
          </CardContent>
        </Card>

        {/* Testing Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Checklist</CardTitle>
            <CardDescription>
              Verify these before submitting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Test all governance features</p>
                  <p className="text-sm text-muted-foreground">
                    Send 11 messages to trigger rate limiting, test with long/empty messages, check moderation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Verify governance dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    Check that all metrics update correctly (cost, requests, latency, budget)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Test conversation persistence</p>
                  <p className="text-sm text-muted-foreground">
                    Create conversation, refresh page, verify history loads correctly
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Check error handling</p>
                  <p className="text-sm text-muted-foreground">
                    Test with invalid API key, network failures, exceeded budget
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Performance check</p>
                  <p className="text-sm text-muted-foreground">
                    Verify 90% of responses under 2 seconds
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion */}
        {isSubmitted && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Project Submitted!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Great work completing Week 2! You now have a production-ready chat application with comprehensive governance.
              </p>
              <div className="space-y-2">
                {submission?.github_url && (
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    <a
                      href={submission.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View on GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {submission?.deployed_url && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <a
                      href={submission.deployed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View Live Demo
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
