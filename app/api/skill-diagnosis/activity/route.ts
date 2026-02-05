import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateUserSkillScores } from '@/lib/skill-scoring'

/**
 * POST /api/skill-diagnosis/activity
 * Update user's score for an activity
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { activityId, scorePercentage } = body

    if (!activityId || typeof scorePercentage !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request body. Requires activityId and scorePercentage' },
        { status: 400 }
      )
    }

    if (scorePercentage < 0 || scorePercentage > 100) {
      return NextResponse.json(
        { error: 'scorePercentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    await updateUserSkillScores(
      session.user.id,
      activityId,
      scorePercentage
    )

    return NextResponse.json({
      success: true,
      message: 'Activity score updated successfully'
    })
  } catch (error) {
    console.error('Error updating activity score:', error)
    return NextResponse.json(
      { error: 'Failed to update activity score' },
      { status: 500 }
    )
  }
}
