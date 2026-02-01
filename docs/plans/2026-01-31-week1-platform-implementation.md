# Week 1 Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build platform features to deliver Week 1 curriculum (Foundations + Visual Builder Introduction)

**Architecture:** Extend existing Next.js platform with Week 1 content delivery, visual builder integration, lab system, and dual-implementation project submission. Content stored in MDX initially (migrate to CMS later). Progress tracking integrated with existing user system.

**Tech Stack:** Next.js 14, Supabase (PostgreSQL + Auth), MDX (content), Claude API, Vercel, Flowise (embedded visual builder)

---

## Task 1: Database Schema for Week 1

**Files:**
- Create: `supabase/migrations/20260131_week1_schema.sql`
- Reference: Existing user and progress tables

**Step 1: Write migration for Week 1 tables**

```sql
-- Week 1 content structure
CREATE TABLE IF NOT EXISTS public.curriculum_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INTEGER NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    objectives JSONB NOT NULL, -- array of learning objectives
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Concepts within weeks
CREATE TABLE IF NOT EXISTS public.concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID REFERENCES public.curriculum_weeks(id),
    order_index INTEGER NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    content_path VARCHAR(500) NOT NULL, -- path to MDX file
    estimated_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(week_id, order_index)
);

-- Labs
CREATE TABLE IF NOT EXISTS public.labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID REFERENCES public.curriculum_weeks(id),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    exercises JSONB NOT NULL, -- array of exercise descriptions
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lab submissions
CREATE TABLE IF NOT EXISTS public.lab_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    lab_id UUID REFERENCES public.labs(id),
    exercise_number INTEGER NOT NULL,
    submission_data JSONB NOT NULL, -- varies by exercise type
    completed BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lab_id, exercise_number)
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID REFERENCES public.curriculum_weeks(id),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    requirements JSONB NOT NULL, -- array of requirements
    success_criteria JSONB NOT NULL,
    estimated_hours INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project submissions
CREATE TABLE IF NOT EXISTS public.project_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    project_id UUID REFERENCES public.projects(id),
    github_url VARCHAR(500),
    deployed_url VARCHAR(500),
    writeup_content TEXT, -- for comparison writeup
    status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, reviewed
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User progress tracking for Week 1
CREATE TABLE IF NOT EXISTS public.user_week_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    week_id UUID REFERENCES public.curriculum_weeks(id),
    concepts_completed INTEGER DEFAULT 0,
    concepts_total INTEGER NOT NULL,
    lab_completed BOOLEAN DEFAULT false,
    project_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE(user_id, week_id)
);

-- Enable RLS
ALTER TABLE public.curriculum_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_week_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for curriculum, user-owned for submissions)
CREATE POLICY "Anyone can read curriculum weeks" ON public.curriculum_weeks
    FOR SELECT USING (active = true);

CREATE POLICY "Anyone can read concepts" ON public.concepts
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read labs" ON public.labs
    FOR SELECT USING (true);

CREATE POLICY "Users can read their own lab submissions" ON public.lab_submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lab submissions" ON public.lab_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab submissions" ON public.lab_submissions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read projects" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "Users can read their own project submissions" ON public.project_submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project submissions" ON public.project_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project submissions" ON public.project_submissions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own week progress" ON public.user_week_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own week progress" ON public.user_week_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own week progress" ON public.user_week_progress
    FOR UPDATE USING (auth.uid() = user_id);
```

**Step 2: Run migration**

```bash
cd /path/to/project
npx supabase migration up
```

Expected: Migration applied successfully

**Step 3: Seed Week 1 data**

Create: `supabase/seed/week1_data.sql`

```sql
-- Insert Week 1
INSERT INTO public.curriculum_weeks (week_number, title, description, objectives)
VALUES (
    1,
    'Foundations + Visual Builder Introduction',
    'Understand LLM fundamentals, master API integration, experience visual agent building, and build production-ready chat assistant',
    '["Understand LLM fundamentals and prompt engineering", "Master API integration patterns", "Experience visual agent building before coding", "Build production-ready chat assistant"]'::jsonb
);

-- Get week 1 ID for foreign keys
DO $$
DECLARE
    week1_id UUID;
    lab1_id UUID;
    project1_id UUID;
BEGIN
    SELECT id INTO week1_id FROM public.curriculum_weeks WHERE week_number = 1;

    -- Insert Concepts
    INSERT INTO public.concepts (week_id, order_index, slug, title, content_path, estimated_minutes)
    VALUES
        (week1_id, 1, 'llm-fundamentals', 'LLM Fundamentals', 'content/week1/llm-fundamentals.mdx', 45),
        (week1_id, 2, 'prompt-engineering', 'Prompt Engineering Mastery', 'content/week1/prompt-engineering.mdx', 60),
        (week1_id, 3, 'api-integration', 'API Integration Patterns', 'content/week1/api-integration.mdx', 45),
        (week1_id, 4, 'visual-builders', 'Visual Agent Builders', 'content/week1/visual-builders.mdx', 30);

    -- Insert Lab
    INSERT INTO public.labs (week_id, slug, title, description, exercises)
    VALUES (
        week1_id,
        'visual-to-code',
        'Visual Builder → Code Translation',
        'Build a Q&A chatbot visually, then rebuild in code to understand abstraction layers',
        '[
            {"number": 1, "title": "Build Q&A chatbot in Flowise", "type": "visual"},
            {"number": 2, "title": "Understand the flow", "type": "analysis"},
            {"number": 3, "title": "Export to code", "type": "export"},
            {"number": 4, "title": "Rebuild from scratch in code", "type": "coding"},
            {"number": 5, "title": "Compare approaches", "type": "reflection"}
        ]'::jsonb
    ) RETURNING id INTO lab1_id;

    -- Insert Project
    INSERT INTO public.projects (week_id, slug, title, description, requirements, success_criteria, estimated_hours)
    VALUES (
        week1_id,
        'chat-assistant-dual',
        'Chat Assistant (Dual Implementation)',
        'Build a conversational chat assistant with both visual and code implementations',
        '[
            "Build visual prototype in Flowise/LangFlow",
            "Build production code version in TypeScript/Python",
            "Implement conversation history management",
            "Add basic guardrails (input validation, content filtering)",
            "Basic logging of all LLM calls",
            "Write comparison writeup",
            "Deploy application with UI"
        ]'::jsonb,
        '[
            "Multi-turn conversations work",
            "Context window managed properly",
            "Basic guardrails prevent misuse",
            "Both versions functionally equivalent",
            "Deployed and accessible"
        ]'::jsonb,
        5
    ) RETURNING id INTO project1_id;
END $$;
```

