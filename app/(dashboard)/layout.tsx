import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Check diagnosis completion to control nav state
  let diagnosisCompleted = false
  if (session.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { skillDiagnosis: { select: { completedAt: true } } },
    })
    diagnosisCompleted = !!user?.skillDiagnosis
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userEmail={session.user?.email} diagnosisCompleted={diagnosisCompleted} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
