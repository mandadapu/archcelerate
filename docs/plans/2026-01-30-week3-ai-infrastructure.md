# Week 3: AI Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build reusable AI service layer with streaming, context management, and chat UI components that all AI features will use

**Architecture:** Centralized AIService abstraction, streaming chat interface, context assembly system, prompt template management, Redis caching

**Tech Stack:** Claude API, Vercel AI SDK, Redis (Upstash), Server-Sent Events, TypeScript

**Prerequisites:** Week 1 and Week 2 must be complete

---

## Task 1: Set Up Redis for Caching

**Files:**
- Create: `.env.local` (update)
- Install: Upstash Redis SDK

**Step 1: Create Upstash Redis database**

Manual action:
1. Go to https://upstash.com
2. Create account / log in
3. Create new Redis database: "aicelerate-cache"
4. Note down UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

**Step 2: Install Redis client**

Run:
```bash
npm install @upstash/redis
```

**Step 3: Add Redis credentials to environment**

Update `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

**Step 4: Create Redis client utility**

Create `lib/redis/client.ts`:
```typescript
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache utilities
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key)
    return cached as T | null
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export async function setCached(
  key: string,
  value: any,
  expirationSeconds: number = 3600
): Promise<void> {
  try {
    await redis.setex(key, expirationSeconds, JSON.stringify(value))
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

export async function deleteCached(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Redis delete error:', error)
  }
}
```

**Step 5: Test Redis connection**

Create `lib/redis/__test__.ts` (temporary test file):
```typescript
import { redis } from './client'

async function testRedis() {
  await redis.set('test-key', 'Hello Redis!')
  const value = await redis.get('test-key')
  console.log('Redis test:', value)
  await redis.del('test-key')
}

testRedis()
```

Run test:
```bash
npx tsx lib/redis/__test__.ts
```

Expected: "Redis test: Hello Redis!" logged

Delete test file after verification.

**Step 6: Commit**

```bash
git add .
git commit -m "feat: set up Redis caching with Upstash"
```

---

## Task 2: Refactor AI Client into Service Layer

**Files:**
- Create: `lib/ai/service.ts`
- Create: `lib/ai/types.ts`
- Modify: `lib/ai/client.ts`

**Step 1: Create AI types**

Create `lib/ai/types.ts`:
```typescript
export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export interface ChatOptions {
  systemPrompt: string
  messages: Message[]
  context?: Record<string, any>
  temperature?: number
  maxTokens?: number
  stream?: boolean
  userId?: string
  cacheKey?: string
}

export interface ChatResponse {
  content: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
  cached?: boolean
}

export interface StreamChatOptions extends ChatOptions {
  onChunk: (chunk: string) => void
  onComplete: (fullResponse: string) => void
  onError: (error: Error) => void
}
```

**Step 2: Create AIService class**

Create `lib/ai/service.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'
import { Message, ChatOptions, ChatResponse, StreamChatOptions } from './types'
import { getCached, setCached } from '@/lib/redis/client'
import { createHash } from 'crypto'

class AIService {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }

  /**
   * Generate cache key from messages
   */
  private generateCacheKey(messages: Message[], systemPrompt: string): string {
    const content = systemPrompt + JSON.stringify(messages)
    return `ai:${createHash('md5').update(content).digest('hex')}`
  }

  /**
   * Non-streaming chat completion
   */
  async chat(options: ChatOptions): Promise<ChatResponse> {
    const {
      systemPrompt,
      messages,
      temperature = 0.7,
      maxTokens = 4096,
      cacheKey,
    } = options

    // Check cache if key provided
    if (cacheKey) {
      const cached = await getCached<ChatResponse>(cacheKey)
      if (cached) {
        return { ...cached, cached: true }
      }
    }

    // Auto-generate cache key for identical requests
    const autoCacheKey = this.generateCacheKey(messages, systemPrompt)
    const autoCached = await getCached<ChatResponse>(autoCacheKey)
    if (autoCached) {
      return { ...autoCached, cached: true }
    }

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content,
        })),
      })

      const content = response.content[0].type === 'text'
        ? response.content[0].text
        : ''

      const result: ChatResponse = {
        content,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      }

      // Cache the result (15 min expiration)
      await setCached(autoCacheKey, result, 900)

      return result
    } catch (error) {
      console.error('AI chat error:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  /**
   * Streaming chat completion
   */
  async streamChat(options: StreamChatOptions): Promise<void> {
    const {
      systemPrompt,
      messages,
      temperature = 0.7,
      maxTokens = 4096,
      onChunk,
      onComplete,
      onError,
    } = options

    try {
      const stream = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content,
        })),
        stream: true,
      })

      let fullResponse = ''

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          const text = chunk.delta.text
          fullResponse += text
          onChunk(text)
        }
      }

      onComplete(fullResponse)
    } catch (error) {
      console.error('AI stream error:', error)
      onError(error as Error)
    }
  }

  /**
   * Retry wrapper for resilience
   */
  async chatWithRetry(
    options: ChatOptions,
    maxRetries: number = 3
  ): Promise<ChatResponse> {
    let lastError: Error | null = null

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.chat(options)
      } catch (error) {
        lastError = error as Error
        console.warn(`Retry ${i + 1}/${maxRetries} after error:`, error)

        // Exponential backoff
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        )
      }
    }

    throw lastError || new Error('Failed after retries')
  }
}