**Step 4: Run seed**

```bash
psql $DATABASE_URL < supabase/seed/week1_data.sql
```

Expected: Week 1 data inserted successfully

**Step 5: Commit**

```bash
git add supabase/migrations/20260131_week1_schema.sql supabase/seed/week1_data.sql
git commit -m "feat: add Week 1 database schema and seed data

- Add curriculum_weeks, concepts, labs, projects tables
- Add lab_submissions, project_submissions tables
- Add user_week_progress tracking
- Enable RLS with appropriate policies
- Seed Week 1 curriculum data"
```

---

## Task 2: TypeScript Types for Week 1

**Files:**
- Create: `lib/types/curriculum.ts`

**Step 1: Define Week 1 types**

```typescript
// lib/types/curriculum.ts
export interface CurriculumWeek {
  id: string
  week_number: number
  title: string
  description: string | null
  objectives: string[]
  active: boolean
  created_at: string
}

export interface Concept {
  id: string
  week_id: string
  order_index: number
  slug: string
  title: string
  content_path: string
  estimated_minutes: number | null
  created_at: string
}

export interface Lab {
  id: string
  week_id: string
  slug: string
  title: string
  description: string | null
  exercises: LabExercise[]
  created_at: string
}

export interface LabExercise {
  number: number
  title: string
  type: 'visual' | 'analysis' | 'export' | 'coding' | 'reflection'
}

export interface LabSubmission {
  id: string
  user_id: string
  lab_id: string
  exercise_number: number
  submission_data: Record<string, any>
  completed: boolean
  submitted_at: string
}

export interface Project {
  id: string
  week_id: string
  slug: string
  title: string
  description: string | null
  requirements: string[]
  success_criteria: string[]
  estimated_hours: number | null
  created_at: string
}

export interface ProjectSubmission {
  id: string
  user_id: string
  project_id: string
  github_url: string | null
  deployed_url: string | null
  writeup_content: string | null
  status: 'draft' | 'submitted' | 'reviewed'
  submitted_at: string | null
  created_at: string
  updated_at: string
}

export interface UserWeekProgress {
  id: string
  user_id: string
  week_id: string
  concepts_completed: number
  concepts_total: number
  lab_completed: boolean
  project_completed: boolean
  started_at: string
  completed_at: string | null
}
```

**Step 2: Export from index**

Modify: `lib/types/index.ts`

```typescript
export * from './curriculum'
// ... existing exports
```

**Step 3: Commit**

```bash
git add lib/types/curriculum.ts lib/types/index.ts
git commit -m "feat: add TypeScript types for Week 1 curriculum"
```

---

## Task 3: Week 1 Content Files (MDX)

**Files:**
- Create: `content/week1/llm-fundamentals.mdx`
- Create: `content/week1/prompt-engineering.mdx`
- Create: `content/week1/api-integration.mdx`
- Create: `content/week1/visual-builders.mdx`

**Step 1: Create LLM Fundamentals concept**

