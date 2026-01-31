# Week 5: AI Mentor with Context Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance AI Mentor with context awareness - knows which sprint/concept user is on, can reference learning materials, provides smarter guidance

**Architecture:** Context-aware prompts, learning material integration, concept-specific help, adaptive responses based on user progress

**Tech Stack:** Claude API, existing AIService, context assembly system, Supabase

**Prerequisites:** Weeks 1-4 must be complete

---

## Task 1: Extend Context System for Learning

**Files:**
- Modify: `lib/ai/context.ts`
- Create: `lib/ai/learning-context.ts`
- Update: `types/context.ts`

**Step 1: Update context types**

Update `types/context.ts` - add new interfaces:
```typescript
export interface LearningContext {
  currentSprint?: {
    number: number
    title: string
    conceptsCompleted: string[]
    conceptsTotal: number
    percentComplete: number
  }
  currentConcept?: {
    slug: string
    title: string
    tags: string[]
    order: number
  }
  recentConcepts?: Array<{
    slug: string
    title: string
    completedAt: string
  }>
  skillScores?: Record<string, number>
  recommendedPath?: string
  strugglingAreas?: string[]
}

// Update AssembledContext
export interface AssembledContext {
  user: UserContext
  conversation?: ConversationContext
  project?: ProjectContext
  learning?: LearningContext  // Add this
  additionalData?: Record<string, any>
}
```

**Step 2: Create learning context utilities**

Create `lib/ai/learning-context.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { LearningContext } from '@/types/context'
import { getSprint, getConcept } from '@/lib/content/loader'

export async function getLearningContext(
  userId: string,
  currentSprintNumber?: number,
  currentConceptSlug?: string
): Promise<LearningContext> {
  const supabase = createClient()

  const context: LearningContext = {}

  // Get current sprint progress if specified
  if (currentSprintNumber) {
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('sprint_number', currentSprintNumber)
      .single()

    const sprint = getSprint(currentSprintNumber)

    if (progress && sprint) {
      context.currentSprint = {
        number: currentSprintNumber,
        title: sprint.title,
        conceptsCompleted: progress.concepts_completed || [],
        conceptsTotal: sprint.concepts.length,
        percentComplete: Math.round(
          ((progress.concepts_completed?.length || 0) / sprint.concepts.length) * 100
        ),
      }
    }
  }

  // Get current concept details if specified
  if (currentSprintNumber && currentConceptSlug) {
    const concept = getConcept(currentSprintNumber, currentConceptSlug)
    if (concept) {
      context.currentConcept = {
        slug: concept.slug,
        title: concept.title,
        tags: concept.tags,
        order: concept.order,
      }
    }
  }

  // Get recently completed concepts
  const { data: recentCompletions } = await supabase
    .from('concept_completions')
    .select('concept_slug, completed_at, sprint_number')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(5)

  if (recentCompletions) {
    context.recentConcepts = recentCompletions.map(c => {
      const concept = getConcept(c.sprint_number, c.concept_slug)
      return {
        slug: c.concept_slug,
        title: concept?.title || c.concept_slug,
        completedAt: c.completed_at,
      }
    })
  }

  // Get skill scores from diagnosis
  const { data: diagnosis } = await supabase
    .from('skill_diagnosis')
    .select('skill_scores, recommended_path')
    .eq('user_id', userId)
    .single()

  if (diagnosis) {
    context.skillScores = diagnosis.skill_scores as Record<string, number>
    context.recommendedPath = diagnosis.recommended_path

    // Identify struggling areas (scores < 0.5)
    const scores = diagnosis.skill_scores as Record<string, number>
    context.strugglingAreas = Object.entries(scores)
      .filter(([_, score]) => score < 0.5)
      .map(([area, _]) => area)
  }

  return context
}

export function formatLearningContextForPrompt(context: LearningContext): string {
  const parts: string[] = []

  if (context.currentSprint) {
    parts.push(`Current Sprint: Sprint ${context.currentSprint.number} - ${context.currentSprint.title}`)
    parts.push(`Progress: ${context.currentSprint.conceptsCompleted.length}/${context.currentSprint.conceptsTotal} concepts completed (${context.currentSprint.percentComplete}%)`)
  }

  if (context.currentConcept) {
    parts.push(`Current Lesson: ${context.currentConcept.title} (${context.currentConcept.tags.join(', ')})`)
  }

  if (context.recentConcepts && context.recentConcepts.length > 0) {
    parts.push(`Recently Completed: ${context.recentConcepts.map(c => c.title).join(', ')}`)
  }

  if (context.strugglingAreas && context.strugglingAreas.length > 0) {
    parts.push(`Areas for improvement: ${context.strugglingAreas.join(', ')}`)
  }

  if (context.recommendedPath) {
    parts.push(`Learning Path: ${context.recommendedPath}`)
  }

  return parts.join('\n')
}
```

