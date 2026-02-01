import { getDashboardMetrics, getRecentUsers } from '@/src/lib/admin/metrics'
import { AnalyticsDashboard } from '@/src/components/admin/AnalyticsDashboard'
import { UserManagement } from '@/src/components/admin/UserManagement'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  // Check if user is admin (you'll need to add admin role to your user model)
  if (!session) {
    redirect('/auth/signin')
  }

  // For now, allow all authenticated users - in production, check for admin role
  // if (!session.user.role || session.user.role !== 'admin') {
  //   redirect('/dashboard')
  // }

  const [metrics, recentUsers] = await Promise.all([
    getDashboardMetrics(),
    getRecentUsers(20),
  ])

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Platform overview and management</p>
      </div>

      <AnalyticsDashboard metrics={metrics} />

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Recent Users</h2>
            <p className="text-sm text-slate-600">Showing last 20 users</p>
          </div>
          <UserManagement users={recentUsers} />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="p-12 text-center text-slate-500">
            <h3 className="text-lg font-semibold mb-2">Content Management</h3>
            <p>Module and lesson management coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="p-12 text-center text-slate-500">
            <h3 className="text-lg font-semibold mb-2">Reports & Analytics</h3>
            <p>Detailed reporting and analytics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
