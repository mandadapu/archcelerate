import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  calculateOverallScore,
  getRadarChartData
} from '@/lib/skill-scoring'

/**
 * GET /api/skill-diagnosis
 * Get overall skill diagnosis for the current user
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