**Step 3: Update context assembly**

Update `lib/ai/context.ts` - modify assembleContext function:
```typescript
import { getLearningContext } from './learning-context'

export async function assembleContext(options: {
  userId: string
  conversationId?: string
  projectNumber?: number
  includeHistory?: boolean
  sprintNumber?: number  // Add this
  conceptSlug?: string   // Add this
}): Promise<AssembledContext> {
  const {
    userId,
    conversationId,
    projectNumber,
    includeHistory = false,
    sprintNumber,
    conceptSlug,
  } = options

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

  // Get learning context
  const learning = await getLearningContext(userId, sprintNumber, conceptSlug)

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
    learning,
    additionalData,
  }
}
```

**Step 4: Commit**

```bash
git add lib/ai/ types/
git commit -m "feat: extend context system with learning progress awareness"
```

---

## Task 2: Update AI Mentor System Prompts

**Files:**
- Modify: `lib/ai/prompts.ts`
- Create: `lib/ai/mentor-prompts.ts`

**Step 1: Create context-aware mentor prompts**

Create `lib/ai/mentor-prompts.ts`:
```typescript
import { LearningContext } from '@/types/context'
import { formatLearningContextForPrompt } from './learning-context'

export function getMentorSystemPrompt(learningContext?: LearningContext): string {
  const basePrompt = `You are an AI mentor for the AI Architect Accelerator program. Your role is to help learners understand concepts, debug code, and complete projects.

Core Guidelines:
- Provide guidance without giving away complete solutions
- Ask probing questions to help learners think through problems
- Be encouraging and supportive
- Keep responses concise (150-200 words unless detail is requested)
- Use examples when explaining concepts
- If you don't know something, say so honestly`

  if (!learningContext) {
    return basePrompt
  }

  const contextInfo = formatLearningContextForPrompt(learningContext)

  return `${basePrompt}

Current Learning Context:
${contextInfo}

Context-Specific Guidance:
${getContextSpecificGuidance(learningContext)}

Remember:
- Reference concepts they've already completed when relevant
- Adjust difficulty based on their skill scores
- Focus on their current learning objectives`
}

function getContextSpecificGuidance(context: LearningContext): string {
  const guidelines: string[] = []

  // Sprint-specific guidance
  if (context.currentSprint?.number === 1) {
    guidelines.push('- Focus on LLM fundamentals and API integration')
    guidelines.push('- Emphasize prompt engineering best practices')
    guidelines.push('- Help them understand tokens and context windows')
  }

  // Concept-specific guidance
  if (context.currentConcept) {
    const tags = context.currentConcept.tags

    if (tags.includes('fundamentals')) {
      guidelines.push('- Provide clear, beginner-friendly explanations')
      guidelines.push('- Use analogies to explain complex concepts')
    }

    if (tags.includes('coding')) {
      guidelines.push('- Show code examples when helpful')
      guidelines.push('- Suggest debugging approaches')
    }

    if (tags.includes('practical')) {
      guidelines.push('- Focus on real-world applications')
      guidelines.push('- Share industry best practices')
    }
  }

  // Struggling areas guidance
  if (context.strugglingAreas && context.strugglingAreas.length > 0) {
    guidelines.push(`- Pay special attention to: ${context.strugglingAreas.join(', ')}`)
    guidelines.push('- Provide extra support in weak areas')
  }

  // Learning path adjustments
  if (context.recommendedPath === 'foundation-first') {
    guidelines.push('- Ensure fundamentals are solid before advancing')
    guidelines.push('- Don\'t assume prior knowledge')
  } else if (context.recommendedPath === 'fast-track') {
    guidelines.push('- Can move faster through basics')
    guidelines.push('- Focus on advanced concepts and edge cases')
  }

  return guidelines.length > 0 ? guidelines.join('\n') : '- Adapt guidance to their current level'
}

