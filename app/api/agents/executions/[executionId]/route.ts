import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
) {
  const { executionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: execution, error: execError } = await supabase
    .from('agent_executions')
    .select(`
      *,
      agent_definition:agent_definitions(*)
    `)
    .eq('id', executionId)
    .eq('user_id', user.id)
    .single()

  if (execError) {
    return NextResponse.json({ error: execError.message }, { status: 404 })
  }

  const { data: steps, error: stepsError } = await supabase
    .from('agent_steps')
    .select('*')
    .eq('execution_id', executionId)
    .order('step_number', { ascending: true })

  if (stepsError) {
    return NextResponse.json({ error: stepsError.message }, { status: 500 })
  }

  return NextResponse.json({ execution, steps: steps || [] })
}
