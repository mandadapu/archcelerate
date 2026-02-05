import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCertificationStatus } from '@/lib/skill-scoring'

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