export function getQuickHelpPrompts() {
  return {
    conceptExplanation: `Explain this concept in simple terms with an example.`,
    debugging: `Help me debug this code. What's wrong and how do I fix it?`,
    bestPractices: `What are the best practices for this?`,
    nextSteps: `What should I learn next?`,
    realWorld: `How is this used in real-world applications?`,
  }
}
```

**Step 2: Update base prompts**

Update `lib/ai/prompts.ts`:
```typescript
export { getMentorSystemPrompt, getQuickHelpPrompts } from './mentor-prompts'

export const DIAGNOSIS_SYSTEM_PROMPT = `You are an expert AI learning path advisor. Your role is to analyze quiz results and provide accurate, helpful recommendations for learning AI engineering.

Be objective and base recommendations solely on the quiz performance data provided.`

// Keep existing prompts...
```

**Step 3: Commit**

```bash
git add lib/ai/
git commit -m "feat: add context-aware AI mentor system prompts"
```

---

## Task 3: Update Streaming API with Context

**Files:**
- Modify: `app/api/chat/stream/route.ts`

**Step 1: Update streaming endpoint to use context**

Modify `app/api/chat/stream/route.ts`:
```typescript
import { StreamingTextResponse } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { assembleContext } from '@/lib/ai/context'
import { getMentorSystemPrompt } from '@/lib/ai/prompts'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'edge'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const {
      messages,
      conversationId,
      sprintNumber,
      conceptSlug,
    } = await req.json()

    // Verify authentication
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Rate limiting (from Week 3)
    const { rateLimit, RATE_LIMITS } = await import('@/lib/rate-limit')
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

    // Assemble context with learning information
    const context = await assembleContext({
      userId: user.id,
      conversationId,
      sprintNumber,
      conceptSlug,
      includeHistory: false,
    })

    // Generate context-aware system prompt
    const systemPrompt = getMentorSystemPrompt(context.learning)

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

          // Save conversation with context
          if (conversationId) {
            await saveConversation(
              user.id,
              conversationId,
              messages,
              fullResponse,
              sprintNumber,
              conceptSlug
            )
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
  assistantResponse: string,
  sprintNumber?: number,
  conceptSlug?: string
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

  // Upsert conversation with context
  await supabase
    .from('mentor_conversations')
    .upsert({
      id: conversationId,
      user_id: userId,
      messages: allMessages,
      title,
      context_sprint: sprintNumber || existing?.context_sprint,
      context_project: existing?.context_project,
      updated_at: new Date().toISOString(),
    })

  // Log event for new conversations
  if (!existing) {
    await supabase.from('learning_events').insert({
      user_id: userId,
      event_type: 'mentor.conversation_started',
      event_data: {
        conversation_id: conversationId,
        sprint_number: sprintNumber,
        concept_slug: conceptSlug,
      },
    })
  }
}
```

**Step 2: Commit**

```bash
git add app/api/chat/
git commit -m "feat: update streaming API with learning context awareness"
```

---

## Task 4: Add Context-Aware Mentor Button to Concept Pages

**Files:**
- Create: `components/learning/AskMentorButton.tsx`
- Modify: `app/(dashboard)/sprint/[number]/concept/[slug]/page.tsx`

**Step 1: Create AskMentorButton component**

Create `components/learning/AskMentorButton.tsx`:
```typescript
'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AskMentorButtonProps {
  sprintNumber: number
  conceptSlug: string
  conceptTitle: string
}

