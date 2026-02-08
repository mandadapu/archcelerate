import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSkillGaps } from '@/lib/skill-scoring'

const domainLabels: Record<string, string> = {
  systematic_prompting: 'Systematic Prompting',
  sovereign_governance: 'Sovereign Governance',
  knowledge_architecture: 'Knowledge Architecture',
  agentic_systems: 'Agentic Systems',
  context_engineering: 'Context Engineering',
  production_systems: 'Production Systems',
  model_selection: 'Model Selection',
}

const domainWeekMap: Record<string, number> = {
  systematic_prompting: 1,
  sovereign_governance: 2,
  knowledge_architecture: 3,
  agentic_systems: 5,
  context_engineering: 4,
  production_systems: 6,
  model_selection: 7,
}

/**
 * GET /api/skill-diagnosis/gaps
 * Get skill gaps and recommendations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for quiz-based diagnosis first
    const diagnosis = await prisma.skillDiagnosis.findUnique({
      where: { userId: session.user.id },
    })

    if (diagnosis?.skillScores) {
      const scores = diagnosis.skillScores as Record<string, number>
      const targetLevel = 80
      const gaps = Object.entries(domainLabels)
        .map(([key, name]) => {
          const pct = Math.round((scores[key] ?? 0) * 100)
          const gap = targetLevel - pct
          if (gap <= 0) return null
          const priority: 'high' | 'medium' | 'low' =
            gap > 40 ? 'high' : gap > 20 ? 'medium' : 'low'
          const weekNum = domainWeekMap[key] ?? 1
          return {
            domainName: name,
            domainSlug: key.replace(/_/g, '-'),
            currentLevel: pct,
            targetLevel,
            gap,
            priority,
            recommendations: [
              `Complete Week ${weekNum} curriculum for ${name}`,
              `Practice the hands-on lab exercises`,
            ],
          }
        })
        .filter(Boolean)
        .sort((a, b) => b!.gap - a!.gap)

      return NextResponse.json({
        success: true,
        data: gaps
      })
    }

    // Fallback to activity-based
    const gaps = await getSkillGaps(session.user.id)

    return NextResponse.json({
      success: true,
      data: gaps
    })
  } catch (error) {
    console.error('Error fetching skill gaps:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skill gaps' },
      { status: 500 }
    )
  }
}
