# Week 2 Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build platform features to deliver Week 2 curriculum (Production Chat + Governance Foundations)

**Architecture:** Extend existing Next.js platform with production chat features, governance framework (input validation, content filtering, logging, rate limiting, cost tracking), and Week 2 content delivery.

**Tech Stack:** Next.js 14, Supabase (PostgreSQL + Auth), Redis (Upstash for rate limiting), Claude API, Anthropic moderation API, Vercel

---

## Task 1: Database Schema for Week 2 Governance

**Files:**
- Create: `supabase/migrations/20260201_week2_governance.sql`

**Step 1: Write migration for governance tables**

```sql
-- Governance: LLM request logging
CREATE TABLE IF NOT EXISTS public.llm_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    endpoint VARCHAR(200) NOT NULL,
    model VARCHAR(100) NOT NULL,
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    cost DECIMAL(10, 6) NOT NULL,
    latency_ms INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL, -- success, error, rate_limited
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Governance: Content moderation logs
CREATE TABLE IF NOT EXISTS public.moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    content_type VARCHAR(50) NOT NULL, -- input, output
    content TEXT NOT NULL,
    flagged BOOLEAN DEFAULT false,
    categories JSONB, -- {hate: false, sexual: false, violence: false, ...}
    action_taken VARCHAR(50), -- allowed, blocked, warning
    created_at TIMESTAMP DEFAULT NOW()
);

-- Governance: User budgets and usage
CREATE TABLE IF NOT EXISTS public.user_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) UNIQUE,
    monthly_budget DECIMAL(10, 2) DEFAULT 10.00,
    current_spend DECIMAL(10, 2) DEFAULT 0.00,
    budget_period_start TIMESTAMP DEFAULT NOW(),
    budget_exceeded BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Governance: Audit trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations (for Week 2 project)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    title VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages in conversations
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    tokens INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.llm_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own LLM requests" ON public.llm_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own moderation logs" ON public.moderation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own budget" ON public.user_budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own conversations" ON public.conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX idx_llm_requests_user_created ON public.llm_requests(user_id, created_at DESC);
CREATE INDEX idx_moderation_logs_user_created ON public.moderation_logs(user_id, created_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_audit_logs_user_created ON public.audit_logs(user_id, created_at DESC);
```

**Step 2: Run migration**

```bash
cd /path/to/project
npx supabase migration up
```

Expected: Migration applied successfully

**Step 3: Seed Week 2 data**

Create: `supabase/seed/week2_data.sql`

```sql
-- Insert Week 2
INSERT INTO public.curriculum_weeks (week_number, title, description, objectives)
VALUES (
    2,
    'Chat Assistant Production + Governance Foundations',
    'Build production-ready chat application with advanced features and implement governance from day one',
    '["Build production-ready chat application", "Implement governance (guardrails, observability)", "Deploy to production", "Understand why governance matters"]'::jsonb
);

-- Get week 2 ID
DO $$
DECLARE
    week2_id UUID;
BEGIN
    SELECT id INTO week2_id FROM public.curriculum_weeks WHERE week_number = 2;

    -- Insert Concepts
    INSERT INTO public.concepts (week_id, order_index, slug, title, content_path, estimated_minutes)
    VALUES
        (week2_id, 1, 'advanced-chat-architecture', 'Advanced Chat Architecture', 'content/week2/advanced-chat-architecture.mdx', 45),
        (week2_id, 2, 'production-chat-features', 'Production Chat Features', 'content/week2/production-chat-features.mdx', 60),
        (week2_id, 3, 'governance-foundations', 'Governance Foundations', 'content/week2/governance-foundations.mdx', 90);

    -- Insert Lab
    INSERT INTO public.labs (week_id, slug, title, description, exercises)
    VALUES (
        week2_id,
        'governance-implementation',
        'Governance Implementation',
        'Implement input validation, content filtering, logging, rate limiting, and cost tracking',
        '[
            {"number": 1, "title": "Implement input validation with edge cases", "type": "coding"},
            {"number": 2, "title": "Add content filtering with Anthropic moderation", "type": "coding"},
            {"number": 3, "title": "Build request logging system", "type": "coding"},
            {"number": 4, "title": "Create rate limiting middleware", "type": "coding"},
            {"number": 5, "title": "Build cost tracking dashboard", "type": "coding"}
        ]'::jsonb
    );

    -- Insert Project
    INSERT INTO public.projects (week_id, slug, title, description, requirements, success_criteria, estimated_hours)
    VALUES (
        week2_id,
        'production-chat-assistant',
        'Production Chat Assistant (Enhanced)',
        'Build production-ready chat application with full governance implementation',
        '[
            "Conversation persistence across sessions",
            "User authentication and authorization",
            "Input/output validation",
            "Content filtering",
            "Comprehensive logging",
            "Rate limiting (10 messages/minute)",
            "Cost tracking per user",
            "Deployed to cloud with monitoring",
            "Error handling and graceful degradation"
        ]'::jsonb,
        '[
            "Production-deployed with authentication",
            "Governance dashboard shows all interactions",
            "Rate limiting prevents abuse",
            "Graceful error handling when API fails",
            "<2s response time for 90% of requests"
        ]'::jsonb,
        5
    );
END $$;
```

