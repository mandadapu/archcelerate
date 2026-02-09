import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
const UAParser = require('ua-parser-js')

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const eventType = body.eventType === 'session.logout' ? 'session.logout' : 'session.login'
    const provider = body.provider || 'unknown'

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const parser = new UAParser(userAgent)
    const device = {
      type: parser.getDevice().type || 'desktop',
      browser: parser.getBrowser().name || 'unknown',
      browserVersion: parser.getBrowser().version || 'unknown',
      os: parser.getOS().name || 'unknown',
      osVersion: parser.getOS().version || 'unknown',
    }

    await prisma.learningEvent.create({
      data: {
        userId: session.user.id,
        eventType,
        eventData: {
          provider,
          ipAddress,
          userAgent,
          device,
          status: eventType === 'session.login' ? 'SUCCESS' : 'TERMINATED',
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording access event:', error)
    return NextResponse.json(
      { error: 'Failed to record access event' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = await prisma.learningEvent.findMany({
      where: {
        userId: session.user.id,
        eventType: { in: ['session.login', 'session.logout'] },
      },
      orderBy: { occurredAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching access events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch access events' },
      { status: 500 }
    )
  }
}
