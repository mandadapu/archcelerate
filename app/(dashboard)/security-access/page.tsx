import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SecurityAccessClient } from '@/components/security/SecurityAccessClient'

export default async function SecurityAccessPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const events = await prisma.learningEvent.findMany({
    where: {
      userId: session.user.id,
      eventType: { in: ['session.login', 'session.logout'] },
    },
    orderBy: { occurredAt: 'desc' },
    take: 20,
  })

  const activeSessions = await prisma.session.count({
    where: { userId: session.user.id },
  })

  const serializedEvents = events.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    eventData: e.eventData as Record<string, string>,
    occurredAt: e.occurredAt.toISOString(),
  }))

  return (
    <SecurityAccessClient
      events={serializedEvents}
      activeSessions={activeSessions}
      userEmail={session.user.email || ''}
    />
  )
}
