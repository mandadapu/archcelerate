import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import Link from 'next/link'

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

  // Fetch Week 2-12 progress
  const weeks = await Promise.all([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(async (weekNum) => {
    if (!user) return null
    const week = await prisma.curriculumWeek.findUnique({
      where: { weekNumber: weekNum }
    })
    if (!week) return null

    const progress = await prisma.userWeekProgress.findUnique({
      where: {
        userId_weekId: {
          userId: user.id,
          weekId: week.id
        }
      }
    })

    return { weekNumber: weekNum, week, progress }
  }))

  const week2Data = weeks.find(w => w?.weekNumber === 2)
  const week3Data = weeks.find(w => w?.weekNumber === 3)
  const week4Data = weeks.find(w => w?.weekNumber === 4)
  const week5Data = weeks.find(w => w?.weekNumber === 5)
  const week6Data = weeks.find(w => w?.weekNumber === 6)
  const week7Data = weeks.find(w => w?.weekNumber === 7)
  const week8Data = weeks.find(w => w?.weekNumber === 8)
  const week9Data = weeks.find(w => w?.weekNumber === 9)
  const week10Data = weeks.find(w => w?.weekNumber === 10)
  const week11Data = weeks.find(w => w?.weekNumber === 11)
  const week12Data = weeks.find(w => w?.weekNumber === 12)

  // Sprint progress removed - using Week-based curriculum instead

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

        {week2Data?.week && (
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle>Week 2</CardTitle>
              <CardDescription>{week2Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week2Data.week.description}
              </p>
              <Link href="/curriculum/week-2">
                <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                  {week2Data.progress ? 'Continue' : 'Start'} Week 2
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {week3Data?.week && (
          <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
            <CardHeader>
              <CardTitle>Week 3</CardTitle>
              <CardDescription>{week3Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week3Data.week.description}
              </p>
              <Link href="/curriculum/week-3">
                <Button size="sm" variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50">
                  {week3Data.progress ? 'Continue' : 'Start'} Week 3
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {week4Data?.week && (
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader>
              <CardTitle>Week 4</CardTitle>
              <CardDescription>{week4Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week4Data.week.description}
              </p>
              <Link href="/curriculum/week-4">
                <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                  {week4Data.progress ? 'Continue' : 'Start'} Week 4
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {week5Data?.week && (
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Week 5
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  NEW
                </span>
              </CardTitle>
              <CardDescription>{week5Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week5Data.week.description}
              </p>
              {week5Data.progress ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-600 mb-1">
                      Progress: {week5Data.progress.conceptsCompleted}/{week5Data.progress.conceptsTotal} concepts
                      {week5Data.progress.labCompleted && ', Lab ✓'}
                      {week5Data.progress.projectCompleted && ', Project ✓'}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.round(
                            ((week5Data.progress.conceptsCompleted / week5Data.progress.conceptsTotal) * 0.6 +
                             (week5Data.progress.labCompleted ? 0.2 : 0) +
                             (week5Data.progress.projectCompleted ? 0.2 : 0)) * 100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                  <Link href="/curriculum/week-5">
                    <Button size="sm" variant="outline" className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                      Continue Week 5
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href="/curriculum/week-5">
                  <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                    Start Week 5
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {week6Data?.week && (
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
            <CardHeader>
              <CardTitle>Week 6</CardTitle>
              <CardDescription>{week6Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week6Data.week.description}
              </p>
              <Link href="/curriculum/week-6">
                <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                  {week6Data.progress ? 'Continue' : 'Start'} Week 6
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {week7Data?.week && (
          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardHeader>
              <CardTitle>Week 7</CardTitle>
              <CardDescription>{week7Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week7Data.week.description}
              </p>
              <Link href="/curriculum/week-7">
                <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                  {week7Data.progress ? 'Continue' : 'Start'} Week 7
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {week8Data?.week && (
          <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50">
            <CardHeader>
              <CardTitle>Week 8</CardTitle>
              <CardDescription>{week8Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week8Data.week.description}
              </p>
              <Link href="/curriculum/week-8">
                <Button size="sm" variant="outline" className="border-cyan-300 text-cyan-700 hover:bg-cyan-50">
                  {week8Data.progress ? 'Continue' : 'Start'} Week 8
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {week9Data?.week && (
          <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
            <CardHeader>
              <CardTitle>Week 9</CardTitle>
              <CardDescription>{week9Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week9Data.week.description}
              </p>
              <Link href="/curriculum/week-9">
                <Button size="sm" variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-50">
                  {week9Data.progress ? 'Continue' : 'Start'} Week 9
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {week10Data?.week && (
          <Card className="border-2 border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-pink-50">
            <CardHeader>
              <CardTitle>Week 10</CardTitle>
              <CardDescription>{week10Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week10Data.week.description}
              </p>
              <Link href="/curriculum/week-10">
                <Button size="sm" variant="outline" className="border-fuchsia-300 text-fuchsia-700 hover:bg-fuchsia-50">
                  {week10Data.progress ? 'Continue' : 'Start'} Week 10
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {week11Data?.week && (
          <Card className="border-2 border-lime-200 bg-gradient-to-br from-lime-50 to-green-50">
            <CardHeader>
              <CardTitle>Week 11</CardTitle>
              <CardDescription>{week11Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week11Data.week.description}
              </p>
              <Link href="/curriculum/week-11">
                <Button size="sm" variant="outline" className="border-lime-300 text-lime-700 hover:bg-lime-50">
                  {week11Data.progress ? 'Continue' : 'Start'} Week 11
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {week12Data?.week && (
          <Card className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50">
            <CardHeader>
              <CardTitle>Week 12</CardTitle>
              <CardDescription>{week12Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week12Data.week.description}
              </p>
              <Link href="/curriculum/week-12">
                <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  {week12Data.progress ? 'Continue' : 'Start'} Week 12
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}


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
