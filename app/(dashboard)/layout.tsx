import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { SystemHandshake } from '@/components/dashboard/SystemHandshake'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Query the user's most recent OAuth provider for the handshake toast
  let provider: string | undefined
  if (session.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })
    if (user) {
      const account = await prisma.account.findFirst({
        where: { userId: user.id },
        orderBy: { id: 'desc' },
        select: { provider: true },
      })
      provider = account?.provider
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userEmail={session.user?.email} />
      <SystemHandshake provider={provider} userName={session.user?.name ?? undefined} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
