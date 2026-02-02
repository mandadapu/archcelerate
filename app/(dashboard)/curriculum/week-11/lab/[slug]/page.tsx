import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, Circle, ArrowLeft } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lab = await prisma.lab.findUnique({
    where: { slug: params.slug }
  })

  return {
    title: lab?.title || 'Lab',
    description: lab?.description || 'Complete lab exercises'
  }
}

export default async function LabPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) return null

  // Fetch lab
  const lab = await prisma.lab.findUnique({
    where: { slug: params.slug },
    include: { week: true }
  })

  if (!lab) notFound()

  const exercises = lab.exercises as Array<{
    number: number
    title: string
    type: string
  }>

  // Fetch user's lab submissions
  const submissions = await prisma.labSubmission.findMany({
    where: {
      userId: user.id,
      labId: lab.id
    },
    orderBy: { exerciseNumber: 'asc' }
  })

  const submissionMap = new Map(
    submissions.map(s => [s.exerciseNumber, s])
  )

  // Capture values for server action
  const labId = lab.id
  const weekId = lab.weekId
  const totalExercises = exercises.length

  // Submit exercise action
  async function submitExercise(formData: FormData) {
    'use server'
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) return

    const exerciseNumber = parseInt(formData.get('exerciseNumber') as string)
    const submissionText = formData.get('submission') as string

    // Create or update submission
    await prisma.labSubmission.upsert({
      where: {
        userId_labId_exerciseNumber: {
          userId: user.id,
          labId: labId,
          exerciseNumber
        }
      },
      create: {
        userId: user.id,
        labId: labId,
        exerciseNumber,
        submissionData: { text: submissionText },
        completed: true
      },
      update: {
        submissionData: { text: submissionText },
        completed: true,
        submittedAt: new Date()
      }
    })

    // Check if all exercises are completed
    const allSubmissions = await prisma.labSubmission.findMany({
      where: {
        userId: user.id,
        labId: labId,
        completed: true
      }
    })

    // If all exercises completed, update week progress
    if (allSubmissions.length === totalExercises) {
      await prisma.userWeekProgress.upsert({
        where: {
          userId_weekId: {
            userId: user.id,
            weekId: weekId
          }
        },
        create: {
          userId: user.id,
          weekId: weekId,
          conceptsTotal: 3, // Week 11 has 4 concepts
          labCompleted: true
        },
        update: {
          labCompleted: true
        }
      })
    }

    redirect(`/curriculum/week-11/lab/${params.slug}`)
  }

  const completedCount = submissions.filter(s => s.completed).length
  const progressPercent = Math.round((completedCount / exercises.length) * 100)

  return (
    <div className="container max-w-4xl py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/curriculum/week-11" className="hover:text-foreground">
          Week 11
        </Link>
        <span>/</span>
        <span>Lab</span>
        <span>/</span>
        <span className="text-foreground">{lab.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{lab.title}</h1>
        <p className="text-lg text-muted-foreground">{lab.description}</p>
      </div>

      {/* Progress */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Progress</CardTitle>
            <div className="text-sm text-muted-foreground">
              {completedCount} / {exercises.length} exercises
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <div className="space-y-6">
        {exercises.map((exercise) => {
          const submission = submissionMap.get(exercise.number)
          const isCompleted = submission?.completed || false

          return (
            <Card key={exercise.number} className={isCompleted ? 'border-green-200 bg-green-50 dark:bg-green-950' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>Exercise {exercise.number}</CardTitle>
                      {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <CardDescription>{exercise.title}</CardDescription>
                  </div>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {exercise.type}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Exercise Instructions */}
                <div className="mb-4 text-sm text-muted-foreground">
                  {exercise.type === 'setup' && (
                    <p>Set up the monitoring tool following the documentation. Document your configuration and API key setup.</p>
                  )}
                  {exercise.type === 'coding' && (
                    <p>Implement the feature as described. Include code snippets and explain your approach.</p>
                  )}
                  {exercise.type === 'implementation' && (
                    <p>Build the implementation following best practices. Document your architecture decisions.</p>
                  )}
                  {exercise.type === 'configuration' && (
                    <p>Configure the system as specified. Document your settings and explain your choices.</p>
                  )}
                </div>

                {/* Submission Form */}
                <form action={submitExercise} className="space-y-4">
                  <input type="hidden" name="exerciseNumber" value={exercise.number} />
                  <div>
                    <label htmlFor={`submission-${exercise.number}`} className="block text-sm font-medium mb-2">
                      Your submission
                    </label>
                    <Textarea
                      id={`submission-${exercise.number}`}
                      name="submission"
                      placeholder="Describe what you did, paste code snippets, include screenshots URLs, or write your reflection..."
                      rows={6}
                      defaultValue={submission?.submissionData ? (submission.submissionData as any).text : ''}
                      required
                    />
                  </div>
                  <Button type="submit">
                    {isCompleted ? 'Update Submission' : 'Submit Exercise'}
                  </Button>
                </form>

                {isCompleted && submission && (
                  <div className="mt-4 text-xs text-muted-foreground">
                    Last submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Complete Lab */}
      {completedCount === exercises.length && (
        <Card className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Lab Completed!
            </CardTitle>
            <CardDescription>
              Great work! You&apos;ve completed all exercises. Head back to Week 11 to continue with the project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/curriculum/week-11">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Week 11
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
