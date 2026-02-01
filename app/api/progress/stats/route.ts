import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserProgress, getProgressStats } from '@/src/lib/analytics/progress-tracking'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.email

    // Get user progress and stats
    const userProgress = await getUserProgress(userId)
    const progressStats = await getProgressStats(userId)

    // Combine and return data
    const dashboardData = {
      stats: {
        totalModules: userProgress.totalModules,
        completedModules: userProgress.completedModules,
        totalLessons: userProgress.totalLessons,
        completedLessons: userProgress.completedLessons,
        totalTimeSpent: userProgress.totalTimeSpent,
        overallProgress: userProgress.overallProgress,
        streakDays: progressStats.streakDays,
      },
      dailyActivity: progressStats.dailyActivity,
      difficultyBreakdown: progressStats.difficultyBreakdown,
      moduleCompletion: progressStats.moduleCompletion,
      moduleProgress: userProgress.moduleProgress,
      recentActivity: userProgress.recentActivity,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Stats retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve stats' },
      { status: 500 }
    )
  }
}
