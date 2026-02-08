import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, tourStartedAt: true, tourCompleted: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (user.tourCompleted) {
    return NextResponse.json({ success: true, message: 'Already completed' })
  }

  const body = await request.json().catch(() => ({}))

  await prisma.user.update({
    where: { id: user.id },
    data: {
      tourCompleted: true,
      tourStartedAt: user.tourStartedAt || new Date(),
    },
  })

  await prisma.learningEvent.create({
    data: {
      userId: user.id,
      eventType: 'tour.completed',
      eventData: {
        timeSpentSeconds: body.timeSpentSeconds || null,
        completedAt: new Date().toISOString(),
      },
    },
  })

  return NextResponse.json({ success: true })
}
