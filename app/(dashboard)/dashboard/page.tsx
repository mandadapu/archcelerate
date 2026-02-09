import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { ArchitectureTourCard } from '@/components/dashboard/ArchitectureTourCard'
import { ArchitectTelemetryCard } from '@/components/dashboard/ArchitectTelemetryCard'

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
  const tourCompleted = user?.tourCompleted || false
  const tourStartedAt = user?.tourStartedAt

  // Fetch Week 1 data and progress
  let week1Data = null
  if (user) {
    const week1 = await prisma.curriculumWeek.findUnique({
      where: { weekNumber: 1 }
    })
    if (week1) {
      const week1Progress = await prisma.userWeekProgress.findUnique({
        where: {
          userId_weekId: {
            userId: user.id,
            weekId: week1.id
          }
        }
      })
      week1Data = { weekNumber: 1, week: week1, progress: week1Progress }
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

  // Parse skill scores for the telemetry card
  const skillScores = user?.skillDiagnosis?.skillScores as Record<string, number> | undefined

  return (
    <div className="space-y-6">
      {/* Stage 3: Tour Complete, Diagnosis Pending */}
      {tourCompleted && !diagnosisCompleted && (
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-500">
                Mission Critical
              </p>
              <h2 className="text-2xl font-bold text-white font-display">
                Complete Your Architectural Diagnosis
              </h2>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-6 ml-[52px]">
            Map your 7-axis skill telemetry to unlock your personalized production roadmap.
          </p>
          <div className="ml-[52px]">
            <Link href="/diagnosis">
              <Button className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold">
                Begin Diagnosis
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stage 4: Diagnosis Complete — Architect's Telemetry (collapsible) */}
      {diagnosisCompleted && (
        <ArchitectTelemetryCard
          recommendedPath={user?.skillDiagnosis?.recommendedPath}
          skillScores={skillScores}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* Architecture Tour — same grid slot as week cards */}
        {!tourCompleted && !tourStartedAt && (
          <ArchitectureTourCard status="not-started" />
        )}
        {!tourCompleted && tourStartedAt && (
          <ArchitectureTourCard status="in-progress" tourStartedAt={tourStartedAt.toISOString()} />
        )}

        {week1Data?.week && (
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <CardTitle>Week 1</CardTitle>
              <CardDescription>{week1Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                {week1Data.week.description}
              </p>
              {week1Data.progress && (
                <div className="space-y-1 mb-4">
                  <div className="text-xs text-slate-600 mb-1">
                    Progress: {week1Data.progress.conceptsCompleted}/{week1Data.progress.conceptsTotal} concepts
                    {week1Data.progress.labCompleted && ', Lab ✓'}
                    {week1Data.progress.projectCompleted && ', Project ✓'}
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.round(
                          ((week1Data.progress.conceptsCompleted / week1Data.progress.conceptsTotal) * 0.6 +
                           (week1Data.progress.labCompleted ? 0.2 : 0) +
                           (week1Data.progress.projectCompleted ? 0.2 : 0)) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end mt-auto">
                <Link href="/curriculum/week-1">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                    Start
                  </Button>
                </Link>
              </div>
          </CardContent>
        </Card>
      )}

        {week2Data?.week && (
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <CardTitle>Week 2</CardTitle>
              <CardDescription>{week2Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                {week2Data.week.description}
              </p>
              <div className="flex justify-end mt-auto">
                <Link href="/curriculum/week-2">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week3Data?.week && (
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <CardTitle>Week 3</CardTitle>
              <CardDescription>{week3Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                {week3Data.week.description}
              </p>
              <div className="flex justify-end mt-auto">
                <Link href="/curriculum/week-3">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week4Data?.week && (
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <CardTitle>Week 4</CardTitle>
              <CardDescription>{week4Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                {week4Data.week.description}
              </p>
              <div className="flex justify-end mt-auto">
                <Link href="/curriculum/week-4">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week5Data?.week && (
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <CardTitle>Week 5</CardTitle>
              <CardDescription>{week5Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                {week5Data.week.description}
              </p>
              {week5Data.progress && (
                <div className="space-y-1 mb-4">
                  <div className="text-xs text-slate-600 mb-1">
                    Progress: {week5Data.progress.conceptsCompleted}/{week5Data.progress.conceptsTotal} concepts
                    {week5Data.progress.labCompleted && ', Lab ✓'}
                    {week5Data.progress.projectCompleted && ', Project ✓'}
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all"
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
              )}
              <div className="flex justify-end mt-auto">
                <Link href="/curriculum/week-5">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week6Data?.week && (
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <CardTitle>Week 6</CardTitle>
              <CardDescription>{week6Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                {week6Data.week.description}
              </p>
              <div className="flex justify-end mt-auto">
                <Link href="/curriculum/week-6">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week7Data?.week && (
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <CardTitle>Week 7</CardTitle>
              <CardDescription>{week7Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                {week7Data.week.description}
              </p>
              <div className="flex justify-end mt-auto">
                <Link href="/curriculum/week-7">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week8Data?.week && (
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <CardTitle>Week 8</CardTitle>
              <CardDescription>{week8Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                {week8Data.week.description}
              </p>
              <div className="flex justify-end mt-auto">
                <Link href="/curriculum/week-8">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week9Data?.week && (
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <CardTitle>Week 9</CardTitle>
              <CardDescription>{week9Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                {week9Data.week.description}
              </p>
              <div className="flex justify-end mt-auto">
                <Link href="/curriculum/week-9">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week10Data?.week && (
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <CardTitle>Week 10</CardTitle>
              <CardDescription>{week10Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                {week10Data.week.description}
              </p>
              <div className="flex justify-end mt-auto">
                <Link href="/curriculum/week-10">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week11Data?.week && (
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <CardTitle>Week 11</CardTitle>
              <CardDescription>{week11Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                {week11Data.week.description}
              </p>
              <div className="flex justify-end mt-auto">
                <Link href="/curriculum/week-11">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week12Data?.week && (
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <CardTitle>Week 12</CardTitle>
              <CardDescription>{week12Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                {week12Data.week.description}
              </p>
              <div className="flex justify-end mt-auto">
                <Link href="/curriculum/week-12">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Architecture Tour — mini reference card (visible after completion) */}
        {tourCompleted && (
          <Card className="group relative bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 transition-all duration-300 hover:shadow-lg flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-indigo-900 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Architecture Tour
                </CardTitle>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Complete
                </span>
              </div>
              <CardDescription className="text-indigo-700">4-Layer Sovereign Stack</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-slate-600 mb-4">
                Review the executive summary of production AI architecture anytime.
              </p>
              <div className="flex justify-end mt-auto">
                <Link href="/architecture-tour">
                  <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                    Review
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
          <CardHeader>
            <CardTitle>Verification Report</CardTitle>
            <CardDescription>7-Axis Mastery Metrics</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <p className="text-sm text-slate-600 mb-4">
              View your data-driven proof of AI architecture capabilities
            </p>
            <div className="flex justify-end mt-auto">
              <Link href="/verification-report">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                  View Report
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent flex flex-col h-full">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
          <CardHeader>
            <CardTitle>AI Mentor</CardTitle>
            <CardDescription>24/7 Support</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <p className="text-sm text-slate-600 mb-4">
              Get help from your AI learning assistant anytime
            </p>
            <div className="flex justify-end mt-auto">
              <Link href="/mentor/new">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
                  Start
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Features Section */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Advanced Features</h3>
        <p className="text-slate-600 mb-6">
          Enterprise-grade capabilities for production AI systems
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* AI Workflows */}
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  AI Workflows
                </CardTitle>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  ADVANCED
                </span>
              </div>
              <CardDescription>Automate anything with visual builder</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg mb-4 overflow-hidden relative">
                <Image
                  src="/images/cards/workflows.svg"
                  alt="AI Workflows"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Build, run, and scale AI-powered workflows. Connect data, APIs, and models
                in a visual builder—no complex coding needed. From simple automations to
                enterprise-grade pipelines.
              </p>
              <Link href="/workflows">
                <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                  Build Workflows
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Security */}
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  AI Security
                </CardTitle>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  ADVANCED
                </span>
              </div>
              <CardDescription>Enterprise-grade protection framework</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg mb-4 overflow-hidden relative">
                <Image
                  src="/images/cards/security.svg"
                  alt="AI Security"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Complete security framework covering data protection, model security,
                and usage monitoring. Implements OWASP Top 10 for LLMs defenses with
                enterprise-grade infrastructure and governance.
              </p>
              <Link href="/security">
                <Button size="sm" variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                  Learn Security Framework
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Industry Scenarios */}
          <Card className="group relative bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-teal-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Industry Scenarios
                </CardTitle>
                <div className="flex gap-1">
                  <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                    DIGITAL HEALTH
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    ENTERPRISE
                  </span>
                </div>
              </div>
              <CardDescription>Real-world boardroom-level challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {/* Digital Health Track (Weeks 1-7) */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-teal-800 mb-2 flex items-center gap-1">
                    🏥 Digital Health Track
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white/70 rounded border border-teal-100">
                      <div className="font-semibold text-teal-900">W1: Multi-Tier Triage</div>
                      <div className="text-teal-600 text-[10px]">87.5% cost ↓</div>
                    </div>
                    <div className="p-2 bg-white/70 rounded border border-teal-100">
                      <div className="font-semibold text-teal-900">W2: HIPAA Gateway</div>
                      <div className="text-teal-600 text-[10px]">100% compliance</div>
                    </div>
                    <div className="p-2 bg-white/70 rounded border border-teal-100">
                      <div className="font-semibold text-teal-900">W4: Support Router</div>
                      <div className="text-teal-600 text-[10px]">60x faster</div>
                    </div>
                    <div className="p-2 bg-white/70 rounded border border-teal-100">
                      <div className="font-semibold text-teal-900">W5: Research Swarm</div>
                      <div className="text-teal-600 text-[10px]">96% time ↓</div>
                    </div>
                    <div className="p-2 bg-white/70 rounded border border-teal-100">
                      <div className="font-semibold text-teal-900">W6: Clinical RAG</div>
                      <div className="text-teal-600 text-[10px]">94% precision</div>
                    </div>
                    <div className="p-2 bg-white/70 rounded border border-teal-100">
                      <div className="font-semibold text-teal-900">W7: LLM-as-Judge</div>
                      <div className="text-teal-600 text-[10px]">98% cost ↓</div>
                    </div>
                  </div>
                </div>

                {/* Enterprise Track (Weeks 9-12) */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-purple-800 mb-2 flex items-center gap-1">
                    🏢 Enterprise Track
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white/70 rounded border border-purple-100">
                      <div className="font-semibold text-purple-900">W9: Pharma Graph</div>
                      <div className="text-purple-600 text-[10px]">333x ROI</div>
                    </div>
                    <div className="p-2 bg-white/70 rounded border border-purple-100">
                      <div className="font-semibold text-purple-900">W10: Legal QLoRA</div>
                      <div className="text-purple-600 text-[10px]">70% cost ↓</div>
                    </div>
                    <div className="p-2 bg-white/70 rounded border border-purple-100">
                      <div className="font-semibold text-purple-900">W11: Oncology AI</div>
                      <div className="text-purple-600 text-[10px]">20x coverage</div>
                    </div>
                    <div className="p-2 bg-white/70 rounded border border-purple-100">
                      <div className="font-semibold text-purple-900">W12: Global Gateway</div>
                      <div className="text-purple-600 text-[10px]">1,480% ROI</div>
                    </div>
                  </div>
                </div>

                {/* Cumulative Impact */}
                <div className="p-3 bg-gradient-to-br from-teal-100 to-purple-100 rounded-lg border border-teal-200">
                  <div className="text-xs font-semibold text-slate-800 uppercase tracking-wide mb-2">
                    Total Business Impact
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-slate-900 font-bold">$1.5M+</div>
                      <div className="text-slate-700 text-[10px]">Annual Savings</div>
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold">99.97%</div>
                      <div className="text-slate-700 text-[10px]">Uptime</div>
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold">10</div>
                      <div className="text-slate-700 text-[10px]">Case Studies</div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Master production AI through 10 boardroom-level scenarios spanning Digital Health and Enterprise infrastructure. Each includes production TypeScript, ROI calculations, and architectural trade-offs.
              </p>
              <Link href="/curriculum/week-1">
                <Button size="sm" variant="outline" className="w-full border-teal-300 text-teal-700 hover:bg-teal-50">
                  Start Week 1 Scenario →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
