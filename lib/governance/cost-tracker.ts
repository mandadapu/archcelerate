// lib/governance/cost-tracker.ts
import { createClient } from '@/lib/supabase/server'

export async function checkBudget(userId: string): Promise<{
  withinBudget: boolean
  currentSpend: number
  monthlyBudget: number
  remaining: number
}> {
  const supabase = createClient()

  // Get or create user budget
  let { data: budget } = await supabase
    .from('user_budgets')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!budget) {
    // Create default budget
    const { data: newBudget } = await supabase
      .from('user_budgets')
      .insert({
        user_id: userId,
        monthly_budget: 10.00,
        current_spend: 0.00
      })
      .select()
      .single()

    budget = newBudget!
  }

  // Check if budget period needs reset (monthly)
  const periodStart = new Date(budget.budget_period_start)
  const now = new Date()
  const daysSinceStart = (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)

  if (daysSinceStart >= 30) {
    // Reset budget for new period
    await supabase
      .from('user_budgets')
      .update({
        current_spend: 0.00,
        budget_period_start: now.toISOString(),
        budget_exceeded: false
      })
      .eq('user_id', userId)

    budget.current_spend = 0
    budget.budget_exceeded = false
  }

  const remaining = budget.monthly_budget - budget.current_spend

  return {
    withinBudget: !budget.budget_exceeded && remaining > 0,
    currentSpend: budget.current_spend,
    monthlyBudget: budget.monthly_budget,
    remaining: Math.max(0, remaining)
  }
}

export async function trackCost(userId: string, cost: number) {
  const supabase = createClient()

  const { data: budget } = await supabase
    .from('user_budgets')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (budget) {
    const newSpend = budget.current_spend + cost
    const exceeded = newSpend >= budget.monthly_budget

    await supabase
      .from('user_budgets')
      .update({
        current_spend: newSpend,
        budget_exceeded: exceeded,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
  }
}

export async function getUsageStats(userId: string, days: number = 30) {
  const supabase = createClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data: requests } = await supabase
    .from('llm_requests')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (!requests) return null

  const totalCost = requests.reduce((sum, r) => sum + Number(r.cost), 0)
  const totalTokens = requests.reduce((sum, r) => sum + r.total_tokens, 0)
  const avgLatency = requests.reduce((sum, r) => sum + r.latency_ms, 0) / requests.length

  // Group by day
  const dailyStats = requests.reduce((acc, r) => {
    const day = r.created_at.split('T')[0]
    if (!acc[day]) {
      acc[day] = { requests: 0, cost: 0, tokens: 0 }
    }
    acc[day].requests++
    acc[day].cost += Number(r.cost)
    acc[day].tokens += r.total_tokens
    return acc
  }, {} as Record<string, any>)

  return {
    totalRequests: requests.length,
    totalCost,
    totalTokens,
    avgLatency: Math.round(avgLatency),
    dailyStats
  }
}