export function AskMentorButton({
  sprintNumber,
  conceptSlug,
  conceptTitle,
}: AskMentorButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    // Create new conversation with context
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store context in session storage for the mentor page
    sessionStorage.setItem('mentor_context', JSON.stringify({
      sprintNumber,
      conceptSlug,
      conceptTitle,
      conversationId,
    }))

    router.push(`/mentor/${conversationId}`)
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className="gap-2"
    >
      <MessageCircle className="h-4 w-4" />
      Ask AI Mentor about this concept
    </Button>
  )
}
```

**Step 2: Update concept page**

Update `app/(dashboard)/sprint/[number]/concept/[slug]/page.tsx` - add button after content:
```typescript
import { AskMentorButton } from '@/components/learning/AskMentorButton'

// In the return JSX, after the prose content and before Mark Complete:
      {/* Content */}
      <div className="prose prose-slate max-w-none mb-8">
        {content || (
          <div className="text-slate-600">
            Content coming soon...
          </div>
        )}
      </div>

      {/* Ask Mentor Button */}
      <div className="mb-4">
        <AskMentorButton
          sprintNumber={sprintNumber}
          conceptSlug={conceptSlug}
          conceptTitle={concept.title}
        />
      </div>

      {/* Mark Complete Button */}
      <div className="mb-8">
        <MarkCompleteButton
          sprintNumber={sprintNumber}
          conceptSlug={conceptSlug}
          isCompleted={isCompleted}
        />
      </div>
```

**Step 3: Commit**

```bash
git add components/learning/ app/
git commit -m "feat: add Ask Mentor button to concept pages"
```

---

## Task 5: Update Mentor Chat to Use Context

**Files:**
- Modify: `app/(dashboard)/mentor/[id]/page.tsx`

**Step 1: Update mentor conversation page to use context**

Update `app/(dashboard)/mentor/[id]/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface MentorContext {
  sprintNumber?: number
  conceptSlug?: string
  conceptTitle?: string
  conversationId?: string
}

