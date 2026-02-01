import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, ArrowLeft, Code, Shield, Activity, DollarSign, FileText } from 'lucide-react'
import { LabExerciseClient } from './lab-exercise-client'

export const metadata: Metadata = {
  title: 'Week 2 Lab: Governance Implementation',
  description: 'Implement input validation, content filtering, logging, rate limiting, and cost tracking'
}

export default async function Week2LabPage() {
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

  if (!week) notFound()

  // Fetch lab
  const { data: lab } = await supabase
    .from('labs')
    .select('*')
    .eq('week_id', week.id)
    .single()

  if (!lab) notFound()

  const exercises = lab.exercises as Array<{
    number: number
    title: string
    type: string
  }>

  // Fetch user's lab submissions
  const { data: submissions } = await supabase
    .from('lab_submissions')
    .select('*')
    .eq('user_id', user.id)
    .eq('lab_id', lab.id)
    .order('exercise_number', { ascending: true })

  const submissionMap = new Map(
    submissions?.map(s => [s.exercise_number, s]) || []
  )

  const completedCount = submissions?.filter(s => s.completed).length || 0

  // Exercise descriptions and hints
  const exerciseDetails = [
    {
      number: 1,
      title: 'Implement Input Validation with Edge Cases',
      icon: Shield,
      description: 'Build robust input validation using Zod that handles edge cases like empty strings, extremely long inputs, null bytes, and XSS attempts.',
      hints: [
        'Use Zod for schema validation',
        'Test with empty strings, very long strings (>4000 chars)',
        'Handle null bytes (\\0) in content',
        'Sanitize for XSS (< and > characters)',
        'Return clear error messages'
      ],
      testCases: [
        '{ content: "" } - should reject',
        '{ content: "A".repeat(4001) } - should reject',
        '{ content: "Hello\\0World" } - should sanitize',
        '{ content: "<script>alert(1)</script>" } - should escape'
      ]
    },
    {
      number: 2,
      title: 'Add Content Filtering with Anthropic Moderation',
      icon: Shield,
      description: 'Implement content moderation that checks both user inputs and AI outputs for policy violations using Claude.',
      hints: [
        'Use Claude 3 Haiku for fast, cheap moderation',
        'Check for: hate, sexual, violence, self_harm, harassment',
        'Moderate both input and output',
        'Log all moderation decisions to database',
        'Return 400 for blocked inputs, 500 for blocked outputs'
      ],
      testCases: [
        'Test with normal content - should allow',
        'Test with policy-violating content - should block',
        'Verify moderation logs are created',
        'Check both input and output moderation work'
      ]
    },
    {
      number: 3,
      title: 'Build Request Logging System',
      icon: FileText,
      description: 'Create comprehensive logging for all LLM requests including tokens, cost, latency, and status.',
      hints: [
        'Log to llm_requests table',
        'Include: user_id, endpoint, model, tokens, cost, latency, status',
        'Calculate cost based on model pricing',
        'Log errors with error_message field',
        'Use performance.now() for accurate latency tracking'
      ],
      testCases: [
        'Make successful request - verify log entry',
        'Check cost calculation is accurate',
        'Verify latency is captured',
        'Test error logging with failed request'
      ]
    },
    {
      number: 4,
      title: 'Create Rate Limiting Middleware',
      icon: Activity,
      description: 'Implement sliding window rate limiting using Redis to prevent abuse and ensure fair usage.',
      hints: [
        'Use Upstash Redis sorted sets',
        'Implement sliding window (not fixed window)',
        'Return 429 with X-RateLimit-* headers',
        'Clean up old entries to prevent memory leaks',
        'Set different limits per endpoint'
      ],
      testCases: [
        'Send 10 requests rapidly - should all succeed',
        'Send 11th request - should return 429',
        'Wait for window to expire - should succeed again',
        'Verify X-RateLimit headers are present'
      ]
    },
    {
      number: 5,
      title: 'Build Cost Tracking Dashboard',
      icon: DollarSign,
      description: 'Create a budget management system with monthly resets and usage analytics.',
      hints: [
        'Track costs in user_budgets table',
        'Implement monthly budget reset (30 days)',
        'Calculate usage statistics (total cost, requests, tokens)',
        'Group data by day for charts',
        'Show warnings at 80% budget usage'
      ],
      testCases: [
        'Create user budget with $10 limit',
        'Track multiple requests',
        'Verify budget updates correctly',
        'Test budget reset after 30 days',
        'Query usage stats for last 30 days'
      ]
    }
  ]

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
          <div className="text-sm text-muted-foreground mb-2">Week 2 Lab</div>
          <h1 className="text-4xl font-bold">{lab.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {lab.description}
          </p>
        </div>

        {/* Progress */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Progress</CardTitle>
              <div className="text-2xl font-bold">
                {completedCount} / {exercises.length}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {exercises.map((ex) => (
                <div
                  key={ex.number}
                  className={`h-2 flex-1 rounded ${
                    submissionMap.get(ex.number)?.completed
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exercises */}
        <div className="space-y-6">
          {exerciseDetails.map((exercise) => {
            const submission = submissionMap.get(exercise.number)
            const Icon = exercise.icon

            return (
              <Card key={exercise.number} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Exercise {exercise.number}
                        </div>
                        <CardTitle className="text-xl">{exercise.title}</CardTitle>
                      </div>
                    </div>
                    {submission?.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{exercise.description}</p>

                  {/* Hints */}
                  <div>
                    <h4 className="font-semibold mb-2">Implementation Hints:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {exercise.hints.map((hint, i) => (
                        <li key={i}>{hint}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Test Cases */}
                  <div>
                    <h4 className="font-semibold mb-2">Test Cases:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {exercise.testCases.map((test, i) => (
                        <li key={i}>{test}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Submission */}
                  <LabExerciseClient
                    labId={lab.id}
                    exerciseNumber={exercise.number}
                    initialSubmission={submission?.submission_data as any}
                    isCompleted={submission?.completed || false}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Completion Summary */}
        {completedCount === exercises.length && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Lab Completed!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Excellent work! You&apos;ve implemented all governance pillars. Your production AI system now has:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Robust input validation and sanitization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Content moderation for safe outputs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Comprehensive request logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Rate limiting to prevent abuse</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Cost tracking and budget management</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/curriculum/week-2/project">
                  <Button>Continue to Project →</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
