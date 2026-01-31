import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.name || session!.user!.name}!
        </h2>
        <p className="text-slate-600 mt-2">
          Ready to build AI products?
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sprint 0</CardTitle>
            <CardDescription>Skill Diagnosis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Take a quick assessment to personalize your learning path
            </p>
            <div className="mt-4">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                Not started
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint 1</CardTitle>
            <CardDescription>Foundation + Chat Assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Learn LLM fundamentals and build your first AI product
            </p>
            <div className="mt-4">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                Locked
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Mentor</CardTitle>
            <CardDescription>24/7 Support</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Get help from your AI learning assistant anytime
            </p>
            <div className="mt-4">
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                Available
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