export default function MentorConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const isNew = conversationId === 'new'

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState<string>()
  const [context, setContext] = useState<MentorContext>()

  // Load context from session storage
  useEffect(() => {
    if (isNew) {
      const storedContext = sessionStorage.getItem('mentor_context')
      if (storedContext) {
        const parsed = JSON.parse(storedContext)
        setContext(parsed)
        sessionStorage.removeItem('mentor_context')
      }
    } else {
      loadConversation()
    }
    loadUserName()
  }, [conversationId, isNew])

  const loadConversation = async () => {
    try {
      const response = await fetch(`/api/mentor/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])

        // Load context from conversation
        if (data.context_sprint) {
          setContext({
            sprintNumber: data.context_sprint,
          })
        }
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
          conversationId: context?.conversationId || conversationId,
          sprintNumber: context?.sprintNumber,
          conceptSlug: context?.conceptSlug,
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
      if (isNew && context?.conversationId) {
        router.push(`/mentor/${context.conversationId}`)
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isNew ? 'New Conversation' : 'AI Mentor Chat'}
          </h1>
          {context?.conceptTitle && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">
                Sprint {context.sprintNumber}
              </Badge>
              <span className="text-sm text-slate-600">
                About: {context.conceptTitle}
              </span>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => router.push('/mentor')}>
          Back to Conversations
        </Button>
      </div>

      {context?.conceptTitle && messages.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💡 I'm aware you're learning about <strong>{context.conceptTitle}</strong> in Sprint {context.sprintNumber}.
            Feel free to ask me anything about this concept!
          </p>
        </div>
      )}

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
```

**Step 2: Commit**

```bash
git add app/
git commit -m "feat: update mentor chat to use learning context from concept pages"
```

---

## Task 6: Add Quick Help Suggestions

**Files:**
- Create: `components/mentor/QuickHelpSuggestions.tsx`
- Modify: `app/(dashboard)/mentor/[id]/page.tsx`

**Step 1: Create quick help component**

Create `components/mentor/QuickHelpSuggestions.tsx`:
```typescript
'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface QuickHelpSuggestionsProps {
  onSelect: (prompt: string) => void
  conceptTitle?: string
}

export function QuickHelpSuggestions({
  onSelect,
  conceptTitle,
}: QuickHelpSuggestionsProps) {
  const suggestions = conceptTitle
    ? [
        `Explain ${conceptTitle} in simple terms`,
        `Give me a real-world example of ${conceptTitle}`,
        `What are common mistakes with ${conceptTitle}?`,
        `How does ${conceptTitle} work under the hood?`,
      ]
    : [
        'What should I focus on learning right now?',
        'Review my progress and suggest next steps',
        'Explain the difference between prompting and fine-tuning',
        'How do I debug LLM API errors?',
      ]

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-slate-700 mb-3">
        💡 Quick help:
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {suggestions.map((suggestion, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            onClick={() => onSelect(suggestion)}
            className="text-left h-auto py-2 px-3 whitespace-normal"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </Card>
  )
}
```

**Step 2: Add to mentor conversation page**

Update `app/(dashboard)/mentor/[id]/page.tsx` - add before ChatContainer:
```typescript
import { QuickHelpSuggestions } from '@/components/mentor/QuickHelpSuggestions'

// Add this before ChatContainer
{messages.length === 0 && (
  <QuickHelpSuggestions
    onSelect={handleSendMessage}
    conceptTitle={context?.conceptTitle}
  />
)}

<ChatContainer
  messages={messages}
  onSendMessage={handleSendMessage}
  isLoading={isLoading}
  userName={userName}
  placeholder="Ask me anything about AI development..."
/>
```

**Step 3: Commit**

```bash
git add components/mentor/ app/
git commit -m "feat: add quick help suggestions to mentor chat"
```

---

## Task 7: Add Mentor Usage Analytics

**Files:**
- Create: `lib/analytics/mentor.ts`
- Modify: `app/api/chat/stream/route.ts`

**Step 1: Create mentor analytics utilities**

Create `lib/analytics/mentor.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'

export async function trackMentorQuestion(
  userId: string,
  question: string,
  context: {
    sprintNumber?: number
    conceptSlug?: string
    conversationId: string
  }
) {
  const supabase = createClient()

  await supabase.from('learning_events').insert({
    user_id: userId,
    event_type: 'mentor.question_asked',
    event_data: {
      question_length: question.length,
      sprint_number: context.sprintNumber,
      concept_slug: context.conceptSlug,
      conversation_id: context.conversationId,
      timestamp: new Date().toISOString(),
    },
  })
}

export async function getMentorUsageStats(userId: string) {
  const supabase = createClient()

  // Total questions asked
  const { count: totalQuestions } = await supabase
    .from('learning_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'mentor.question_asked')

  // Questions per sprint
  const { data: bySprintData } = await supabase
    .from('learning_events')
    .select('event_data')
    .eq('user_id', userId)
    .eq('event_type', 'mentor.question_asked')

  const bySprint: Record<number, number> = {}
  bySprintData?.forEach(event => {
    const sprintNumber = (event.event_data as any).sprint_number
    if (sprintNumber) {
      bySprint[sprintNumber] = (bySprint[sprintNumber] || 0) + 1
    }
  })

  // Active conversations
  const { count: activeConversations } = await supabase
    .from('mentor_conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    totalQuestions: totalQuestions || 0,
    questionsBySprint: bySprint,
    activeConversations: activeConversations || 0,
  }
}
```

**Step 2: Track questions in streaming API**

Update `app/api/chat/stream/route.ts` - add tracking:
```typescript
import { trackMentorQuestion } from '@/lib/analytics/mentor'

// In POST function, before creating stream:
// Track the question
const userQuestion = messages.find((m: any) => m.role === 'user')
if (userQuestion) {
  await trackMentorQuestion(user.id, userQuestion.content, {
    sprintNumber,
    conceptSlug,
    conversationId: conversationId || 'unknown',
  })
}
```

**Step 3: Commit**

```bash
git add lib/analytics/ app/api/chat/
git commit -m "feat: add mentor usage analytics tracking"
```

---

## Task 8: Testing and Documentation

**Files:**
- Create: `README-WEEK5.md`

**Step 1: End-to-end testing**

Test checklist:
1. Navigate to a concept page
2. Click "Ask AI Mentor about this concept"
3. Verify mentor page shows context badge
4. Send a concept-specific question
5. Verify AI response is contextually relevant
6. Try quick help suggestions
7. Check that AI references the current concept
8. Navigate back to mentor list
9. Verify conversation saved with context
10. Open existing conversation
11. Verify context preserved

Expected: Context flows through entire mentor experience

**Step 2: Test context awareness**

Context test scenarios:
1. Ask "Explain this" on LLM Fundamentals concept → Should explain LLMs
2. Ask "What's a token?" on Tokens concept → Should provide detailed answer
3. Ask general question from dashboard → Should provide general help
4. Ask about debugging code → Should provide appropriate guidance

Expected: AI adjusts responses based on context

**Step 3: Create Week 5 documentation**

Create `README-WEEK5.md`:
```markdown
# Week 5: AI Mentor with Context Implementation

## Completed Features

- ✅ Extended context system for learning progress
- ✅ Learning context assembly utilities
- ✅ Context-aware mentor system prompts
- ✅ Updated streaming API with context awareness
- ✅ Ask Mentor button on concept pages
- ✅ Context display in mentor interface
- ✅ Quick help suggestions
- ✅ Mentor usage analytics

## How Context Works

### Context Flow

```
Concept Page → Ask Mentor → Store Context → Mentor Chat → AI with Context
                                ↓
                          System Prompt includes:
                          - Current sprint/concept
                          - User's progress
                          - Skill scores
                          - Recent completions
```

### Context Assembly

When user asks a question from Sprint 1, Concept 2:

```typescript
{
  learning: {
    currentSprint: {
      number: 1,
      title: "Foundation + AI Chat Assistant",
      conceptsCompleted: ["llm-fundamentals"],
      conceptsTotal: 5,
      percentComplete: 20
    },
    currentConcept: {
      slug: "tokens-context",
      title: "Tokens and Context Windows",
      tags: ["fundamentals", "practical"]
    },
    skillScores: {
      llm_fundamentals: 0.7,
      prompt_engineering: 0.6,
      ...
    },
    strugglingAreas: ["rag", "agents"]
  }
}
```

### System Prompt Generation

The AI receives a prompt like:

```
You are an AI mentor for the AI Architect Accelerator program...

Current Learning Context:
Current Sprint: Sprint 1 - Foundation + AI Chat Assistant
Progress: 1/5 concepts completed (20%)
Current Lesson: Tokens and Context Windows (fundamentals, practical)
Areas for improvement: rag, agents
Learning Path: standard

Context-Specific Guidance:
- Focus on LLM fundamentals and API integration
- Provide clear, beginner-friendly explanations
- Focus on real-world applications
```

## API Changes

### POST /api/chat/stream

**New Parameters:**
```json
{
  "messages": [...],
  "conversationId": "conv_123",
  "sprintNumber": 1,      // NEW
  "conceptSlug": "tokens" // NEW
}
```

## Components Added

### AskMentorButton
- Shows on concept pages
- Passes context to mentor
- Creates contextual conversation

### QuickHelpSuggestions
- Context-aware suggestions
- Pre-filled common questions
- Adaptive to current lesson

## Analytics

Track mentor usage:

```typescript
import { getMentorUsageStats } from '@/lib/analytics/mentor'

const stats = await getMentorUsageStats(userId)
// {
//   totalQuestions: 25,
//   questionsBySprint: { 1: 15, 2: 10 },
//   activeConversations: 5
// }
```

## Testing

Test context awareness:

1. Ask question from concept page
2. Verify AI mentions the concept
3. Ask "explain this" → should know what "this" is
4. Ask "give me an example" → should provide relevant example

## Next Steps

Week 6 will add:
- Code Review AI
- GitHub integration
- Project submission flow
- Structured feedback UI