```mdx
# LLM Fundamentals

Learn how Large Language Models work and how to choose the right model for your use case.

## How LLMs Work

Large Language Models (LLMs) like Claude and GPT-4 are neural networks trained on vast amounts of text data. They work by:

1. **Transformers Architecture**: Using attention mechanisms to understand context
2. **Token Processing**: Breaking text into tokens (subwords)
3. **Next Token Prediction**: Predicting the most likely next token given context

### Key Concepts

**Context Windows**: The amount of text an LLM can "remember" at once.
- Claude 3.5 Sonnet: 200K tokens (~150K words)
- GPT-4 Turbo: 128K tokens
- Practical consideration: Cost increases with context size

**Tokens**: The fundamental unit LLMs process.
- Rule of thumb: 1 token ≈ 0.75 words (English)
- Example: "Hello world!" = ~3 tokens
- Why it matters: Pricing is per token (input + output)

## Model Selection

Choosing the right model involves balancing three factors:

| Model | Cost | Latency | Quality | Best For |
|-------|------|---------|---------|----------|
| GPT-4 | High | Slow | Excellent | Complex reasoning, critical tasks |
| Claude 3.5 Sonnet | Medium | Fast | Excellent | Balanced performance, coding |
| GPT-3.5 Turbo | Low | Fast | Good | Simple tasks, high volume |
| Claude 3 Haiku | Low | Very Fast | Good | Fast responses, classification |

### Cost/Latency/Quality Tradeoffs

**When to prioritize cost**: High-volume, simple tasks (classification, extraction)
**When to prioritize latency**: Real-time user interactions, chat applications
**When to prioritize quality**: Complex reasoning, code generation, critical decisions

## Token Economics

Understanding token costs is critical for production AI systems:

**Example**: Chat application with 1000 daily users
- Average conversation: 10 messages
- Average message: 100 tokens input, 200 tokens output
- Total daily: 1000 users × 10 msgs × 300 tokens = 3M tokens/day
- Monthly cost (Claude Sonnet): 3M × 30 × $0.015/1K = $1,350/month

**Optimization strategies**:
1. Use cheaper models for simple tasks
2. Implement caching for common queries
3. Summarize long conversations to reduce context
4. Stream responses to improve perceived latency

## Context Management

Effective context window management:

1. **Prioritize recent messages**: Keep last N messages in full context
2. **Summarize old context**: Compress older messages into summary
3. **Remove irrelevant content**: Strip formatting, redundant info
4. **Smart truncation**: Cut from middle, keep beginning and end

```typescript
// Example: Context window management
function manageContext(messages: Message[], maxTokens: number) {
  if (countTokens(messages) <= maxTokens) {
    return messages // Fits in window
  }

  // Keep system prompt + last N messages
  const systemPrompt = messages[0]
  const recentMessages = messages.slice(-5)

  // Summarize middle messages
  const middleMessages = messages.slice(1, -5)
  const summary = summarizeMessages(middleMessages)

  return [systemPrompt, summary, ...recentMessages]
}
```

## Practical Exercises

1. **Token Counting**: Use an LLM API to count tokens in different types of text
2. **Cost Calculation**: Estimate costs for a real application scenario
3. **Model Comparison**: Same prompt to different models, compare quality/speed/cost

## Further Reading

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) - Original Transformers paper
- [Claude Model Documentation](https://docs.anthropic.com/claude/docs)
- [OpenAI Tokenizer](https://platform.openai.com/tokenizer)
```

**Step 2: Create Prompt Engineering concept**

```mdx
# Prompt Engineering Mastery

Master the art and science of crafting effective prompts for LLMs.

## Prompting Fundamentals

A well-crafted prompt is the difference between mediocre and excellent LLM outputs.

### Anatomy of a Prompt

```
[System Prompt] - Sets role, behavior, constraints
[Context] - Relevant background information
[Instruction] - What you want the LLM to do
[Examples] - Few-shot demonstrations (optional)
[Output Format] - How to structure the response
```

## Zero-Shot Prompting

Getting results without examples.

**Basic pattern**:
```
You are an expert [role].
[Context about the task]
[Clear instruction]
Respond in [format].
```

**Example**:
```
You are an expert technical writer.
I need to explain API rate limiting to junior developers.
Write a clear, concise explanation with a practical example.
Use simple language and include a code snippet.
```

## Few-Shot Prompting

Provide examples to guide the model's behavior.

**Pattern**:
```
Here are examples of the task:

Example 1:
Input: [input]
Output: [output]

Example 2:
Input: [input]
Output: [output]

Now do the same for:
Input: [your actual input]
```

**When to use**: Complex formatting, specific style, edge cases to avoid

## Chain-of-Thought (CoT) Prompting

Ask the model to show its reasoning process.

**Simple CoT**:
```
Question: [complex problem]
Let's think step by step:
```

**Structured CoT**:
```
Question: [problem]

Please solve this by:
1. Understanding the problem
2. Breaking it into sub-problems
3. Solving each sub-problem
4. Combining results
5. Verifying the answer
```

**When to use**: Mathematical reasoning, multi-step problems, debugging

## System Prompts and Personas

System prompts set the LLM's behavior for the entire conversation.

**Effective system prompt structure**:
```
You are [role with expertise].

Your responsibilities:
- [Responsibility 1]
- [Responsibility 2]

Guidelines:
- [Guideline 1]
- [Guideline 2]

Constraints:
- [What NOT to do]
- [Boundaries]

Output format:
[How to structure responses]
```

**Example - Code Review Agent**:
```
You are an expert code reviewer with 10 years of experience in production systems.

Your responsibilities:
- Review code for bugs, security issues, and performance problems
- Suggest specific improvements with code examples
- Explain the reasoning behind each suggestion

Guidelines:
- Be constructive and educational
- Prioritize security and correctness over style
- Provide actionable feedback

Constraints:
- Never approve code with security vulnerabilities
- Don't nitpick minor style issues
- Don't suggest changes without explaining why

Output format:
- Categorize findings by severity (Critical, High, Medium, Low)
- Include line numbers and specific code snippets
- Provide corrected code examples
```

## Output Formatting

### JSON Mode

Request structured output in JSON format.

**Pattern**:
```
Extract information and respond in JSON format:
{
  "field1": "description",
  "field2": "description"
}
```

**Example**:
```
Extract product information from this description and respond in JSON:

{
  "name": "product name",
  "price": numeric value,
  "features": ["feature 1", "feature 2"],
  "category": "category name"
}

