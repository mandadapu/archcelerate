import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateDomainScore } from '@/lib/skill-scoring'

/**
 * GET /api/skill-diagnosis/domains/[domainId]
 * Get detailed score for a specific domain
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { domainId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const domainScore = await calculateDomainScore(
      session.user.id,
      params.domainId
    )

    if (!domainScore) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: domainScore
    })
  } catch (error) {
    console.error('Error fetching domain score:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domain score' },
      { status: 500 }
    )
  }
}
