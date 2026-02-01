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

  // Fetch Week 1 progress
  let week1Progress = null
  if (user) {
    const week1 = await prisma.curriculumWeek.findUnique({
      where: { weekNumber: 1 }
    })
    if (week1) {
      week1Progress = await prisma.userWeekProgress.findUnique({
        where: {
          userId_weekId: {
            userId: user.id,
            weekId: week1.id
          }
        }
      })
    }
  }

  // Fetch Sprint progress
  const sprint1Progress = user ? await getSprintProgress(user.id, 'sprint-1') : null
  const sprint2Progress = user ? await getSprintProgress(user.id, 'sprint-2') : null
  const sprint3Progress = user ? await getSprintProgress(user.id, 'sprint-3') : null
  const sprint4Progress = user ? await getSprintProgress(user.id, 'sprint-4') : null
  const sprint5Progress = user ? await getSprintProgress(user.id, 'sprint-5') : null
  const sprint6Progress = user ? await getSprintProgress(user.id, 'sprint-6') : null
  const sprint7Progress = user ? await getSprintProgress(user.id, 'sprint-7') : null

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

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Week 1
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                NEW
              </span>
            </CardTitle>
            <CardDescription>Foundations + Visual Builder</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Learn LLM fundamentals, prompt engineering, and build your first AI product
            </p>
            {week1Progress ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-xs text-slate-600 mb-1">
                    Progress: {week1Progress.conceptsCompleted}/{week1Progress.conceptsTotal} concepts
                    {week1Progress.labCompleted && ', Lab ✓'}
                    {week1Progress.projectCompleted && ', Project ✓'}
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.round(
                          ((week1Progress.conceptsCompleted / week1Progress.conceptsTotal) * 0.6 +
                           (week1Progress.labCompleted ? 0.2 : 0) +
                           (week1Progress.projectCompleted ? 0.2 : 0)) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>
                <Link href="/curriculum/week-1">
                  <Button size="sm" variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                    Continue Week 1
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/curriculum/week-1">
                <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  Start Week 1
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
            <CardTitle>Sprint 5</CardTitle>
            <CardDescription>Production Deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Deploy and scale AI applications with monitoring, caching, and reliability
            </p>
            {sprint5Progress && sprint5Progress.totalCount > 0 ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>
                      {sprint5Progress.completedCount} of {sprint5Progress.totalCount} concepts
                    </span>
                    <span className="font-medium">
                      {Math.round(sprint5Progress.percentComplete)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${sprint5Progress.percentComplete}%` }}
                    />
                  </div>
                </div>
                <Link href="/learn/sprint-5">
                  <Button size="sm" variant="outline" className="w-full">
                    {sprint5Progress.completedCount === 0
                      ? 'Start Sprint'
                      : sprint5Progress.completedCount === sprint5Progress.totalCount
                      ? 'Review Sprint'
                      : 'Continue Sprint'}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/learn/sprint-5">
                <Button size="sm" variant="outline">
                  Start Sprint
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint 6</CardTitle>
            <CardDescription>AI Optimization & Evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Master evaluation frameworks, A/B testing, and architecture tradeoffs
            </p>
            {sprint6Progress && sprint6Progress.totalCount > 0 ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>
                      {sprint6Progress.completedCount} of {sprint6Progress.totalCount} concepts
                    </span>
                    <span className="font-medium">
                      {Math.round(sprint6Progress.percentComplete)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${sprint6Progress.percentComplete}%` }}
                    />
                  </div>
                </div>
                <Link href="/learn/sprint-6">
                  <Button size="sm" variant="outline" className="w-full">
                    {sprint6Progress.completedCount === 0
                      ? 'Start Sprint'
                      : sprint6Progress.completedCount === sprint6Progress.totalCount
                      ? 'Review Sprint'
                      : 'Continue Sprint'}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/learn/sprint-6">
                <Button size="sm" variant="outline">
                  Start Sprint
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle>Sprint 7</CardTitle>
            <CardDescription>Capstone: Ship Your AI Product</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Design, build, deploy, and launch your own AI product from scratch
            </p>
            {sprint7Progress && sprint7Progress.totalCount > 0 ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>
                      {sprint7Progress.completedCount} of {sprint7Progress.totalCount} concepts
                    </span>
                    <span className="font-medium">
                      {Math.round(sprint7Progress.percentComplete)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${sprint7Progress.percentComplete}%` }}
                    />
                  </div>
                </div>
                <Link href="/learn/sprint-7">
                  <Button size="sm" variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                    {sprint7Progress.completedCount === 0
                      ? 'Start Capstone'
                      : sprint7Progress.completedCount === sprint7Progress.totalCount
                      ? 'Review Capstone'
                      : 'Continue Capstone'}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/learn/sprint-7">
                <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  Start Capstone
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
