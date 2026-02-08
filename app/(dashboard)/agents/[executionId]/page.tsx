import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { ExecutionTrace } from '@/components/agents/execution-trace'

export const metadata = {
  title: 'Agent Execution Details',
  description: 'View detailed execution trace for an agent run',
}

async function getExecutionDetails(executionId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = `${baseUrl}/api/agents/${executionId}`

  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      Cookie: (await (await import('next/headers')).cookies()).toString(),
    },
  })

  if (!res.ok) {
    if (res.status === 404) {
      return null
    }
    throw new Error('Failed to fetch execution details')
  }

  return res.json()
}

export default async function ExecutionDetailsPage({
  params,
}: {
  params: Promise<{ executionId: string }>
}) {
  const { executionId } = await params
  const data = await getExecutionDetails(executionId)

  if (!data) {
    notFound()
  }

  const { execution, steps, toolCalls } = data

  // Calculate duration
  const duration = execution.completed_at
    ? (new Date(execution.completed_at).getTime() -
        new Date(execution.started_at).getTime()) /
      1000
    : null

  // Calculate total cost
  const totalCost = execution.total_cost || 0

  // Get status info
  const statusConfig = {
    completed: {
      label: 'Completed',
      icon: CheckCircle2,
      variant: 'default' as const,
      className: 'text-green-500',
    },
    failed: {
      label: 'Failed',
      icon: XCircle,
      variant: 'destructive' as const,
      className: 'text-red-500',
    },
    running: {
      label: 'Running',
      icon: Loader2,
      variant: 'secondary' as const,
      className: 'text-blue-500 animate-spin',
    },
  }

  const status = statusConfig[execution.status as keyof typeof statusConfig]
  const StatusIcon = status?.icon || Loader2

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Execution Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                {execution.agent_definitions?.name || 'Agent Execution'}
              </CardTitle>
              {execution.agent_definitions?.description && (
                <p className="text-sm text-muted-foreground">
                  {execution.agent_definitions.description}
                </p>
              )}
            </div>
            <Badge variant={status?.variant || 'secondary'}>
              <StatusIcon className={`mr-1 h-4 w-4 ${status?.className}`} />
              {status?.label || 'Unknown'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input */}
          <div>
            <div className="text-sm font-medium mb-2">Input:</div>
            <div className="bg-muted p-4 rounded-md text-sm">
              {typeof execution.input === 'string'
                ? execution.input
                : JSON.stringify(execution.input, null, 2)}
            </div>
          </div>

          {/* Output */}
          {execution.output && (
            <div>
              <div className="text-sm font-medium mb-2">Output:</div>
              <div className="bg-muted p-4 rounded-md text-sm">
                {typeof execution.output === 'string'
                  ? execution.output
                  : JSON.stringify(execution.output, null, 2)}
              </div>
            </div>
          )}

          {/* Error */}
          {execution.error && (
            <div>
              <div className="text-sm font-medium mb-2 text-red-500">
                Error:
              </div>
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-md text-sm text-red-700 dark:text-red-300">
                {execution.error}
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Iterations
              </div>
              <div className="text-2xl font-bold">
                {execution.iterations || 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Total Tokens
              </div>
              <div className="text-2xl font-bold">
                {execution.total_tokens || 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Total Cost
              </div>
              <div className="text-2xl font-bold">
                ${totalCost.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Duration
              </div>
              <div className="text-2xl font-bold">
                {duration !== null ? `${duration.toFixed(2)}s` : '-'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Trace */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Execution Trace</h2>
        <ExecutionTrace steps={steps} toolCalls={toolCalls} />
      </div>
    </div>
  )
}