// Export singleton instance
export const aiService = new AIService()
```

**Step 3: Update diagnosis to use new AIService**

Update `lib/ai/client.ts` to use the new service:
```typescript
import { aiService } from './service'
import { quizQuestions } from '@/lib/quiz/questions'

export interface DiagnosisAnalysisInput {
  answers: Array<{
    questionId: string
    question: string
    selectedOptions: string[]
    correctAnswers: string[]
    skillArea: string
    isCorrect: boolean
  }>
  totalQuestions: number
}

export interface DiagnosisAnalysisOutput {
  skillScores: {
    llm_fundamentals: number
    prompt_engineering: number
    rag: number
    agents: number
    multimodal: number
    production_ai: number
  }
  recommendedPath: 'standard' | 'fast-track' | 'foundation-first'
  skipConcepts: string[]
  focusAreas: string[]
  summary: string
}

export async function analyzeDiagnosis(
  input: DiagnosisAnalysisInput
): Promise<DiagnosisAnalysisOutput> {
  const prompt = createDiagnosisPrompt(input)

  const response = await aiService.chat({
    systemPrompt: 'You are an expert AI learning path advisor.',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    maxTokens: 2000,
  })

  // Parse JSON response
  const jsonMatch = response.content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response')
  }

  return JSON.parse(jsonMatch[0])
}

function createDiagnosisPrompt(input: DiagnosisAnalysisInput): string {
  const answerSummary = input.answers.map(a =>
    `- ${a.skillArea}: ${a.isCorrect ? '✓' : '✗'} (${a.question})`
  ).join('\n')

  return `You are an AI learning path advisor. Analyze this skill diagnosis quiz results and provide personalized recommendations.

Quiz Results (${input.answers.filter(a => a.isCorrect).length}/${input.totalQuestions} correct):
${answerSummary}

Provide analysis in this exact JSON format:
{
  "skillScores": {
    "llm_fundamentals": 0.0-1.0,
    "prompt_engineering": 0.0-1.0,
    "rag": 0.0-1.0,
    "agents": 0.0-1.0,
    "multimodal": 0.0-1.0,
    "production_ai": 0.0-1.0
  },
  "recommendedPath": "standard|fast-track|foundation-first",
  "skipConcepts": ["concept_slug_1", "concept_slug_2"],
  "focusAreas": ["skill_area_1", "skill_area_2"],
  "summary": "2-3 sentence summary of their readiness"
}

Scoring guidelines:
- 0.0-0.3: Beginner (needs foundation)
- 0.4-0.7: Intermediate (standard path)
- 0.8-1.0: Advanced (can skip basics)

Path recommendations:
- "foundation-first": <50% overall, needs basics
- "standard": 50-80% overall, normal pace
- "fast-track": >80% overall, skip basics

Respond ONLY with the JSON object, no additional text.`
}
```

**Step 4: Commit**

```bash
git add lib/ai/
git commit -m "feat: create AIService abstraction layer with caching and retry logic"
```

---

## Task 3: Create Context Management System

**Files:**
- Create: `lib/ai/context.ts`
- Create: `types/context.ts`

**Step 1: Create context types**

Create `types/context.ts`:
```typescript
export interface UserContext {
  userId: string
  name: string | null
  currentSprint: number | null
  currentProject: number | null
  diagnosisCompleted: boolean
  skillScores?: Record<string, number>
  recommendedPath?: string
}

