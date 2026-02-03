import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { conceptSlug, questions, answers, score, totalQuestions } = await request.json()

    if (!conceptSlug || !questions || !answers || score === undefined || !totalQuestions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const passed = (score / totalQuestions) >= 0.7 // 70% passing threshold

    // Save quiz attempt
    const attempt = await prisma.conceptQuizAttempt.create({
      data: {
        userId: user.id,
        conceptSlug,
        questionsData: questions,
        answersData: answers,
        score,
        totalQuestions,
        passed,
      },
    })

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        passed: attempt.passed,
        attemptedAt: attempt.attemptedAt,
      },
    })
  } catch (error) {
    console.error('Error saving quiz attempt:', error)
    return NextResponse.json(
      { error: 'Failed to save quiz attempt' },
      { status: 500 }
    )
  }
}