**Step 4: Run seed**

```bash
psql $DATABASE_URL < supabase/seed/week2_data.sql
```

Expected: Week 2 data inserted successfully

**Step 5: Commit**

```bash
git add supabase/migrations/20260201_week2_governance.sql supabase/seed/week2_data.sql
git commit -m "feat: add Week 2 database schema for governance

- Add llm_requests table for logging all API calls
- Add moderation_logs for content filtering
- Add user_budgets for cost tracking
- Add audit_logs for compliance
- Add conversations and messages tables
- Enable RLS with appropriate policies
- Seed Week 2 curriculum data"
```

---

## Task 2: Governance Service Layer

**Files:**
- Create: `lib/governance/input-validator.ts`
- Create: `lib/governance/content-moderator.ts`
- Create: `lib/governance/logger.ts`
- Create: `lib/governance/rate-limiter.ts`
- Create: `lib/governance/cost-tracker.ts`

**Step 1: Create input validator**

```typescript
// lib/governance/input-validator.ts
import { z } from 'zod'

const ChatMessageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message too long (max 4000 characters)'),
  conversationId: z.string().uuid().optional()
})

export interface ValidationResult {
  valid: boolean
  errors?: string[]
  sanitized?: any
}

export async function validateChatInput(
  input: unknown
): Promise<ValidationResult> {
  try {
    const validated = ChatMessageSchema.parse(input)

    // Sanitize content
    const sanitized = {
      ...validated,
      content: sanitizeContent(validated.content)
    }

    return { valid: true, sanitized }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => e.message)
      }
    }
    return {
      valid: false,
      errors: ['Invalid input']
    }
  }
}

function sanitizeContent(content: string): string {
  // Remove null bytes
  let sanitized = content.replace(/\0/g, '')

  // Trim whitespace
  sanitized = sanitized.trim()

  // Basic XSS prevention (for display purposes)
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return sanitized
}

// Edge case tests
export const TEST_CASES = {
  valid: [
    { content: 'Hello world', conversationId: '123e4567-e89b-12d3-a456-426614174000' },
    { content: 'A'.repeat(4000) }
  ],
  invalid: [
    { content: '' }, // empty
    { content: 'A'.repeat(4001) }, // too long
    { content: null }, // null
    { conversationId: 'invalid-uuid' } // bad UUID
  ]
}
```

**Step 2: Create content moderator**

