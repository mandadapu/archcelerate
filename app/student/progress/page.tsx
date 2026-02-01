import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProgressDashboard } from '@/src/components/analytics/ProgressDashboard'

export default async function StudentProgressPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Learning Progress</h1>
          <p className="text-gray-600">
            Track your learning journey and see your achievements
          </p>
        </div>

        <ProgressDashboard userId={session.user.email} />
      </div>
    </div>
  )
}
