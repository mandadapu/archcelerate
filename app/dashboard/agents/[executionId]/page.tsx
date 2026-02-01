import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AgentExecutionTrace } from '@/components/dashboard/agent-execution-trace'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ExecutionDetailPage({
  params
}: {
  params: { executionId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Unauthorized</div>
  }

  const { data: execution } = await supabase
    .from('agent_executions')
    .select(`
      *,
      agent_definition:agent_definitions(*)
    `)
    .eq('id', params.executionId)
    .eq('user_id', user.id)
    .single()

  const { data: steps } = await supabase
    .from('agent_steps')
    .select('*')
    .eq('execution_id', params.executionId)
    .order('step_number', { ascending: true })

  if (!execution) {
    return (
      <div className="container mx-auto py-8">
        <p>Execution not found</p>
      </div>
    )
  }

  const duration = execution.completed_at
    ? (new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000
    : null

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Link
        href="/dashboard/agents"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-bold">
          {execution.agent_definition?.name || 'Agent Execution'}
        </h1>
        <p className="text-muted-foreground">Execution Details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Iterations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{execution.iterations || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(execution.total_tokens || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(execution.cost || '0').toFixed(4)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{execution.input}</p>
        </CardContent>
      </Card>

      {execution.output && (
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap">{execution.output}</pre>
          </CardContent>
        </Card>
      )}

      {execution.error_message && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-destructive whitespace-pre-wrap">
              {execution.error_message}
            </pre>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Execution Trace</h2>
        <AgentExecutionTrace steps={steps || []} />
      </div>
    </div>
  )
}
