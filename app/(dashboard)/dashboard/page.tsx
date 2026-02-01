import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { getSprintProgress } from '@/lib/progress-tracker'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null // Middleware should redirect, but just in case
  }

  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      skillDiagnosis: true,
    },
  })

  const diagnosisCompleted = !!user?.skillDiagnosis

  // Fetch Sprint 1 and Sprint 2 progress
  const sprint1Progress = user ? await getSprintProgress(user.id, 'sprint-1') : null
  const sprint2Progress = user ? await getSprintProgress(user.id, 'sprint-2') : null
  const sprint3Progress = user ? await getSprintProgress(user.id, 'sprint-3') : null
  const sprint4Progress = user ? await getSprintProgress(user.id, 'sprint-4') : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.name || session!.user!.name}!
        </h2>
        <p className="text-slate-600 mt-2">
          {diagnosisCompleted
            ? `You're on the ${user?.skillDiagnosis?.recommendedPath.replace(/-/g, ' ')} path`
            : 'Take the skill diagnosis to get started'
          }
        </p>
      </div>

      {!diagnosisCompleted && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>🎯 Start Here</CardTitle>
            <CardDescription>
              Take a quick 10-minute assessment to personalize your learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/diagnosis">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start Skill Diagnosis
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sprint 0</CardTitle>
            <CardDescription>Skill Diagnosis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Take a quick assessment to personalize your learning path
            </p>
            {diagnosisCompleted ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  ✓ Completed
                </span>
                <Link href="/diagnosis/results" className="text-xs text-blue-600 hover:underline">
                  View results
                </Link>
              </div>
            ) : (
              <Link href="/diagnosis">
                <Button size="sm" variant="outline">
                  Start
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint 1</CardTitle>
            <CardDescription>AI Engineering Foundations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Learn LLM fundamentals and build your first AI product
            </p>
            {sprint1Progress && sprint1Progress.totalCount > 0 ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>
                      {sprint1Progress.completedCount} of {sprint1Progress.totalCount} concepts
                    </span>
                    <span className="font-medium">
                      {Math.round(sprint1Progress.percentComplete)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${sprint1Progress.percentComplete}%` }}
                    />
                  </div>
                </div>
                <Link href="/learn/sprint-1">
                  <Button size="sm" variant="outline" className="w-full">
                    {sprint1Progress.completedCount === 0
                      ? 'Start Sprint'
                      : sprint1Progress.completedCount === sprint1Progress.totalCount
                      ? 'Review Sprint'
                      : 'Continue Sprint'}
                  </Button>
                </Link>
              </div>
            ) : (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                Loading...
              </span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint 2</CardTitle>
            <CardDescription>RAG System</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Build intelligent document Q&A systems with vector search
            </p>
            {sprint2Progress && sprint2Progress.totalCount > 0 ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>
                      {sprint2Progress.completedCount} of {sprint2Progress.totalCount} concepts
                    </span>
                    <span className="font-medium">
                      {Math.round(sprint2Progress.percentComplete)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${sprint2Progress.percentComplete}%` }}
                    />
                  </div>
                </div>
                <Link href="/learn/sprint-2">
                  <Button size="sm" variant="outline" className="w-full">
                    {sprint2Progress.completedCount === 0
                      ? 'Start Sprint'
                      : sprint2Progress.completedCount === sprint2Progress.totalCount
                      ? 'Review Sprint'
                      : 'Continue Sprint'}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/learn/sprint-2">
                <Button size="sm" variant="outline">
                  Start Sprint
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint 3</CardTitle>
            <CardDescription>AI Agents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Build intelligent agents that plan and execute multi-step tasks
            </p>
            {sprint3Progress && sprint3Progress.totalCount > 0 ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>
                      {sprint3Progress.completedCount} of {sprint3Progress.totalCount} concepts
                    </span>
                    <span className="font-medium">
                      {Math.round(sprint3Progress.percentComplete)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${sprint3Progress.percentComplete}%` }}
                    />
                  </div>
                </div>
                <Link href="/learn/sprint-3">
                  <Button size="sm" variant="outline" className="w-full">
                    {sprint3Progress.completedCount === 0
                      ? 'Start Sprint'
                      : sprint3Progress.completedCount === sprint3Progress.totalCount
                      ? 'Review Sprint'
                      : 'Continue Sprint'}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/learn/sprint-3">
                <Button size="sm" variant="outline">
                  Start Sprint
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint 4</CardTitle>
            <CardDescription>Multimodal AI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Build applications that understand images and combine text with vision
            </p>
            {sprint4Progress && sprint4Progress.totalCount > 0 ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>
                      {sprint4Progress.completedCount} of {sprint4Progress.totalCount} concepts
                    </span>
                    <span className="font-medium">
                      {Math.round(sprint4Progress.percentComplete)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${sprint4Progress.percentComplete}%` }}
                    />
                  </div>
                </div>
                <Link href="/learn/sprint-4">
                  <Button size="sm" variant="outline" className="w-full">
                    {sprint4Progress.completedCount === 0
                      ? 'Start Sprint'
                      : sprint4Progress.completedCount === sprint4Progress.totalCount
                      ? 'Review Sprint'
                      : 'Continue Sprint'}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/learn/sprint-4">
                <Button size="sm" variant="outline">
                  Start Sprint
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Mentor</CardTitle>
            <CardDescription>24/7 Support</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Get help from your AI learning assistant anytime
            </p>
            <Link href="/mentor/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Start Chat
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
