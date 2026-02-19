// app/api/governance/stats/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getUsageStats, checkBudget } from '@/lib/governance/cost-tracker'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Get query params
  const searchParams = request.nextUrl.searchParams
  const days = parseInt(searchParams.get('days') || '30')

  // Get usage stats
  const usage = await getUsageStats(session.user.id, days)

  // Get budget info
  const budget = await checkBudget(session.user.id)

  // Get recent moderation logs
  const { data: moderationLogs } = await supabase
    .from('moderation_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get recent audit logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return Response.json({
    usage,
    budget,
    moderationLogs: moderationLogs || [],
    auditLogs: auditLogs || []
  })
}