export interface ConversationContext {
  conversationId: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  contextType: 'mentor' | 'code_review' | 'interview'
  metadata?: Record<string, any>
}

export interface ProjectContext {
  projectNumber: number
  projectName: string
  userCode?: string
  submissionUrl?: string
  lastSubmission?: string
}

export interface AssembledContext {
  user: UserContext
  conversation?: ConversationContext
  project?: ProjectContext
  additionalData?: Record<string, any>
}
```

**Step 2: Create context assembly utilities**

Create `lib/ai/context.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { UserContext, ConversationContext, ProjectContext, AssembledContext } from '@/types/context'

/**
 * Fetch user context from database
 */
export async function getUserContext(userId: string): Promise<UserContext> {
  const supabase = createClient()

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  const { data: diagnosis } = await supabase
    .from('skill_diagnosis')
    .select('skill_scores, recommended_path')
    .eq('user_id', userId)
    .single()

  return {
    userId,
    name: user?.name || null,
    currentSprint: null, // TODO: Track in user_progress
    currentProject: null,
    diagnosisCompleted: !!diagnosis,
    skillScores: diagnosis?.skill_scores as Record<string, number> | undefined,
    recommendedPath: diagnosis?.recommended_path,
  }
}

/**
 * Fetch conversation context
 */
