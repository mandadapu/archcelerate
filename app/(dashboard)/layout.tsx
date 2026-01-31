import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-slate-900">
                AI Architect Accelerator
              </h1>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
                  Dashboard
                </Link>
                <Link href="/mentor" className="text-sm text-slate-600 hover:text-slate-900">
                  AI Mentor
                </Link>
                <Link href="/portfolio" className="text-sm text-slate-600 hover:text-slate-900">
                  Portfolio
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">{session.user?.email}</span>
              <Link href="/api/auth/signout">
                <Button variant="ghost" size="sm">
                  Sign out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