Description: "The UltraWidget Pro costs $99 and includes wireless connectivity,
cloud sync, and a 2-year warranty. It's in the Smart Home category."
```

### Structured Extraction

Guide the model to extract specific information.

```
From the following text, extract:
- Company name
- Revenue (if mentioned)
- Number of employees (if mentioned)
- Industry

Text: [input text]

Format:
Company: [name]
Revenue: [amount or "Not mentioned"]
Employees: [number or "Not mentioned"]
Industry: [industry]
```

## Common Failure Modes and Fixes

### Vague Outputs

❌ **Problem**: "Write about AI"
✅ **Fix**: "Write a 300-word explanation of transformers architecture for software engineers, including a code example"

### Inconsistent Formatting

❌ **Problem**: Format changes between responses
✅ **Fix**: Include explicit formatting instructions + example in system prompt

### Hallucinations

❌ **Problem**: Model makes up facts
✅ **Fix**: "Only use information from the provided context. If unsure, say 'I don't know'"

### Off-Topic Responses

❌ **Problem**: Model goes beyond scope
✅ **Fix**: Add constraints in system prompt: "Stay focused on [specific topic]. Do not discuss [off-topic areas]"

## Advanced Techniques

### Prompt Chaining

Break complex tasks into multiple prompts.

```
Prompt 1: Extract key points from article
↓
Prompt 2: Organize points into outline
↓
Prompt 3: Write summary from outline
```

### Self-Consistency

Ask for multiple attempts, choose best/most common answer.

```
Solve this problem 3 different ways, then pick the most reliable answer.
```

### Role Prompting

Assign specific expert roles for better responses.

```
As a [specific expert], explain [topic] considering [constraints]
```

## Practical Exercises

1. **Zero to Few-Shot**: Start with zero-shot, add examples until quality improves
2. **CoT Practice**: Solve a complex problem with and without CoT, compare results
3. **Format Precision**: Extract structured data from unstructured text
4. **Persona Testing**: Same question to different personas, compare outputs

## Prompt Template Library

Build reusable templates for common tasks:

```typescript
const TEMPLATES = {
  codeReview: `Review this code for security and performance issues...`,
  summarization: `Summarize the following text in [N] bullet points...`,
  extraction: `Extract [specific fields] from this text and return as JSON...`,
  classification: `Classify this text into one of [categories]...`
}
```

## Further Reading

- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [OpenAI Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
```

**Step 3: Create API Integration concept**

```mdx
# API Integration Patterns

Learn how to integrate LLM APIs into production applications with proper error handling, streaming, and cost controls.

## REST API Basics

All major LLM providers expose REST APIs for text generation.

### Basic Request Structure

```typescript
// Anthropic Claude API example
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

async function generateText(prompt: string) {
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: prompt }
    ]
  })

  return response.content[0].text
}
```

### Request Parameters

| Parameter | Purpose | Typical Values |
|-----------|---------|----------------|
| `model` | Which model to use | 'claude-3-5-sonnet-20241022' |
| `max_tokens` | Maximum response length | 1024-4096 for most tasks |
| `temperature` | Randomness (0-1) | 0.7 for creative, 0.2 for factual |
| `messages` | Conversation history | Array of {role, content} |
| `system` | System prompt | Role and behavior instructions |

## Streaming Responses

For better UX, stream responses token-by-token instead of waiting for the full response.

### Server-Sent Events (SSE)

```typescript
// Backend: Stream from Claude API
async function streamChatResponse(messages: Message[]) {
  const stream = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages,
    stream: true
  })

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta') {
      yield chunk.delta.text
    }
  }
}

