import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
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

  // Only set tourStartedAt on first visit
  if (!user.tourStartedAt && !user.tourCompleted) {
    await prisma.user.update({
      where: { id: user.id },
      data: { tourStartedAt: new Date() },
    })

    await prisma.learningEvent.create({
      data: {
        userId: user.id,
        eventType: 'tour.started',
        eventData: { startedAt: new Date().toISOString() },
      },
    })
  }

  return NextResponse.json({ success: true })
}