export async function getConversationContext(
  conversationId: string
): Promise<ConversationContext | null> {
  const supabase = createClient()

  const { data: conversation } = await supabase
    .from('mentor_conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  if (!conversation) return null

  return {
    conversationId: conversation.id,
    messages: conversation.messages as any[],
    contextType: 'mentor',
    metadata: {
      contextSprint: conversation.context_sprint,
      contextProject: conversation.context_project,
    },
  }
}

/**
 * Get recent conversation history
 */
export async function getRecentConversations(
  userId: string,
  limit: number = 5
): Promise<ConversationContext[]> {
  const supabase = createClient()

  const { data: conversations } = await supabase
    .from('mentor_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (!conversations) return []

  return conversations.map(c => ({
    conversationId: c.id,
    messages: c.messages as any[],
    contextType: 'mentor',
    metadata: {
      contextSprint: c.context_sprint,
      contextProject: c.context_project,
    },
  }))
}

/**
 * Assemble full context for AI
 */
export async function assembleContext(options: {
  userId: string
  conversationId?: string
  projectNumber?: number
  includeHistory?: boolean
}): Promise<AssembledContext> {
  const { userId, conversationId, projectNumber, includeHistory = false } = options

  // Always get user context
  const user = await getUserContext(userId)

  // Optionally get conversation context
  let conversation: ConversationContext | undefined
  if (conversationId) {
    const conv = await getConversationContext(conversationId)
    if (conv) conversation = conv
  }

  // Optionally get project context
  let project: ProjectContext | undefined
  if (projectNumber) {
    // TODO: Implement when projects are added
  }

  // Optionally include recent history
  let additionalData: Record<string, any> | undefined
  if (includeHistory) {
    const recentConvs = await getRecentConversations(userId, 3)
    additionalData = {
      recentConversations: recentConvs,
    }
  }

  return {
    user,
    conversation,
    project,
    additionalData,
  }
}

/**
 * Trim conversation to fit context window
 */
export function trimConversation(
  messages: Array<{ role: string; content: string }>,
  maxMessages: number = 10
): Array<{ role: string; content: string }> {
  if (messages.length <= maxMessages) {
    return messages
  }

  // Keep the most recent messages
  return messages.slice(-maxMessages)
}
```

**Step 3: Commit**

```bash
git add lib/ai/context.ts types/context.ts
git commit -m "feat: add context management system for AI conversations"
```

---

## Task 4: Create Reusable Chat UI Components

**Files:**
- Create: `components/chat/ChatMessage.tsx`
- Create: `components/chat/ChatInput.tsx`
- Create: `components/chat/ChatContainer.tsx`

**Step 1: Install additional UI components**

Run:
```bash
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add scroll-area
```

**Step 2: Create ChatMessage component**

Create `components/chat/ChatMessage.tsx`:
```typescript
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  userName?: string
}

export function ChatMessage({ role, content, timestamp, userName }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className={cn(
          isUser ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
        )}>
          {isUser ? (userName?.[0]?.toUpperCase() || 'U') : 'AI'}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex flex-col max-w-[80%]', isUser && 'items-end')}>
        <div className={cn(
          'rounded-lg px-4 py-2',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-900'
        )}>
          <div className="prose prose-sm max-w-none">
            {content.split('\n').map((line, i) => (
              <p key={i} className={cn('mb-2 last:mb-0', isUser && 'text-white')}>
                {line}
              </p>
            ))}
          </div>
        </div>
        {timestamp && (
          <span className="text-xs text-slate-500 mt-1">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Create ChatInput component**

Create `components/chat/ChatInput.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[60px] max-h-[200px]"
      />
      <Button
        type="submit"
        disabled={disabled || !message.trim()}
        className="self-end"
      >
        Send
      </Button>
    </form>
  )
}
```

**Step 4: Install textarea component**

Run:
```bash
npx shadcn-ui@latest add textarea
```

**Step 5: Create ChatContainer component**

Create `components/chat/ChatContainer.tsx`:
```typescript
'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatContainerProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
  userName?: string
  placeholder?: string
}

export function ChatContainer({
  messages,
  onSendMessage,
  isLoading = false,
  userName,
  placeholder = 'Ask a question...',
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            Start a conversation...
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              userName={userName}
            />
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <ChatInput
          onSend={onSendMessage}
          disabled={isLoading}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
```

**Step 6: Commit**

```bash
git add components/chat/
git commit -m "feat: add reusable chat UI components"
```

---

## Task 5: Create Streaming API Route

**Files:**
- Create: `app/api/chat/stream/route.ts`

**Step 1: Install Vercel AI SDK**

Run:
```bash
npm install ai
```

**Step 2: Create streaming chat endpoint**

Create `app/api/chat/stream/route.ts`:
```typescript
import { StreamingTextResponse } from 'ai'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'edge'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt, conversationId } = await req.json()

    // Verify authentication
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Create streaming response
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
      stream: true,
    })

    // Convert Anthropic stream to web standard stream
    const encoder = new TextEncoder()
    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text
              fullResponse += text
              controller.enqueue(encoder.encode(text))
            }
          }

          // Save conversation to database after streaming completes
          if (conversationId) {
            await saveConversation(user.id, conversationId, messages, fullResponse)
          }

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new StreamingTextResponse(readableStream)
  } catch (error) {
    console.error('Stream error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

async function saveConversation(
  userId: string,
  conversationId: string,
  userMessages: any[],
  assistantResponse: string
) {
  const supabase = createClient()

  // Get existing conversation
  const { data: existing } = await supabase
    .from('mentor_conversations')
    .select('messages')
    .eq('id', conversationId)
    .single()

  const allMessages = [
    ...(existing?.messages || []),
    ...userMessages.map((m: any) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date().toISOString(),
    })),
    {
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date().toISOString(),
    },
  ]

  // Upsert conversation
  await supabase
    .from('mentor_conversations')
    .upsert({
      id: conversationId,
      user_id: userId,
      messages: allMessages,
      updated_at: new Date().toISOString(),
    })
}
```

**Step 3: Commit**

```bash
git add app/api/chat/
git commit -m "feat: add streaming chat API endpoint with conversation persistence"
```

---

## Task 6: Create Basic AI Mentor Page

**Files:**
- Create: `app/(dashboard)/mentor/page.tsx`
- Create: `app/(dashboard)/mentor/[id]/page.tsx`

**Step 1: Update mentor_conversations table schema**

Create `supabase/migrations/20260201_mentor_conversations.sql`:
```sql
-- Update mentor_conversations table
ALTER TABLE public.mentor_conversations
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_mentor_conversations_user
ON public.mentor_conversations(user_id, created_at DESC);
```

Apply to Supabase via SQL Editor.

**Step 2: Create mentor conversations list page**

Create `app/(dashboard)/mentor/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function MentorPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get recent conversations
  const { data: conversations } = await supabase
    .from('mentor_conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(10)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Mentor</h1>
          <p className="text-slate-600 mt-2">
            Your 24/7 AI learning assistant
          </p>
        </div>
        <Link href="/mentor/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            New Conversation
          </Button>
        </Link>
      </div>

      {conversations && conversations.length > 0 ? (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const messages = conv.messages as any[]
            const firstUserMessage = messages.find(m => m.role === 'user')
            const title = conv.title || firstUserMessage?.content.slice(0, 60) + '...' || 'Untitled'

            return (
              <Link key={conv.id} href={`/mentor/${conv.id}`}>
                <Card className="hover:border-blue-300 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>
                      {messages.length} messages • Last updated{' '}
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">
                No conversations yet. Start chatting with your AI mentor!
              </p>
              <Link href="/mentor/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Start First Conversation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

**Step 3: Create individual conversation page**

Create `app/(dashboard)/mentor/[id]/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function MentorConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const isNew = conversationId === 'new'

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState<string>()

  // Load existing conversation
  useEffect(() => {
    if (!isNew) {
      loadConversation()
    }
    loadUserName()
  }, [conversationId])

  const loadConversation = async () => {
    try {
      const response = await fetch(`/api/mentor/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const loadUserName = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserName(data.name)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemPrompt: MENTOR_SYSTEM_PROMPT,
          conversationId: isNew ? generateId() : conversationId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          aiResponse += chunk

          // Update UI with streaming response
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage?.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: aiResponse },
              ]
            } else {
              return [
                ...prev,
                {
                  role: 'assistant',
                  content: aiResponse,
                  timestamp: new Date().toISOString(),
                },
              ]
            }
          })
        }
      }

      // If this was a new conversation, redirect to the saved one
      if (isNew) {
        const newId = generateId()
        router.push(`/mentor/${newId}`)
      }
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {isNew ? 'New Conversation' : 'AI Mentor Chat'}
        </h1>
        <Button variant="outline" onClick={() => router.push('/mentor')}>
          Back to Conversations
        </Button>
      </div>

      <ChatContainer
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        userName={userName}
        placeholder="Ask me anything about AI development..."
      />
    </div>
  )
}

const MENTOR_SYSTEM_PROMPT = `You are an AI mentor for the AI Architect Accelerator program. Your role is to help learners understand concepts, debug code, and complete projects.

Guidelines:
- Provide guidance without giving away complete solutions
- Ask probing questions to help learners think through problems
- Be encouraging and supportive
- Keep responses concise and actionable
- Use examples when explaining concepts
- If you don't know something, say so honestly`

function generateId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
```

**Step 4: Create API route to fetch conversations**

Create `app/api/mentor/[id]/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: conversation } = await supabase
      .from('mentor_conversations')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Fetch conversation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 5: Create user profile API route**

Create `app/api/user/profile/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()

    return NextResponse.json(profile || { name: null, email: user.email })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add AI Mentor pages with conversation management"
```

---

## Task 7: Update Dashboard with Mentor Link

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

**Step 1: Update dashboard AI Mentor card**

Update the AI Mentor card in `app/(dashboard)/dashboard/page.tsx`:
```typescript
<Card>
  <CardHeader>
    <CardTitle>AI Mentor</CardTitle>
    <CardDescription>24/7 Support</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-slate-600 mb-4">
      Get help from your AI learning assistant anytime
    </p>
    <Link href="/mentor/new">
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
        Start Chat
      </Button>
    </Link>
  </CardContent>
</Card>
```

Add import at top:
```typescript
import Link from 'next/link'
```

**Step 2: Test mentor flow**

Manual testing:
1. Go to dashboard
2. Click "Start Chat" on AI Mentor card
3. Should navigate to /mentor/new
4. Send a message
5. Verify streaming response
6. Check conversation saved
7. Navigate back to /mentor
8. Verify conversation appears in list

Expected: Full mentor flow works

**Step 3: Commit**

```bash
git add app/
git commit -m "feat: update dashboard with working AI Mentor link"
```

---

## Task 8: Add Rate Limiting

**Files:**
- Create: `lib/rate-limit.ts`
- Create: `middleware.ts` (update)

**Step 1: Create rate limiting utility**

Create `lib/rate-limit.ts`:
```typescript
import { redis } from '@/lib/redis/client'

export interface RateLimitConfig {
  interval: number // Time window in seconds
  maxRequests: number // Max requests per window
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{
  success: boolean
  remaining: number
  reset: number
}> {
  const key = `rate-limit:${identifier}`

  try {
    const count = await redis.incr(key)

    // Set expiration on first request
    if (count === 1) {
      await redis.expire(key, config.interval)
    }

    const ttl = await redis.ttl(key)
    const reset = Date.now() + ttl * 1000

    if (count > config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset,
      }
    }

    return {
      success: true,
      remaining: config.maxRequests - count,
      reset,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fail open - allow request if Redis is down
    return {
      success: true,
      remaining: config.maxRequests,
      reset: Date.now() + config.interval * 1000,
    }
  }
}

// Preset configurations
export const RATE_LIMITS = {
  MENTOR_CHAT: {
    interval: 3600, // 1 hour
    maxRequests: 20, // 20 messages per hour
  },
  DIAGNOSIS: {
    interval: 86400, // 24 hours
    maxRequests: 3, // 3 attempts per day
  },
  API_GENERAL: {
    interval: 60, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
}
```

**Step 2: Add rate limiting to chat endpoint**

Update `app/api/chat/stream/route.ts` - add at beginning of POST function:
```typescript
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Rate limiting
    const limitResult = await rateLimit(
      `chat:${user.id}`,
      RATE_LIMITS.MENTOR_CHAT
    )

    if (!limitResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          reset: limitResult.reset,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const { messages, systemPrompt, conversationId } = await req.json()

    // ... rest of the code
```

**Step 3: Show rate limit info in UI**

Update `app/(dashboard)/mentor/[id]/page.tsx` - handle rate limit error:
```typescript
const handleSendMessage = async (content: string) => {
  // ... existing code ...

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, userMessage],
        systemPrompt: MENTOR_SYSTEM_PROMPT,
        conversationId: isNew ? generateId() : conversationId,
      }),
    })

    if (response.status === 429) {
      const data = await response.json()
      const resetTime = new Date(data.reset).toLocaleTimeString()
      toast.error('Rate limit reached', {
        description: `Please try again after ${resetTime}`,
      })
      setIsLoading(false)
      return
    }

    if (!response.ok) {
      throw new Error('Failed to get response')
    }

    // ... rest of streaming code
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add rate limiting to AI endpoints"
```

---

## Task 9: Add Conversation Titles and Metadata

**Files:**
- Create: `app/api/mentor/[id]/title/route.ts`
- Modify: `app/api/chat/stream/route.ts`

**Step 1: Auto-generate conversation title**

Update `app/api/chat/stream/route.ts` - modify saveConversation function:
```typescript
async function saveConversation(
  userId: string,
  conversationId: string,
  userMessages: any[],
  assistantResponse: string
) {
  const supabase = createClient()

  // Get existing conversation
  const { data: existing } = await supabase
    .from('mentor_conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  const allMessages = [
    ...(existing?.messages || []),
    ...userMessages.map((m: any) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date().toISOString(),
    })),
    {
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date().toISOString(),
    },
  ]

  // Generate title from first user message if new conversation
  let title = existing?.title
  if (!title && userMessages.length > 0) {
    const firstMessage = userMessages.find((m: any) => m.role === 'user')
    if (firstMessage) {
      title = firstMessage.content.slice(0, 60)
      if (firstMessage.content.length > 60) title += '...'
    }
  }

  // Upsert conversation
  await supabase
    .from('mentor_conversations')
    .upsert({
      id: conversationId,
      user_id: userId,
      messages: allMessages,
      title,
      updated_at: new Date().toISOString(),
    })

  // Log event for new conversations
  if (!existing) {
    await supabase.from('learning_events').insert({
      user_id: userId,
      event_type: 'mentor.conversation_started',
      event_data: { conversation_id: conversationId },
    })
  }
}
```

**Step 2: Create endpoint to update title**

Create `app/api/mentor/[id]/title/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title } = await request.json()

    if (!title || title.length > 255) {
      return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
    }

    const { error } = await supabase
      .from('mentor_conversations')
      .update({ title })
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update title error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add auto-generated conversation titles and metadata"
```

---

## Task 10: Testing and Documentation

**Files:**
- Create: `README-WEEK3.md`

**Step 1: End-to-end testing**

Test checklist:
1. Start new mentor conversation
2. Send message and verify streaming works
3. Verify message appears in UI during streaming
4. Check conversation saved to database
5. Navigate back to /mentor list
6. Verify conversation appears with title
7. Click conversation to reopen
8. Verify message history loads
9. Send another message
10. Test rate limiting (send 21 messages in an hour)
11. Verify rate limit error shows

Expected: All flows work smoothly

**Step 2: Test caching**

Caching test:
1. Send same question twice from diagnosis
2. Check logs for cache hit
3. Verify second response is instant

Expected: Cache working correctly

**Step 3: Create Week 3 documentation**

Create `README-WEEK3.md`:
```markdown
# Week 3: AI Infrastructure Implementation

## Completed Features

- ✅ Redis caching layer (Upstash)
- ✅ AIService abstraction with retry logic
- ✅ Context management system
- ✅ Reusable chat UI components
- ✅ Streaming chat API with SSE
- ✅ AI Mentor conversation interface
- ✅ Rate limiting per user
- ✅ Conversation persistence and history
- ✅ Auto-generated conversation titles

## Architecture

```
User → Chat UI → Streaming API → AIService → Claude API
                      ↓                ↓
                   Supabase         Redis Cache
```

### Key Components

**AIService (`lib/ai/service.ts`)**
- Unified interface for all AI interactions
- Automatic caching with Redis
- Retry logic with exponential backoff
- Streaming and non-streaming modes

**Context System (`lib/ai/context.ts`)**
- Assembles user context, conversation history, project data
- Trims messages to fit context window
- Provides relevant context to AI

**Chat Components (`components/chat/`)**
- Reusable across all AI features
- ChatContainer, ChatMessage, ChatInput
- Auto-scrolling, streaming support

**Rate Limiting (`lib/rate-limit.ts`)**
- Redis-based rate limiting
- Configurable per feature
- Graceful degradation if Redis fails

## API Endpoints

### POST /api/chat/stream
Streaming chat with Claude API

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "How do I build a RAG system?" }
  ],
  "systemPrompt": "You are an AI mentor...",
  "conversationId": "conv_123"
}
```

**Response:** Server-Sent Events stream

### GET /api/mentor/[id]
Fetch conversation by ID

### PATCH /api/mentor/[id]/title
Update conversation title

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

## Rate Limits

- Mentor chat: 20 messages/hour
- Diagnosis: 3 attempts/day
- General API: 30 requests/minute

## Testing

Test streaming chat:
```bash
npm run dev
# Navigate to /mentor/new
# Send messages and verify streaming
```

Test caching:
```typescript
// Check Redis cache
import { getCached } from '@/lib/redis/client'
const cached = await getCached('ai:...')
```

## Next Steps

Week 4 will add:
- Learning platform content structure
- Sprint 1 modules
- Progress tracking
- Navigation between concepts
```

**Step 4: Final commit**

```bash
git add .
git commit -m "chore: Week 3 complete - AI infrastructure ready"
git push
```

---

## Week 3 Completion Checklist

- [ ] Redis caching set up (Upstash)
- [ ] AIService abstraction layer created
- [ ] Context management system implemented
- [ ] Chat UI components built and reusable
- [ ] Streaming chat API working
- [ ] AI Mentor conversation interface functional
- [ ] Rate limiting implemented and tested
- [ ] Conversation persistence working
- [ ] Auto-generated titles
- [ ] Caching verified
- [ ] Rate limits tested
- [ ] End-to-end testing complete
- [ ] Documentation created
- [ ] Code pushed to GitHub

---

## Next Steps (Week 4)

After Week 3 is complete, proceed to Week 4: Learning Platform Core

This will include:
- Content management system for sprints/modules
- Sprint 1 concept modules structure
- Progress tracking UI
- Module navigation
- Concept completion tracking
- Dashboard progress visualization

This sets the foundation for delivering actual learning content in the platform.
