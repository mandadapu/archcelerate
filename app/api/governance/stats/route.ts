// app/api/governance/stats/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUsageStats, checkBudget } from '@/lib/governance/cost-tracker'

export async function GET(request: NextRequest) {
  const supabase = createClient()

  // Authenticate
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get query params
  const searchParams = request.nextUrl.searchParams
  const days = parseInt(searchParams.get('days') || '30')

  // Get usage stats
  const usage = await getUsageStats(user.id, days)

  // Get budget info
  const budget = await checkBudget(user.id)

  // Get recent moderation logs
  const { data: moderationLogs } = await supabase
    .from('moderation_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get recent audit logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return Response.json({
    usage,
    budget,
    moderationLogs: moderationLogs || [],
    auditLogs: auditLogs || []
  })
}
