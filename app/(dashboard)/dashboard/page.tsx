import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'

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

      {!diagnosisCompleted ? (
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
      ) : (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle>✓ Diagnosis Complete</CardTitle>
            <CardDescription>
              View your personalized results and question review
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link href="/diagnosis/results">
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                View Results
              </Button>
            </Link>
            <Link href="/diagnosis">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                Retake Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {week1Data?.week && (
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle>Week 1</CardTitle>
              <CardDescription>{week1Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week1Data.week.description}
              </p>
            {week1Data.progress ? (
              <div className="space-y-3">
                <div className="space-y-1">
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
                <div className="flex justify-end">
                  <Link href="/curriculum/week-1">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                      Continue
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <Link href="/curriculum/week-1">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                    Start
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
              <div className="flex justify-end">
                <Link href="/curriculum/week-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    {week2Data.progress ? 'Continue' : 'Start'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week3Data?.week && (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
            <CardHeader>
              <CardTitle>Week 3</CardTitle>
              <CardDescription>{week3Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week3Data.week.description}
              </p>
              <div className="flex justify-end">
                <Link href="/curriculum/week-3">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    {week3Data.progress ? 'Continue' : 'Start'}
                  </Button>
                </Link>
              </div>
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
              <div className="flex justify-end">
                <Link href="/curriculum/week-4">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                    {week4Data.progress ? 'Continue' : 'Start'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week5Data?.week && (
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardHeader>
              <CardTitle>Week 5</CardTitle>
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
                  <div className="flex justify-end">
                    <Link href="/curriculum/week-5">
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Continue
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <Link href="/curriculum/week-5">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Start
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {week6Data?.week && (
          <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
            <CardHeader>
              <CardTitle>Week 6</CardTitle>
              <CardDescription>{week6Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week6Data.week.description}
              </p>
              <div className="flex justify-end">
                <Link href="/curriculum/week-6">
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                    {week6Data.progress ? 'Continue' : 'Start'}
                  </Button>
                </Link>
              </div>
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
              <div className="flex justify-end">
                <Link href="/curriculum/week-7">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    {week7Data.progress ? 'Continue' : 'Start'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week8Data?.week && (
          <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
            <CardHeader>
              <CardTitle>Week 8</CardTitle>
              <CardDescription>{week8Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week8Data.week.description}
              </p>
              <div className="flex justify-end">
                <Link href="/curriculum/week-8">
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white">
                    {week8Data.progress ? 'Continue' : 'Start'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {week9Data?.week && (
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
            <CardHeader>
              <CardTitle>Week 9</CardTitle>
              <CardDescription>{week9Data.week.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {week9Data.week.description}
              </p>
              <div className="flex justify-end">
                <Link href="/curriculum/week-9">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    {week9Data.progress ? 'Continue' : 'Start'}
                  </Button>
                </Link>
              </div>
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
              <div className="flex justify-end">
                <Link href="/curriculum/week-10">
                  <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white">
                    {week10Data.progress ? 'Continue' : 'Start'}
                  </Button>
                </Link>
              </div>
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
              <div className="flex justify-end">
                <Link href="/curriculum/week-11">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {week11Data.progress ? 'Continue' : 'Start'}
                  </Button>
                </Link>
              </div>
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
              <div className="flex justify-end">
                <Link href="/curriculum/week-12">
                  <Button size="sm" className="bg-slate-600 hover:bg-slate-700 text-white">
                    {week12Data.progress ? 'Continue' : 'Start'}
                  </Button>
                </Link>
              </div>
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

      {/* Advanced Features Section */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Advanced Features</h3>
        <p className="text-slate-600 mb-6">
          Enterprise-grade capabilities for production AI systems
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* AI Workflows */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
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
              <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* AI Security */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
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
          <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
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