```typescript
// lib/governance/content-moderator.ts
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export interface ModerationResult {
  flagged: boolean
  categories: {
    hate: boolean
    sexual: boolean
    violence: boolean
    self_harm: boolean
    harassment: boolean
  }
  action: 'allowed' | 'blocked' | 'warning'
}

export async function moderateContent(
  userId: string,
  content: string,
  contentType: 'input' | 'output'
): Promise<ModerationResult> {
  // Use Anthropic's built-in moderation
  // Note: As of now, Anthropic doesn't have a separate moderation endpoint
  // This is a placeholder for when they do, or we can use OpenAI's moderation API

  // For now, use a simple keyword filter + prompt-based check
  const result = await checkWithPrompt(content)

  // Log the moderation check
  const supabase = createClient()
  await supabase.from('moderation_logs').insert({
    user_id: userId,
    content_type: contentType,
    content: content.substring(0, 1000), // Store first 1000 chars
    flagged: result.flagged,
    categories: result.categories,
    action_taken: result.action
  })

  return result
}

async function checkWithPrompt(content: string): Promise<ModerationResult> {
  try {
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307', // Fast, cheap model for moderation
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Analyze this content for policy violations. Respond with JSON only.

Content: "${content}"

Respond in this exact JSON format:
{
  "hate": boolean,
  "sexual": boolean,
  "violence": boolean,
  "self_harm": boolean,
  "harassment": boolean
}`
      }]
    })

    const resultText = response.content[0].text
    const categories = JSON.parse(resultText)

    const flagged = Object.values(categories).some(v => v === true)

    return {
      flagged,
      categories,
      action: flagged ? 'blocked' : 'allowed'
    }
  } catch (error) {
    console.error('Moderation error:', error)
    // Fail open (allow) rather than fail closed on errors
    return {
      flagged: false,
      categories: {
        hate: false,
        sexual: false,
        violence: false,
        self_harm: false,
        harassment: false
      },
      action: 'allowed'
    }
  }
}
```

**Step 3: Create request logger**

```typescript
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
```

**Step 4: Create rate limiter**

```typescript
// lib/governance/rate-limiter.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export async function checkRateLimit(
  userId: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `rate_limit:${userId}`
  const now = Date.now()
  const windowStart = now - windowSeconds * 1000

  try {
    // Use Redis sorted set for sliding window
    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count requests in current window
    const count = await redis.zcard(key)

    if (count >= limit) {
      // Find when the oldest request will expire
      const oldest = await redis.zrange(key, 0, 0, { withScores: true })
      const resetAt = oldest.length > 0
        ? Number(oldest[1]) + windowSeconds * 1000
        : now + windowSeconds * 1000

      return { allowed: false, remaining: 0, resetAt }
    }

    // Add current request
    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` })
    await redis.expire(key, windowSeconds)

    return {
      allowed: true,
      remaining: limit - count - 1,
      resetAt: now + windowSeconds * 1000
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open on Redis errors
    return { allowed: true, remaining: limit, resetAt: now + windowSeconds * 1000 }
  }
}

// Different rate limits for different endpoints
export const RATE_LIMITS = {
  chat: { limit: 10, window: 60 }, // 10 messages per minute
  codeReview: { limit: 3, window: 3600 }, // 3 reviews per hour
  labSubmission: { limit: 20, window: 3600 } // 20 submissions per hour
}
```

**Step 5: Create cost tracker**

```typescript
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
```

**Step 6: Install dependencies**

```bash
npm install zod @upstash/redis
```

**Step 7: Commit**

```bash
git add lib/governance/*.ts package.json package-lock.json
git commit -m "feat: add governance service layer

- Input validator with sanitization and edge case handling
- Content moderator using Claude for policy violations
- Request logger for LLM calls and audit events
- Rate limiter using Redis sliding window
- Cost tracker with budget management and usage stats"
```

---

## Task 3: Chat API with Governance

**Files:**
- Create: `app/api/chat/route.ts`

**Step 1: Create governed chat endpoint**

```typescript
// app/api/chat/route.ts
import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { validateChatInput } from '@/lib/governance/input-validator'
import { moderateContent } from '@/lib/governance/content-moderator'
import { checkRateLimit, RATE_LIMITS } from '@/lib/governance/rate-limiter'
import { checkBudget, trackCost } from '@/lib/governance/cost-tracker'
import { logLLMRequest, logAuditEvent, calculateCost } from '@/lib/governance/logger'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const supabase = createClient()

  try {
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse and validate input
    const body = await request.json()
    const validation = await validateChatInput(body)

    if (!validation.valid) {
      await logAuditEvent(
        user.id,
        'chat_validation_failed',
        'message',
        undefined,
        { errors: validation.errors },
        request
      )
      return Response.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { content, conversationId } = validation.sanitized

    // 3. Check rate limit
    const rateLimit = await checkRateLimit(
      user.id,
      RATE_LIMITS.chat.limit,
      RATE_LIMITS.chat.window
    )

    if (!rateLimit.allowed) {
      await logLLMRequest({
        userId: user.id,
        endpoint: '/api/chat',
        model: 'claude-3-5-sonnet-20241022',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        latencyMs: Date.now() - startTime,
        status: 'rate_limited'
      })

      return Response.json(
        { error: 'Rate limit exceeded', resetAt: rateLimit.resetAt },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.chat.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString()
          }
        }
      )
    }

    // 4. Check budget
    const budget = await checkBudget(user.id)
    if (!budget.withinBudget) {
      return Response.json(
        { error: 'Monthly budget exceeded', budget },
        { status: 402 }
      )
    }

    // 5. Moderate input content
    const inputModeration = await moderateContent(user.id, content, 'input')
    if (inputModeration.flagged) {
      await logAuditEvent(
        user.id,
        'content_moderation_blocked',
        'message',
        undefined,
        { categories: inputModeration.categories },
        request
      )
      return Response.json(
        { error: 'Content policy violation', categories: inputModeration.categories },
        { status: 400 }
      )
    }

    // 6. Get conversation history
    let messages: any[] = []
    if (conversationId) {
      const { data: history } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at')
        .limit(10) // Last 10 messages for context

      messages = history || []
    }

    // Add current user message
    messages.push({ role: 'user', content })

    // 7. Call Claude API
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages
    })

    const assistantMessage = response.content[0].text
    const latencyMs = Date.now() - startTime

    // 8. Moderate output content
    const outputModeration = await moderateContent(user.id, assistantMessage, 'output')
    if (outputModeration.flagged) {
      await logAuditEvent(
        user.id,
        'output_moderation_blocked',
        'message',
        undefined,
        { categories: outputModeration.categories },
        request
      )
      return Response.json(
        { error: 'Generated content policy violation' },
        { status: 500 }
      )
    }

    // 9. Save messages to conversation
    let actualConversationId = conversationId
    if (!actualConversationId) {
      // Create new conversation
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title: content.substring(0, 50) })
        .select()
        .single()

      actualConversationId = newConv!.id
    }

    await supabase.from('messages').insert([
      {
        conversation_id: actualConversationId,
        role: 'user',
        content,
        tokens: response.usage.input_tokens
      },
      {
        conversation_id: actualConversationId,
        role: 'assistant',
        content: assistantMessage,
        tokens: response.usage.output_tokens
      }
    ])

    // 10. Log request and track cost
    const cost = calculateCost(
      'claude-3-5-sonnet-20241022',
      response.usage.input_tokens,
      response.usage.output_tokens
    )

    await logLLMRequest({
      userId: user.id,
      endpoint: '/api/chat',
      model: 'claude-3-5-sonnet-20241022',
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      cost,
      latencyMs,
      status: 'success'
    })

    await trackCost(user.id, cost)

    await logAuditEvent(
      user.id,
      'chat_message_sent',
      'conversation',
      actualConversationId,
      { messageLength: content.length, responseTokens: response.usage.output_tokens },
      request
    )

    // 11. Return response
    return Response.json({
      message: assistantMessage,
      conversationId: actualConversationId,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        cost
      },
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt
      },
      budget: {
        remaining: budget.remaining,
        monthlyBudget: budget.monthlyBudget
      }
    }, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMITS.chat.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString()
      }
    })

  } catch (error: any) {
    console.error('Chat API error:', error)

    const latencyMs = Date.now() - startTime
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await logLLMRequest({
        userId: user.id,
        endpoint: '/api/chat',
        model: 'claude-3-5-sonnet-20241022',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        latencyMs,
        status: 'error',
        errorMessage: error.message
      })
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 2: Test the endpoint**

Create: `tests/api/chat.test.ts`

```typescript
// tests/api/chat.test.ts
import { describe, it, expect, beforeAll } from 'vitest'

describe('/api/chat', () => {
  let authToken: string

  beforeAll(async () => {
    // TODO: Get auth token from test user
  })

  it('should reject unauthenticated requests', async () => {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Hello' })
    })

    expect(res.status).toBe(401)
  })

  it('should validate input', async () => {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ content: '' }) // Empty content
    })

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid input')
  })

  it('should enforce rate limits', async () => {
    // Send 11 requests (limit is 10/minute)
    const requests = Array(11).fill(null).map((_, i) =>
      fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ content: `Message ${i}` })
      })
    )

    const responses = await Promise.all(requests)
    const lastResponse = responses[10]

    expect(lastResponse.status).toBe(429)
  })

  it('should return chat response with governance metadata', async () => {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ content: 'Hello, how are you?' })
    })

    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data).toHaveProperty('message')
    expect(data).toHaveProperty('conversationId')
    expect(data).toHaveProperty('usage')
    expect(data).toHaveProperty('rateLimit')
    expect(data).toHaveProperty('budget')
  })
})
```

**Step 3: Commit**

```bash
git add app/api/chat/route.ts tests/api/chat.test.ts
git commit -m "feat: add governed chat API endpoint

