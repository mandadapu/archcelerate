// app/api/workflows/[workflowId]/execute/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/governance/rate-limiter'
import { WorkflowExecutor } from '@/lib/workflows/workflow-executor'

interface RouteParams {
  params: Promise<{ workflowId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { workflowId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit: 5 executions per hour
  const rateLimit = await checkRateLimit(user.id, 5, 3600)
  if (!rateLimit.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded. Try again later.', resetAt: rateLimit.resetAt },
      { status: 429 }
    )
  }

  // Get workflow
  const { data: workflow, error: wfError } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .single()

  if (wfError || !workflow) {
    return Response.json({ error: 'Workflow not found' }, { status: 404 })
  }

  // Check ownership (unless template)
  if (workflow.user_id !== user.id && !workflow.is_template) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const input = typeof body.input === 'string' ? body.input : ''

  if (input.length > 10000) {
    return Response.json({ error: 'Input too long (max 10,000 chars)' }, { status: 400 })
  }

  // Execute workflow
  const executor = new WorkflowExecutor(user.id, workflowId)
  const result = await executor.execute(workflow.definition, input)

  // Convert Map to plain object for JSON serialization
  const nodeResults: Record<string, unknown> = {}
  result.nodeResults.forEach((value, key) => {
    nodeResults[key] = value
  })

  return Response.json({
    executionId: result.executionId,
    output: result.output,
    nodeResults,
    totalTokens: result.totalTokens,
    totalCost: result.totalCost,
    status: result.status,
    errorMessage: result.errorMessage,
  })
}
