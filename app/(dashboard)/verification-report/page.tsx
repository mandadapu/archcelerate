import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Award,
  Download,
  Shield,
  Database,
  Zap,
  Network,
  BarChart3,
  Rocket
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Architect Verification Report | AI Architect Accelerator',
  description: 'Your 7-Axis Mastery Metrics - Data-driven proof of AI architecture capabilities'
}

// Define the 7 axes with their corresponding skills
const MASTERY_AXES = [
  {
    id: 'systematic-prompting',
    name: 'Systematic Prompting',
    icon: Zap,
    description: 'Self-healing JSON, chain-of-thought, prompt versioning',
    skills: [
      'Self-healing JSON with retry logic',
      'Chain-of-thought decomposition',
      'Prompt versioning and A/B testing',
      'Token-efficient prompt optimization',
      'Prompt caching implementation'
    ],
    color: 'from-purple-600 to-cyan-500'
  },
  {
    id: 'sovereign-governance',
    name: 'Sovereign Governance',
    icon: Shield,
    description: 'Safety proxies, PII redaction, audit logs',
    skills: [
      'PII detection and redaction',
      'Safety proxy implementation',
      'Audit logging for compliance',
      'Content moderation strategies',
      'HIPAA/GDPR compliance patterns'
    ],
    color: 'from-cyan-500 to-purple-600'
  },
  {
    id: 'knowledge-architecture',
    name: 'Knowledge Architecture',
    icon: Database,
    description: 'Hybrid RAG, GraphRAG, chunking strategies',
    skills: [
      'Hybrid RAG implementation',
      'Semantic chunking strategies',
      'Vector database optimization',
      'GraphRAG for relational data',
      'Multi-hop reasoning systems'
    ],
    color: 'from-purple-600 to-cyan-500'
  },
  {
    id: 'context-engineering',
    name: 'Context Engineering',
    icon: BarChart3,
    description: 'Middle-out truncation, persistent state management',
    skills: [
      'Middle-out truncation strategy',
      'Rolling summarization implementation',
      'Vector-backed memory systems',
      'Instruction Anchor pattern (immutable Index 0)',
      'Context density optimization'
    ],
    color: 'from-cyan-500 to-purple-600'
  },
  {
    id: 'agentic-orchestration',
    name: 'Agentic Orchestration',
    icon: Network,
    description: 'Multi-agent supervisors, hierarchical swarms',
    skills: [
      'Multi-agent supervisor design',
      'Hierarchical agent swarms',
      'Tool use and function calling',
      'Agent fallback patterns',
      'State management across agents'
    ],
    color: 'from-purple-600 to-cyan-500'
  },
  {
    id: 'observability-evals',
    name: 'Observability & Evals',
    icon: BarChart3,
    description: 'LLM-as-a-Judge, P95 latency monitoring',
    skills: [
      'LLM-as-a-Judge evaluation',
      'P95/P99 latency monitoring',
      'Cost attribution per feature',
      'A/B test harness',
      'Production metrics dashboards'
    ],
    color: 'from-cyan-500 to-purple-600'
  },
  {
    id: 'production-readiness',
    name: 'Production Readiness',
    icon: Rocket,
    description: 'CI/CD for AI, cost attribution, model cascades',
    skills: [
      'Model cascade implementation (Haiku → Sonnet → Opus)',
      'Confidence threshold tuning',
      'CI/CD pipeline for AI systems',
      'Cost attribution and budgeting',
      'Production monitoring and alerting'
    ],
    color: 'from-purple-600 to-cyan-500'
  }
]

// Calculate mastery level based on user progress
function calculateMasteryLevel(
  weekProgress: any[],
  axisId: string
): { level: number; completedSkills: number; totalSkills: number; evidence: string[] } {
  // Map axes to weeks (simplified for now - will be enhanced)
  const axisToWeeks: Record<string, number[]> = {
    'systematic-prompting': [1, 3],  // Weeks 1 and 3
    'sovereign-governance': [2],     // Week 2
    'knowledge-architecture': [4, 5], // Weeks 4-5
    'context-engineering': [1, 6],   // Week 1 and 6
    'agentic-orchestration': [7, 8], // Weeks 7-8
    'observability-evals': [9, 10],  // Weeks 9-10
    'production-readiness': [11, 12] // Weeks 11-12
  }

  const relevantWeeks = axisToWeeks[axisId] || []
  const axis = MASTERY_AXES.find(a => a.id === axisId)
  const totalSkills = axis?.skills.length || 0

  // Calculate completion based on relevant weeks
  let completedWeeks = 0
  const evidence: string[] = []

  for (const weekNum of relevantWeeks) {
    const progress = weekProgress.find(p => p.week.weekNumber === weekNum)
    if (progress) {
      const weekCompletion =
        (progress.conceptsCompleted / Math.max(progress.conceptsTotal, 1)) * 0.4 +
        (progress.labCompleted ? 0.3 : 0) +
        (progress.projectCompleted ? 0.3 : 0)

      if (weekCompletion >= 0.8) {
        completedWeeks++
        evidence.push(`Week ${weekNum}: ${progress.week.title}`)
      }
    }
  }

  const masteryLevel = relevantWeeks.length > 0
    ? Math.round((completedWeeks / relevantWeeks.length) * 100)
    : 0

  const completedSkills = Math.round((masteryLevel / 100) * totalSkills)

  return {
    level: masteryLevel,
    completedSkills,
    totalSkills,
    evidence
  }
}

