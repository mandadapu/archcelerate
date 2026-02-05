import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSkillGaps } from '@/lib/skill-scoring'

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
