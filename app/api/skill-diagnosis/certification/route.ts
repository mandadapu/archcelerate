import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCertificationStatus, getProficiencyLevel } from '@/lib/skill-scoring'

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
 * GET /api/skill-diagnosis/certification
 * Get certification status for the current user
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
      const quizKeys = Object.keys(quizDomainLabels)
      const domainPcts = quizKeys.map(key => Math.round((scores[key] ?? 0) * 100))
      const domainCount = quizKeys.length
      const overallProficiency = domainPcts.reduce((s, p) => s + p, 0) / domainCount
      const domainsAbove70 = domainPcts.filter(p => p >= 70).length
      const domainsAbove85 = domainPcts.filter(p => p >= 85).length
      const allDomainsAbove70 = domainsAbove70 === domainCount
      const fourDomainsAbove85 = domainsAbove85 >= 4
      const overallAbove80 = overallProficiency >= 80
      const isEligible = allDomainsAbove70 && fourDomainsAbove85 && overallAbove80

      let level: 'none' | 'junior' | 'mid' | 'lead' | 'architect' = 'none'
      if (overallProficiency >= 87 && domainPcts.every(p => p >= 80)) level = 'architect'
      else if (isEligible) level = 'lead'
      else if (overallProficiency >= 61) level = 'mid'
      else if (overallProficiency > 0) level = 'junior'

      const topDomains = Object.entries(quizDomainLabels)
        .map(([key, name]) => ({ name, pct: Math.round((scores[key] ?? 0) * 100) }))
        .filter(d => d.pct >= 85)
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 2)
        .map(d => `${d.name} (${d.pct}th percentile)`)

      const verificationSummary = topDomains.length > 0
        ? `The candidate has demonstrated high proficiency in ${topDomains.join(' and ')}, with proven experience across ${domainsAbove85} advanced domains.`
        : 'The candidate is building foundational skills across AI architecture domains.'

      return NextResponse.json({
        success: true,
        data: {
          level,
          isEligible,
          overallProficiency,
          requirementsMet: {
            allDomainsAbove70,
            fourDomainsAbove85,
            overallAbove80,
          },
          verificationSummary,
        }
      })
    }

    // Fallback to activity-based
    const certificationStatus = await getCertificationStatus(session.user.id)

    return NextResponse.json({
      success: true,
      data: certificationStatus
    })
  } catch (error) {
    console.error('Error fetching certification status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certification status' },
      { status: 500 }
    )
  }
}
