import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cookieStore = await cookies()
    const sessionTokenCookie =
      cookieStore.get('next-auth.session-token') ||
      cookieStore.get('__Secure-next-auth.session-token')

    if (!sessionTokenCookie) {
      return NextResponse.json(
        { error: 'No active session token found' },
        { status: 400 }
      )
    }

    const result = await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        sessionToken: { not: sessionTokenCookie.value },
      },
    })

    // Log termination event if sessions were actually terminated
    if (result.count > 0) {
      await prisma.learningEvent.create({
        data: {
          userId: session.user.id,
          eventType: 'session.logout',
          eventData: {
            provider: 'BULK_TERMINATE',
            ipAddress: 'N/A',
            userAgent: 'N/A',
            status: 'TERMINATED',
            detail: `${result.count} remote session${result.count !== 1 ? 's' : ''} revoked`,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      terminatedSessions: result.count,
    })
  } catch (error) {
    console.error('Error terminating sessions:', error)
    return NextResponse.json(
      { error: 'Failed to terminate sessions' },
      { status: 500 }
    )
  }
}
