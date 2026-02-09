// app/api/workflows/executions/[executionId]/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ executionId: string }>
}

// GET /api/workflows/executions/:id — Get execution detail with node results
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { executionId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get execution
  const { data: execution, error: execError } = await supabase
    .from('workflow_executions')
    .select('*')
    .eq('id', executionId)
    .eq('user_id', user.id)
    .single()

  if (execError || !execution) {
    return Response.json({ error: 'Execution not found' }, { status: 404 })
  }

  // Get node executions
  const { data: nodeExecutions, error: nodeError } = await supabase
    .from('workflow_node_executions')
    .select('*')
    .eq('execution_id', executionId)
    .order('started_at', { ascending: true })

  if (nodeError) {
    return Response.json({ error: nodeError.message }, { status: 500 })
  }

  return Response.json({ execution, nodeExecutions })
}
