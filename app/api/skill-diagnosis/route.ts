import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  calculateOverallScore,
  getRadarChartData,
  getProficiencyLevel,
} from '@/lib/skill-scoring'

const domainLabels: Record<string, string> = {
  systematic_prompting: 'Systematic Prompting',
  sovereign_governance: 'Sovereign Governance',
  knowledge_architecture: 'Knowledge Architecture',
  agentic_systems: 'Agentic Systems',
  context_engineering: 'Context Engineering',
  production_systems: 'Production Systems',
  model_selection: 'Model Selection',
}

const quizDomainLabels: Record<string, string> = {
  llm_fundamentals: 'LLM Fundamentals',
  prompt_engineering: 'Prompt Engineering',
  rag: 'RAG Systems',
  agents: 'AI Agents',
  multimodal: 'Multimodal AI',
  production_ai: 'Production AI',
}

/**
 * GET /api/skill-diagnosis
 * Get overall skill diagnosis for the current user.
 * Primary: quiz-based skillDiagnosis.skillScores
 * Fallback: activity-based scoring from skill domains
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

      // Use quiz domain keys (llm_fundamentals, etc.) not architecture domain keys
      const domains = Object.entries(quizDomainLabels).map(([key, name], index) => {
        const score = scores[key] ?? 0
        const pct = Math.round(score * 100)
        return {
          domainId: key,
          domainName: name,
          domainSlug: key.replace(/_/g, '-'),
          totalPoints: pct,
          maxPoints: 100,
          percentage: pct,
          proficiencyLevel: getProficiencyLevel(pct),
          activities: [],
          orderIndex: index + 1,
        }
      })

      const overallProficiency = domains.reduce((sum, d) => sum + d.percentage, 0) / domains.length
      const radarChartData = domains.map(d => ({
        domain: d.domainName,
        score: d.percentage,
        fullMark: 100,
      }))

      return NextResponse.json({
        success: true,
        data: {
          userId: session.user.id,
          overallProficiency,
          proficiencyLevel: getProficiencyLevel(overallProficiency),
          domains,
          completedActivities: 1,
          totalActivities: 1,
          updatedAt: diagnosis.completedAt ?? new Date(),
          radarChartData,
        }
      })
    }

    // Fallback to activity-based scoring
    const overallScore = await calculateOverallScore(session.user.id)
    const radarChartData = await getRadarChartData(session.user.id)

    return NextResponse.json({
      success: true,
      data: {
        ...overallScore,
        radarChartData
      }
    })
  } catch (error) {
    console.error('Error fetching skill diagnosis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skill diagnosis' },
      { status: 500 }
    )
  }
}