export default async function VerificationReportPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  // Get user and progress data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      weekProgress: {
        include: {
          week: true
        },
        orderBy: {
          week: {
            weekNumber: 'asc'
          }
        }
      }
    }
  })

  if (!user) redirect('/login')

  // Calculate overall completion
  const totalWeeks = 12
  const completedWeeks = user.weekProgress.filter(p =>
    p.conceptsCompleted === p.conceptsTotal &&
    p.labCompleted &&
    p.projectCompleted
  ).length
  const overallCompletion = Math.round((completedWeeks / totalWeeks) * 100)

  // Calculate mastery for each axis
  const masteryData = MASTERY_AXES.map(axis => ({
    ...axis,
    ...calculateMasteryLevel(user.weekProgress, axis.id)
  }))

  // Calculate overall mastery score
  const overallMastery = Math.round(
    masteryData.reduce((sum, axis) => sum + axis.level, 0) / MASTERY_AXES.length
  )

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Architect Verification Report
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Data-driven proof of AI architecture mastery
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white"
            onClick={() => window.print()}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Student Info */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{user.name || session.user.name}</CardTitle>
                <CardDescription className="text-base">{user.email}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  {overallMastery}%
                </div>
                <div className="text-sm text-muted-foreground">Overall Mastery</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-2xl font-semibold">{completedWeeks}/{totalWeeks}</div>
                <div className="text-sm text-muted-foreground">Weeks Completed</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <div className="text-2xl font-semibold">
                  {masteryData.filter(a => a.level >= 80).length}/7
                </div>
                <div className="text-sm text-muted-foreground">Axes Mastered (≥80%)</div>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <div className="text-2xl font-semibold">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="text-sm text-muted-foreground">Report Generated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7-Axis Mastery Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">The 7-Axis Mastery Metrics</h2>
        <div className="grid gap-6">
          {masteryData.map((axis, index) => {
            const IconComponent = axis.icon
            const masteryLabel =
              axis.level >= 90 ? 'Expert' :
              axis.level >= 80 ? 'Advanced' :
              axis.level >= 60 ? 'Proficient' :
              axis.level >= 40 ? 'Intermediate' :
              axis.level >= 20 ? 'Beginner' : 'Not Started'

            return (
              <Card key={axis.id} className="border-l-4 border-purple-400">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${axis.color} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{axis.name}</CardTitle>
                        <CardDescription>{axis.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                        {axis.level}%
                      </div>
                      <div className="text-sm text-muted-foreground">{masteryLabel}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${axis.color} transition-all duration-500`}
                        style={{ width: `${axis.level}%` }}
                      />
                    </div>
                  </div>

                  {/* Skills Checklist */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Skills Demonstrated ({axis.completedSkills}/{axis.totalSkills}):
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {axis.skills.map((skill, skillIndex) => {
                        const isCompleted = skillIndex < axis.completedSkills
                        return (
                          <div
                            key={skillIndex}
                            className={`flex items-center gap-2 text-sm ${
                              isCompleted ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 flex-shrink-0 ${
                                isCompleted
                                  ? 'text-green-600'
                                  : 'text-gray-300'
                              }`}
                            />
                            <span className={isCompleted ? 'font-medium' : ''}>
                              {skill}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Evidence */}
                  {axis.evidence.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Evidence:
                      </div>
                      <div className="space-y-1">
                        {axis.evidence.map((item, i) => (
                          <div key={i} className="text-sm text-muted-foreground">
                            • {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Footer Note */}
      <Card className="bg-gradient-to-r from-purple-50 to-cyan-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Verification Authenticity</h3>
              <p className="text-sm text-muted-foreground">
                This report is generated from verified completion data in the AI Architect Accelerator program.
                Skills are assessed through hands-on labs, production-ready projects, and scenario-based evaluations.
                Each metric represents demonstrated capability, not theoretical knowledge.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Report ID:</strong> {user.id.substring(0, 8).toUpperCase()} •
                <strong> Generated:</strong> {new Date().toISOString().split('T')[0]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          header, nav, footer {
            display: none !important;
          }
          .container {
            max-width: 100% !important;
            padding: 0 !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
