import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { recommendPath, getUserProfileDefaults } from '@/lib/onboarding/personalization'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { answers, selectedPath } = await request.json()

    if (!answers || !selectedPath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get recommended path based on answers
    const path = recommendPath(answers)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user profile with onboarding data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      path: {
        id: selectedPath,
        recommendedPace: path.recommendedPace,
      },
    })
  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