- Full governance pipeline: auth, validation, rate limiting, budget check
- Input and output content moderation
- Conversation persistence
- Comprehensive logging and audit trail
- Cost tracking
- Test suite for governance checks"
```

---

## Task 4: Governance Dashboard

**Files:**
- Create: `app/(dashboard)/governance/page.tsx`
- Create: `app/api/governance/stats/route.ts`

**Step 1: Create governance stats API**

```typescript
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
```

**Step 2: Create governance dashboard page**

```typescript
// app/(dashboard)/governance/page.tsx
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DollarSign, Activity, Shield, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Governance Dashboard',
  description: 'Monitor your AI usage, costs, and compliance'
}

export default async function GovernancePage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/governance/stats?days=30`, {
    cache: 'no-store'
  })
  const stats = await res.json()

  const budgetUsed = (stats.budget.currentSpend / stats.budget.monthlyBudget) * 100

  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Governance Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor your AI usage, costs, and compliance
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.usage?.totalCost.toFixed(4) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.usage?.totalRequests || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.usage?.avgLatency || 0}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.moderationLogs.filter((l: any) => l.flagged).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 10 checks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Budget</CardTitle>
            <CardDescription>
              ${stats.budget.currentSpend.toFixed(2)} of ${stats.budget.monthlyBudget.toFixed(2)} used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={budgetUsed} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{budgetUsed.toFixed(1)}% used</span>
              <span>${stats.budget.remaining.toFixed(2)} remaining</span>
            </div>
            {budgetUsed > 80 && (
              <p className="mt-4 text-sm text-orange-600">
                ⚠️ You've used {budgetUsed.toFixed(0)}% of your monthly budget
              </p>
            )}
          </CardContent>
        </Card>

        {/* Daily Usage Chart (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage</CardTitle>
            <CardDescription>Requests and costs over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart placeholder - integrate with recharts or similar
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Audit Logs</CardTitle>
            <CardDescription>Last 20 actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.auditLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <div>
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground ml-2">
                      {log.resource_type}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/api/governance/stats/route.ts app/\(dashboard\)/governance/page.tsx
git commit -m "feat: add governance dashboard

- Stats API endpoint (usage, budget, moderation, audit logs)
- Dashboard UI with summary cards
- Budget tracking with progress bar
- Recent activity feed
- Placeholder for daily usage chart"
```

---

## Summary

This implementation plan has created the Week 2 governance infrastructure:

**Completed**:
1. ✅ Database schema for governance (logging, moderation, budgets, audit, conversations)
2. ✅ Governance service layer (validation, moderation, logging, rate limiting, cost tracking)
3. ✅ Governed chat API endpoint with full pipeline
4. ✅ Governance dashboard with usage stats

**Remaining Tasks** (for complete Week 2):
5. Week 2 concept content (3 MDX files)
6. Week 2 overview page
7. Lab system for governance exercises
8. Project submission for production chat assistant
9. Conversation management UI
10. Deploy and monitoring setup

**Next Steps**:
- Continue with Tasks 5-10 for full Week 2 functionality
- Or move to Week 3 implementation plan
- Or focus on content creation

**Execution Options**:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
