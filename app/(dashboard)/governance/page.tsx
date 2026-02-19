import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DollarSign, Activity, Shield, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Governance Dashboard',
  description: 'Monitor your AI usage, costs, and compliance'
}

export default async function GovernancePage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/governance/stats?days=30`, {
    cache: 'no-store'
  })
  const stats = await res.json()

  const budgetUsed = (stats.budget.currentSpend / stats.budget.monthlyBudget) * 100

  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Governance Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor your AI usage, costs, and compliance
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.usage?.totalCost.toFixed(4) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.usage?.totalRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.usage?.avgLatency || 0}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.moderationLogs.filter((l: any) => l.flagged).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 10 checks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Budget</CardTitle>
            <CardDescription>
              ${stats.budget.currentSpend.toFixed(2)} of ${stats.budget.monthlyBudget.toFixed(2)} used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={budgetUsed} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{budgetUsed.toFixed(1)}% used</span>
              <span>${stats.budget.remaining.toFixed(2)} remaining</span>
            </div>
            {budgetUsed > 80 && (
              <p className="mt-4 text-sm text-orange-600">
                ⚠️ You&apos;ve used {budgetUsed.toFixed(0)}% of your monthly budget
              </p>
            )}
          </CardContent>
        </Card>

        {/* Daily Usage Chart (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage</CardTitle>
            <CardDescription>Requests and costs over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart placeholder - integrate with recharts or similar
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Audit Logs</CardTitle>
            <CardDescription>Last 20 actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.auditLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <div>
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground ml-2">
                      {log.resource_type}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