// API Route (Next.js)
export async function POST(req: Request) {
  const { messages } = await req.json()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for await (const text of streamChatResponse(messages)) {
        controller.enqueue(encoder.encode(text))
      }
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked'
    }
  })
}
```

### Frontend: Consuming SSE

```typescript
// React component
async function sendMessage(message: string) {
  setLoading(true)
  setResponse('')

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [...history, { role: 'user', content: message }] })
  })

  const reader = res.body?.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader!.read()
    if (done) break

    const text = decoder.decode(value)
    setResponse(prev => prev + text)
  }

  setLoading(false)
}
```

## Error Handling and Retries

LLM APIs can fail for various reasons. Implement robust error handling.

### Common Error Types

1. **Rate Limiting (429)**: Too many requests
2. **Context Length Exceeded (400)**: Input too long
3. **Authentication (401)**: Invalid API key
4. **Service Unavailable (503)**: API temporarily down
5. **Timeout**: Request took too long

### Retry Logic with Exponential Backoff

```typescript
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // Don't retry on client errors (400, 401, 403)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error
      }

      // Calculate delay with exponential backoff + jitter
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Usage
const response = await callWithRetry(() =>
  client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  })
)
```

### Graceful Degradation

```typescript
async function generateWithFallback(prompt: string): Promise<string> {
  try {
    // Try primary model (GPT-4)
    return await callGPT4(prompt)
  } catch (error) {
    console.error('GPT-4 failed, falling back to Claude', error)
    try {
      // Fallback to Claude
      return await callClaude(prompt)
    } catch (error2) {
      console.error('Claude failed, falling back to GPT-3.5', error2)
      // Final fallback to cheaper model
      return await callGPT35(prompt)
    }
  }
}
```

## Rate Limiting

Prevent API abuse and control costs with rate limiting.

### Redis-Based Rate Limiter

```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export async function checkRateLimit(
  userId: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate_limit:${userId}`
  const now = Date.now()
  const windowStart = now - windowSeconds * 1000

  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart)

  // Count requests in current window
  const count = await redis.zcard(key)

  if (count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  // Add current request
  await redis.zadd(key, { score: now, member: `${now}` })
  await redis.expire(key, windowSeconds)

  return { allowed: true, remaining: limit - count - 1 }
}

// API route usage
export async function POST(req: Request) {
  const session = await getSession()
  const { allowed, remaining } = await checkRateLimit(session.user.id)

  if (!allowed) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: { 'X-RateLimit-Remaining': '0' }
    })
  }

  // Process request...
  return new Response(result, {
    headers: { 'X-RateLimit-Remaining': remaining.toString() }
  })
}
```

## Cost Controls

### Budget Tracking

```typescript
// Track costs per user
async function trackCost(userId: string, tokens: number, model: string) {
  const cost = calculateCost(tokens, model)

  await db.aiUsage.create({
    data: {
      userId,
      tokens,
      cost,
      model,
      timestamp: new Date()
    }
  })

  // Check if user exceeded budget
  const monthlyUsage = await db.aiUsage.aggregate({
    where: {
      userId,
      timestamp: { gte: startOfMonth(new Date()) }
    },
    _sum: { cost: true }
  })

  if (monthlyUsage._sum.cost! > USER_BUDGET_LIMIT) {
    throw new Error('Monthly budget exceeded')
  }
}

function calculateCost(tokens: number, model: string): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-3-5-sonnet': { input: 0.003, output: 0.015 }, // per 1K tokens
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
  }

  const { input, output } = pricing[model] || pricing['gpt-3.5-turbo']
  // Simplified: assume 50/50 input/output split
  return (tokens / 1000) * ((input + output) / 2)
}
```

## API Key Management

### Environment-Based Configuration

```typescript
// lib/ai-client.ts
import Anthropic from '@anthropic-ai/sdk'

export function getAIClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  return new Anthropic({ apiKey })
}

// Usage
const client = getAIClient()
```

### Security Best Practices

1. **Never expose API keys in client-side code**
   - Always call LLM APIs from server-side routes

2. **Use environment variables**
   ```bash
   # .env.local
   ANTHROPIC_API_KEY=sk-ant-...
   OPENAI_API_KEY=sk-...
   ```

3. **Rotate keys regularly**
   - Set reminders to rotate API keys every 90 days

4. **Monitor for leaked keys**
   - Use tools like `git-secrets` to prevent commits with keys
   - Enable GitHub secret scanning

## Practical Exercises

1. **Build a streaming chat**: Implement SSE streaming in a Next.js API route
2. **Add retry logic**: Wrap API calls with exponential backoff
3. **Implement rate limiting**: Use Redis to limit requests per user
4. **Cost dashboard**: Track and display API costs per user

## Code Example: Complete Integration

```typescript
// lib/ai-service.ts
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit } from './rate-limit'
import { trackCost } from './cost-tracking'
import { callWithRetry } from './retry'

export class AIService {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    })
  }

  async chat(userId: string, messages: Message[]): Promise<string> {
    // Check rate limit
    const { allowed } = await checkRateLimit(userId, 10, 60)
    if (!allowed) throw new Error('Rate limit exceeded')

    // Call API with retry
    const response = await callWithRetry(() =>
      this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages
      })
    )

    // Track cost
    await trackCost(
      userId,
      response.usage.input_tokens + response.usage.output_tokens,
      'claude-3-5-sonnet'
    )

    return response.content[0].text
  }

  async *streamChat(userId: string, messages: Message[]) {
    const { allowed } = await checkRateLimit(userId, 10, 60)
    if (!allowed) throw new Error('Rate limit exceeded')

    const stream = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages,
      stream: true
    })

    let totalTokens = 0
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        yield chunk.delta.text
      }
      if (chunk.type === 'message_delta') {
        totalTokens = chunk.usage.output_tokens
      }
    }

    await trackCost(userId, totalTokens, 'claude-3-5-sonnet')
  }
}
```

## Further Reading

- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Server-Sent Events Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
```

**Step 4: Create Visual Builders concept**

```mdx
# Visual Agent Builders

Understand visual agent building platforms, when to use them, and how they relate to code-based implementations.

## What Are Visual Agent Builders?

Visual agent builders are low-code/no-code platforms that let you create AI agents by connecting blocks in a graphical interface instead of writing code.

**Popular platforms**:
- **Flowise**: Open-source LangChain visual builder
- **LangFlow**: Drag-and-drop LangChain interface
- **n8n**: Workflow automation with AI nodes
- **Make/Zapier**: No-code automation with LLM integrations

## Why Visual Builders Matter

### Enterprise Context

In enterprise settings, you'll encounter visual builders because:

1. **Business users can prototype**: Product managers and domain experts can test ideas without engineering
2. **Faster iteration**: Visual changes are faster than code changes for simple flows
3. **Lower barrier to entry**: Non-technical team members can contribute
4. **Workflow automation**: Connect AI to existing business processes (Salesforce, Slack, databases)

### When to Use Visual vs Code

| Use Visual Builder | Use Code |
|-------------------|----------|
| Quick prototyping | Production systems |
| Business user demos | Complex logic |
| Standard workflows | Custom integrations |
| Proof of concept | Performance critical |
| Non-technical team | Version control needed |

## What Visual Tools Abstract Away

Visual builders handle common patterns so you don't have to code them:

### 1. Prompt Chain Management

**Visual**: Drag "Prompt" block → Connect to "LLM" block → Connect to next "Prompt"

**What it does in code**:
```typescript
const step1Result = await llm.chat(prompt1)
const step2Result = await llm.chat(prompt2 + step1Result)
return step2Result
```

### 2. Vector Store Integration

**Visual**: "Document Loader" → "Text Splitter" → "Embeddings" → "Vector Store"

**What it does in code**:
```typescript
const docs = await loadDocuments(filepath)
const chunks = await splitter.splitDocuments(docs)
const embeddings = await embedder.embedDocuments(chunks)
await vectorStore.addVectors(embeddings, chunks)
```

### 3. Retrieval-Augmented Generation (RAG)

**Visual**: "Vector Store Retriever" → "Prompt Template" → "LLM" → "Output"

**What it does in code**:
```typescript
const relevantDocs = await vectorStore.similaritySearch(query, 5)
const context = relevantDocs.map(d => d.content).join('\n')
const prompt = `Context: ${context}\n\nQuestion: ${query}`
const answer = await llm.chat(prompt)
return answer
```

## Hands-On: Flowise

Flowise is an open-source visual builder based on LangChain.

### Installation

```bash
npm install -g flowise
flowise start
```

Open http://localhost:3000

### Building a Q&A Chatbot

**Steps**:
1. **Add Chat Model node**: Choose "ChatAnthropic" or "ChatOpenAI"
2. **Add Prompt Template**: Define system prompt and user input
3. **Connect nodes**: Drag from output to input
4. **Test**: Use built-in chat interface
5. **Export**: Download as JSON or get code

### Example Flow

```
[User Input] → [Prompt Template] → [Chat Model] → [Output Parser] → [Response]
```

**Prompt Template**:
```
System: You are a helpful assistant.
User: {input}
```

### Exporting to Code

Flowise can export your flow as:
- **JSON**: Flow definition (portable, can import later)
- **API endpoint**: Deploy as REST API
- **Python code**: LangChain code equivalent

**Example export**:
```python
from langchain.chat_models import ChatAnthropic
from langchain.prompts import ChatPromptTemplate

chat_model = ChatAnthropic(model="claude-3-5-sonnet-20241022")
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    ("user", "{input}")
])

chain = prompt | chat_model
response = chain.invoke({"input": "Hello!"})
```

## From Visual to Code: Translation Guide

### Visual Flow Components

| Visual Block | Code Equivalent |
|--------------|-----------------|
| Chat Model | `new ChatAnthropic()` |
| Prompt Template | `ChatPromptTemplate.from_messages()` |
| Vector Store | `new PineconeStore()` |
| Document Loader | `new PDFLoader()` |
| Text Splitter | `new RecursiveCharacterTextSplitter()` |
| Embeddings | `new OpenAIEmbeddings()` |
| Output Parser | `new StringOutputParser()` |

### Example: Complete Translation

**Visual Flow**:
```
PDF Upload → Text Splitter → Embeddings → Pinecone → Retriever → Prompt → LLM → Answer
```

**Code Equivalent**:
```typescript
import { ChatAnthropic } from '@langchain/anthropic'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import { ChatPromptTemplate } from '@langchain/core/prompts'

// 1. Load PDF
const loader = new PDFLoader('document.pdf')
const docs = await loader.load()

// 2. Split text
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200
})
const chunks = await splitter.splitDocuments(docs)

// 3. Create embeddings and store
const embeddings = new OpenAIEmbeddings()
const vectorStore = await PineconeStore.fromDocuments(
  chunks,
  embeddings,
  { pineconeIndex: index }
)

// 4. Create retriever
const retriever = vectorStore.asRetriever(5)

// 5. Create prompt template
const prompt = ChatPromptTemplate.from_messages([
  ['system', 'Answer based on this context:\n{context}'],
  ['user', '{question}']
])

// 6. Create LLM
const llm = new ChatAnthropic({ model: 'claude-3-5-sonnet-20241022' })

// 7. Query
async function query(question: string) {
  const docs = await retriever.getRelevantDocuments(question)
  const context = docs.map(d => d.pageContent).join('\n')

  const response = await llm.invoke(
    await prompt.format({ context, question })
  )

  return response.content
}
```

## Advantages of Code Over Visual

Despite visual builders' convenience, code offers:

1. **Version control**: Git tracks every change
2. **Testing**: Unit tests, integration tests, CI/CD
3. **Debugging**: Step-through debugger, logging, profiling
4. **Performance**: Optimize bottlenecks, caching, parallelization
5. **Flexibility**: Custom logic, edge cases, integrations
6. **Type safety**: TypeScript catches errors at compile time
7. **Reusability**: Functions, modules, packages
8. **Team collaboration**: Code review, shared understanding

## Best Practices

### Use Visual Builders For:
✅ Prototyping new ideas quickly
✅ Demos for stakeholders
✅ Exploring LangChain capabilities
✅ Teaching non-engineers about AI flows
✅ Simple workflows (< 5 nodes)

### Use Code For:
✅ Production systems
✅ Complex business logic
✅ Performance-critical applications
✅ Team collaboration with code review
✅ Long-term maintenance
✅ Workflows with > 10 steps

## Practical Exercise

**Build then Rebuild**:
1. Build a Q&A chatbot in Flowise (10 minutes)
2. Export the flow
3. Rebuild the same functionality in TypeScript (30 minutes)
4. Compare: What was easier/harder in each approach?
5. Write a brief reflection on when you'd use each

**Reflection questions**:
- Which approach was faster for initial implementation?
- Which would be easier to debug if something broke?
- Which would be easier for a teammate to understand?
- Which would you choose for a production system? Why?

## Real-World Examples

### Example 1: Customer Support Bot

**Visual (Flowise)**:
- 2 hours to build
- Business team can update responses
- Limited to predefined flows
- Hard to add custom logic

**Code (TypeScript)**:
- 8 hours to build (first time)
- 2 hours to build (with templates)
- Engineers update logic
- Full control over behavior
- Easy to add A/B testing, analytics, custom integrations

### Example 2: Document Q&A

**Visual (Flowise)**:
- Perfect for proof-of-concept
- Shows feasibility to stakeholders
- Limited document format support
- No custom chunking strategies

**Code (TypeScript)**:
- Production-grade error handling
- Custom chunking for better results
- Monitoring and observability
- Cost tracking and optimization
- Version control for prompts

## Interview Talking Points

When asked about visual builders in interviews:

1. **Acknowledge their value**: "Visual builders are great for prototyping and enabling non-technical stakeholders"

2. **Know the tradeoffs**: "For production systems, I prefer code for testability, debugging, and team collaboration"

3. **Show you've used both**: "I've used Flowise to prototype a RAG system, then rebuilt it in TypeScript with custom optimizations"

4. **Enterprise perspective**: "In enterprise settings, visual builders help bridge the gap between technical and business teams"

## Further Reading

- [Flowise Documentation](https://docs.flowiseai.com/)
- [LangFlow GitHub](https://github.com/logspace-ai/langflow)
- [LangChain Expression Language (LCEL)](https://python.langchain.com/docs/expression_language/) - The code pattern visual builders generate
```

**Step 5: Commit content files**

```bash
mkdir -p content/week1
git add content/week1/*.mdx
git commit -m "feat: add Week 1 concept content (MDX files)

- LLM Fundamentals: How models work, token economics, context management
- Prompt Engineering: Zero-shot, few-shot, CoT, system prompts, output formatting
- API Integration: REST APIs, streaming, error handling, rate limiting, cost controls
- Visual Builders: Flowise introduction, when to use visual vs code, translation guide"
```

---

## Task 4: Week 1 Overview Page

**Files:**
- Create: `app/(dashboard)/curriculum/week-1/page.tsx`

**Step 1: Create Week 1 overview page**

```typescript
// app/(dashboard)/curriculum/week-1/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, Circle, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Week 1: Foundations + Visual Builder Introduction',
  description: 'Learn LLM fundamentals, prompt engineering, API integration, and visual agent builders'
}

export default async function Week1Page() {
  const supabase = createClient()

  // Fetch Week 1 data
  const { data: week } = await supabase
    .from('curriculum_weeks')
    .select('*')
    .eq('week_number', 1)
    .single()

  // Fetch concepts
  const { data: concepts } = await supabase
    .from('concepts')
    .select('*')
    .eq('week_id', week.id)
    .order('order_index')

  // Fetch lab
  const { data: lab } = await supabase
    .from('labs')
    .select('*')
    .eq('week_id', week.id)
    .single()

  // Fetch project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('week_id', week.id)
    .single()

  // Fetch user progress
  const { data: { user } } = await supabase.auth.getUser()
  const { data: progress } = await supabase
    .from('user_week_progress')
    .select('*')
    .eq('user_id', user?.id)
    .eq('week_id', week.id)
    .single()

  const objectives = week.objectives as string[]

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="text-sm text-muted-foreground mb-2">Week 1</div>
          <h1 className="text-4xl font-bold">{week.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {week.description}
          </p>
        </div>

        {/* Learning Objectives */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Learning Objectives</h2>
          <ul className="space-y-2">
            {objectives.map((objective, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Progress Overview */}
        {progress && (
          <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Progress</h2>
              <div className="text-sm text-muted-foreground">
                {progress.concepts_completed} / {progress.concepts_total} concepts
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {progress.concepts_completed === progress.concepts_total ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <span>Concepts</span>
              </div>
              <div className="flex items-center gap-2">
                {progress.lab_completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <span>Lab</span>
              </div>
              <div className="flex items-center gap-2">
                {progress.project_completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <span>Project</span>
              </div>
            </div>
          </div>
        )}

        {/* Concepts */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Concepts</h2>
          <div className="grid gap-4">
            {concepts?.map((concept, i) => (
              <Link
                key={concept.id}
                href={`/curriculum/week-1/concepts/${concept.slug}`}
                className="border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Concept {i + 1}
                    </div>
                    <h3 className="font-semibold text-lg">{concept.title}</h3>
                    {concept.estimated_minutes && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{concept.estimated_minutes} minutes</span>
                      </div>
                    )}
                  </div>
                  <Circle className="h-5 w-5 text-gray-400 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Lab */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Lab</h2>
          <Link
            href={`/curriculum/week-1/lab/${lab.slug}`}
            className="border rounded-lg p-6 hover:border-primary transition-colors block"
          >
            <h3 className="font-semibold text-xl mb-2">{lab.title}</h3>
            <p className="text-muted-foreground">{lab.description}</p>
            <div className="mt-4 text-sm text-muted-foreground">
              {(lab.exercises as any[]).length} exercises
            </div>
          </Link>
        </div>

        {/* Project */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Project</h2>
          <Link
            href={`/curriculum/week-1/project/${project.slug}`}
            className="border rounded-lg p-6 hover:border-primary transition-colors block bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-xl mb-2">{project.title}</h3>
                <p className="text-muted-foreground">{project.description}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{project.estimated_hours} hours</span>
                  </div>
                  <div>
                    {(project.requirements as string[]).length} requirements
                  </div>
                </div>
              </div>
              <Circle className="h-6 w-6 text-gray-400" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/(dashboard)/curriculum/week-1/page.tsx
git commit -m "feat: add Week 1 overview page

- Display week title, description, learning objectives
- Show user progress (concepts, lab, project completion)
- List all 4 concepts with links
- Show lab with exercise count
- Show project with requirements and time estimate"
```

---

## Task 5: Concept Viewing Page

**Files:**
- Create: `app/(dashboard)/curriculum/week-1/concepts/[slug]/page.tsx`
- Create: `lib/mdx.ts`

**Step 1: Install MDX dependencies**

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx rehype-highlight rehype-slug remark-gfm
```

**Step 2: Create MDX loader utility**

```typescript
// lib/mdx.ts
import fs from 'fs/promises'
import path from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

export async function loadMDXContent(contentPath: string) {
  const filePath = path.join(process.cwd(), contentPath)
  const source = await fs.readFile(filePath, 'utf-8')

  const { content, frontmatter } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight, rehypeSlug]
      }
    }
  })

  return { content, frontmatter }
}
```

**Step 3: Create concept page**

```typescript
// app/(dashboard)/curriculum/week-1/concepts/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { loadMDXContent } from '@/lib/mdx'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: concept } = await supabase
    .from('concepts')
    .select('title')
    .eq('slug', params.slug)
    .single()

  return {
    title: concept?.title || 'Concept',
    description: `Learn about ${concept?.title}`
  }
}

export default async function ConceptPage({ params }: Props) {
  const supabase = createClient()

  // Fetch concept
  const { data: concept } = await supabase
    .from('concepts')
    .select('*, week:curriculum_weeks(*)')
    .eq('slug', params.slug)
    .single()

  if (!concept) notFound()

  // Load MDX content
  const { content } = await loadMDXContent(concept.content_path)

  // Find next/previous concepts
  const { data: concepts } = await supabase
    .from('concepts')
    .select('slug, title, order_index')
    .eq('week_id', concept.week_id)
    .order('order_index')

  const currentIndex = concepts?.findIndex(c => c.slug === params.slug) ?? -1
  const previousConcept = currentIndex > 0 ? concepts[currentIndex - 1] : null
  const nextConcept = currentIndex < concepts.length - 1 ? concepts[currentIndex + 1] : null

  // Mark as completed
  async function markComplete() {
    'use server'
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Update or create progress
    const { data: progress } = await supabase
      .from('user_week_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_id', concept.week_id)
      .single()

    if (progress) {
      await supabase
        .from('user_week_progress')
        .update({ concepts_completed: progress.concepts_completed + 1 })
        .eq('id', progress.id)
    } else {
      await supabase
        .from('user_week_progress')
        .insert({
          user_id: user.id,
          week_id: concept.week_id,
          concepts_completed: 1,
          concepts_total: concepts.length
        })
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/curriculum/week-1" className="hover:text-foreground">
          Week 1
        </Link>
        <span>/</span>
        <span>Concepts</span>
        <span>/</span>
        <span className="text-foreground">{concept.title}</span>
      </div>

      {/* Content */}
      <article className="prose prose-lg dark:prose-invert max-w-none">
        {content}
      </article>

      {/* Complete Button */}
      <div className="mt-12 flex items-center justify-between border-t pt-8">
        <form action={markComplete}>
          <Button type="submit">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark as Complete
          </Button>
        </form>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          {previousConcept && (
            <Link href={`/curriculum/week-1/concepts/${previousConcept.slug}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            </Link>
          )}
          {nextConcept && (
            <Link href={`/curriculum/week-1/concepts/${nextConcept.slug}`}>
              <Button>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Add syntax highlighting CSS**

Modify: `app/globals.css`

```css
/* Add to the end of the file */
@import 'highlight.js/styles/github-dark.css';
```

**Step 5: Commit**

```bash
git add lib/mdx.ts app/(dashboard)/curriculum/week-1/concepts/\[slug\]/page.tsx app/globals.css package.json package-lock.json
git commit -m "feat: add concept viewing page with MDX support

- Create MDX loader with syntax highlighting
- Add concept page with breadcrumb navigation
- Add mark as complete functionality
- Add previous/next concept navigation
- Style code blocks with highlight.js"
```

---

## Summary

This implementation plan has created the foundation for Week 1:

**Completed**:
1. ✅ Database schema for Week 1 curriculum
2. ✅ TypeScript types for all Week 1 entities
3. ✅ Week 1 concept content (4 MDX files)
4. ✅ Week 1 overview page
5. ✅ Concept viewing page with MDX support

**Remaining Tasks** (for complete Week 1):
6. Lab system (visual builder integration + submissions)
7. Project submission system (GitHub URL, deployed URL, writeup)
8. Progress tracking UI
9. Week 1 navigation in main dashboard
10. Visual builder sandbox (Flowise embed)

**Next Steps**:
- Continue with Tasks 6-10 for full Week 1 functionality
- Or move to content creation for other weeks
- Or build infrastructure (CMS, AI microservice, vector DB)

**Execution Options**:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
