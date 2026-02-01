// lib/governance/logger.ts
import { createClient } from '@/lib/supabase/server'

export interface LogRequest {
  userId: string
  endpoint: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  latencyMs: number
  status: 'success' | 'error' | 'rate_limited'
  errorMessage?: string
}

export async function logLLMRequest(request: LogRequest) {
  const supabase = createClient()

  await supabase.from('llm_requests').insert({
    user_id: request.userId,
    endpoint: request.endpoint,
    model: request.model,
    prompt_tokens: request.promptTokens,
    completion_tokens: request.completionTokens,
    total_tokens: request.totalTokens,
    cost: request.cost,
    latency_ms: request.latencyMs,
    status: request.status,
    error_message: request.errorMessage
  })
}

export async function logAuditEvent(
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  metadata?: Record<string, any>,
  request?: Request
) {
  const supabase = createClient()

  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
    ip_address: request?.headers.get('x-forwarded-for') ||
                request?.headers.get('x-real-ip') ||
                'unknown',
    user_agent: request?.headers.get('user-agent')
  })
}

// Calculate cost based on model and tokens
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
  }

  const { input, output } = pricing[model] || pricing['gpt-3.5-turbo']
  return (inputTokens / 1000) * input + (outputTokens / 1000) * output
}
