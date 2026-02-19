import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AgentMetricsCard } from '@/components/dashboard/agent-metrics'
import { PlayCircle } from 'lucide-react'

export default async function AgentsDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/')
  }

  const supabase = await createClient()

  // Fetch recent executions
  const { data: executions } = await supabase
    .from('agent_executions')
    .select(`
      *,
      agent_definition:agent_definitions(name, slug)
    `)
    .eq('user_id', session.user.id)
    .order('started_at', { ascending: false })
    .limit(20)

  // Calculate metrics
  const totalExecutions = executions?.length || 0
  const completed = executions?.filter(e => e.status === 'completed').length || 0
  const avgIterations = totalExecutions > 0
    ? executions!.reduce((sum, e) => sum + (e.iterations || 0), 0) / totalExecutions
    : 0
  const avgTokens = totalExecutions > 0
    ? executions!.reduce((sum, e) => sum + (e.total_tokens || 0), 0) / totalExecutions
    : 0
  const avgCost = totalExecutions > 0
    ? executions!.reduce((sum, e) => sum + parseFloat(e.cost || '0'), 0) / totalExecutions
    : 0

  const avgDuration = totalExecutions > 0
    ? executions!.reduce((sum, e) => {
        if (e.completed_at && e.started_at) {
          const duration = (new Date(e.completed_at).getTime() - new Date(e.started_at).getTime()) / 1000
          return sum + duration
        }
        return sum
      }, 0) / totalExecutions
    : 0

  const metrics = {
    totalExecutions,
    successRate: totalExecutions > 0 ? completed / totalExecutions : 0,
    avgIterations,
    avgTokens,
    avgCost,
    avgDuration
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your AI agent executions
          </p>
        </div>
        <Link href="/dashboard/agents/playground">
          <Button size="lg" className="gap-2">
            <PlayCircle className="h-5 w-5" />
            Agent Playground
          </Button>
        </Link>
      </div>

      <AgentMetricsCard metrics={metrics} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          {!executions || executions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No agent executions yet</p>
              <p className="text-sm mt-2">
                Agent executions will appear here once the agent framework is implemented
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {executions.map((execution) => (
                <Link
                  key={execution.id}
                  href={`/dashboard/agents/${execution.id}`}
                  className="block hover:bg-muted/50 p-4 rounded-lg border transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {execution.agent_definition?.name || 'Unknown Agent'}
                        </h3>
                        <Badge
                          variant={
                            execution.status === 'completed'
                              ? 'default'
                              : execution.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {execution.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {execution.input}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{execution.iterations || 0} iterations</div>
                      <div>{execution.total_tokens || 0} tokens</div>
                      <div>${parseFloat(execution.cost || '0').toFixed(4)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
