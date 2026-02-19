import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const agentId = searchParams.get('agentId')
  const limit = parseInt(searchParams.get('limit') || '50')

  let query = supabase
    .from('agent_executions')
    .select(`
      *,
      agent_definition:agent_definitions(name, slug, category)
    `)
    .eq('user_id', session.user.id)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  if (agentId) {
    query = query.eq('agent_definition_id', agentId)
  }

  const { data: executions, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ executions: executions || [] })
}
