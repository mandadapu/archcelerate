import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { trackLessonProgress } from '@/src/lib/analytics/progress-tracking'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lessonId, completed, timeSpent, score } = await request.json()

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Missing required field: lessonId' },
        { status: 400 }
      )
    }

    // Track the progress
    await trackLessonProgress(session.user.email, lessonId, {
      completed,
      timeSpent,
      score,
    })

    return NextResponse.json({
      success: true,
      message: 'Progress tracked successfully',
    })
  } catch (error) {
    console.error('Progress tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track progress' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Missing required parameter: lessonId' },
        { status: 400 }
      )
    }

    // TODO: Implement actual progress retrieval
    // For now, return mock data
    return NextResponse.json({
      lessonId,
      completed: false,
      timeSpent: 0,
      score: null,
    })
  } catch (error) {
    console.error('Progress retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve progress' },
      { status: 500 }
    )
  }
}
