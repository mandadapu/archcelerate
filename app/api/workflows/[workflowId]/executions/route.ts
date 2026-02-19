// app/api/workflows/[workflowId]/executions/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ workflowId: string }>
}

// GET /api/workflows/:id/executions — List executions for a workflow
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { workflowId } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const { data: executions, error } = await supabase
    .from('workflow_executions')
    .select('id, status, total_tokens, total_cost, started_at, completed_at, error_message')
    .eq('workflow_id', workflowId)
    .eq('user_id', session.user.id)
    .order('started_at', { ascending: false })
    .limit(20)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ executions })
}
