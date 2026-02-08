import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getSprintById } from '@/lib/content-loader'
import { getSprintProgress } from '@/lib/progress-tracker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface SprintPageProps {
  params: Promise<{
    sprintId: string
  }>
}

export default async function SprintPage({ params }: SprintPageProps) {
  const { sprintId } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const sprint = await getSprintById(sprintId)

  if (!sprint) {
    notFound()
  }

  const progress = await getSprintProgress(user.id, sprintId)

  if (!progress) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Sprint Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <span>/</span>
          <span>{sprint.title}</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{sprint.title}</h1>
        <p className="text-slate-600 mt-2">{sprint.description}</p>
      </div>

      {/* Progress Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                {progress.completedCount} of {progress.totalCount} concepts completed
              </span>
              <span className="font-medium text-blue-600">
                {Math.round(progress.percentComplete)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress.percentComplete}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concepts List */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Concepts</h2>
        <div className="space-y-4">
          {progress.concepts.map((conceptProgress, index) => {
            const concept = conceptProgress.concept
            const isLocked = concept.prerequisites && concept.prerequisites.length > 0 && conceptProgress.status === 'not_started'

            // Check if prerequisites are met
            const prerequisitesMet = !concept.prerequisites || concept.prerequisites.every(prereqId => {
              const prereq = progress.concepts.find(c => c.conceptId === prereqId)
              return prereq?.status === 'completed'
            })

            const canAccess = prerequisitesMet

            return (
              <Card
                key={concept.id}
                className={`${
                  conceptProgress.status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : conceptProgress.status === 'in_progress'
                    ? 'border-blue-200 bg-blue-50'
                    : !canAccess
                    ? 'border-slate-200 bg-slate-50 opacity-60'
                    : 'border-slate-200'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">
                          {index + 1}.
                        </span>
                        <CardTitle className="text-lg">{concept.title}</CardTitle>
                        {conceptProgress.status === 'completed' && (
                          <span className="text-green-600 text-sm">✓</span>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {concept.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">{concept.estimatedMinutes}</span> min
                      </span>
                      <span className="flex items-center gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            concept.difficulty === 'beginner'
                              ? 'bg-green-100 text-green-700'
                              : concept.difficulty === 'intermediate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {concept.difficulty}
                        </span>
                      </span>
                    </div>

                    {canAccess ? (
                      <Link href={`/learn/${sprintId}/${concept.id}`}>
                        <Button
                          size="sm"
                          variant={conceptProgress.status === 'not_started' ? 'default' : 'outline'}
                        >
                          {conceptProgress.status === 'completed'
                            ? 'Review'
                            : conceptProgress.status === 'in_progress'
                            ? 'Continue'
                            : 'Start'}
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        Locked
                      </Button>
                    )}
                  </div>

                  {concept.prerequisites && concept.prerequisites.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500">
                        Prerequisites:{' '}
                        {concept.prerequisites.map((prereqId, i) => {
                          const prereq = sprint.concepts.find(c => c.id === prereqId)
                          const prereqProgress = progress.concepts.find(c => c.conceptId === prereqId)
                          return (
                            <span key={prereqId}>
                              {i > 0 && ', '}
                              <span
                                className={
                                  prereqProgress?.status === 'completed'
                                    ? 'text-green-600'
                                    : 'text-slate-500'
                                }
                              >
                                {prereq?.title}
                                {prereqProgress?.status === 'completed' && ' ✓'}
                              </span>
                            </span>
                          )
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
