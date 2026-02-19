import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const quizDomainLabels: Record<string, string> = {
  llm_fundamentals: 'LLM Fundamentals',
  prompt_engineering: 'Prompt Engineering',
  rag: 'RAG Systems',
  agents: 'AI Agents',
  multimodal: 'Multimodal AI',
  production_ai: 'Production AI',
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const identity = session.user.email || 'UNKNOWN'

    // Fetch diagnosis, week progress, and study time in parallel
    const [diagnosis, weekProgress, timeAgg] = await Promise.all([
      prisma.skillDiagnosis.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.userWeekProgress.findMany({
        where: { userId: session.user.id },
        include: { week: { select: { weekNumber: true, title: true } } },
        orderBy: { week: { weekNumber: 'desc' } },
      }),
      prisma.conceptCompletion.aggregate({
        where: { userId: session.user.id },
        _sum: { timeSpentSeconds: true },
      }),
    ])

    let topSkills: { name: string; score: number }[] = []
    if (diagnosis?.skillScores) {
      const scores = diagnosis.skillScores as Record<string, number>
      topSkills = Object.entries(scores)
        .map(([key, value]) => ({
          name: quizDomainLabels[key] || key,
          score: Math.round(value * 100),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
    }

    const labsCompleted = weekProgress.filter((wp) => wp.labCompleted).length
    const highestWeek = weekProgress.length > 0
      ? { number: weekProgress[0].week.weekNumber, title: weekProgress[0].week.title }
      : null

    const totalTimeHours = Math.floor((timeAgg._sum.timeSpentSeconds || 0) / 3600)

    return NextResponse.json({
      identity,
      totalTimeHours,
      highestWeek,
      labsCompleted,
      topSkills,
    })
  } catch (error) {
    console.error('Error fetching session summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session summary' },
      { status: 500 }
    )
  }
}
