# Week 4: Learning Platform Core Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build content delivery system with Sprint 1 concepts, progress tracking, and module navigation

**Architecture:** File-based content management (MDX), database-backed progress tracking, modular learning paths

**Tech Stack:** MDX, Next.js dynamic routes, Supabase for progress, shadcn/ui components

**Prerequisites:** Week 1, Week 2, and Week 3 must be complete

---

## Task 1: Extend Database Schema for Learning Content

**Files:**
- Create: `supabase/migrations/20260202_learning_content.sql`
- Update: `types/database.ts`

**Step 1: Create learning content tables migration**

Create `supabase/migrations/20260202_learning_content.sql`:
```sql
-- User Progress tracking
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    sprint_number INT NOT NULL,
    status VARCHAR(20) DEFAULT 'not_started',
    -- 'not_started', 'in_progress', 'completed'
    concepts_completed TEXT[] DEFAULT '{}',
    labs_completed TEXT[] DEFAULT '{}',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    PRIMARY KEY (user_id, sprint_number)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress"
ON public.user_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON public.user_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON public.user_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Concept Completions (detailed tracking)
CREATE TABLE public.concept_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sprint_number INT NOT NULL,
    concept_slug VARCHAR(100) NOT NULL,
    completed_at TIMESTAMP DEFAULT NOW(),
    time_spent_seconds INT,
    UNIQUE(user_id, sprint_number, concept_slug)
);

ALTER TABLE public.concept_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own completions"
ON public.concept_completions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
ON public.concept_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_completions_user_sprint
ON public.concept_completions(user_id, sprint_number);

-- Lab Attempts (for interactive exercises)
CREATE TABLE public.lab_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sprint_number INT NOT NULL,
    lab_slug VARCHAR(100) NOT NULL,
    attempt_number INT DEFAULT 1,
    code_submitted TEXT,
    passed BOOLEAN DEFAULT FALSE,
    feedback JSONB,
    attempted_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.lab_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own attempts"
ON public.lab_attempts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
ON public.lab_attempts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_attempts_user_lab
ON public.lab_attempts(user_id, sprint_number, lab_slug);
```

**Step 2: Apply migration**

Manual action:
1. Go to Supabase dashboard → SQL Editor
2. Paste and run the migration
3. Verify tables created

Expected: Tables created with RLS policies

**Step 3: Update TypeScript types**

Update `types/database.ts` - add to Tables interface:
```typescript
user_progress: {
  Row: {
    user_id: string
    sprint_number: number
    status: string
    concepts_completed: string[]
    labs_completed: string[]
    started_at: string | null
    completed_at: string | null
  }
  Insert: {
    user_id: string
    sprint_number: number
    status?: string
    concepts_completed?: string[]
    labs_completed?: string[]
    started_at?: string | null
    completed_at?: string | null
  }
  Update: {
    user_id?: string
    sprint_number?: number
    status?: string
    concepts_completed?: string[]
    labs_completed?: string[]
    started_at?: string | null
    completed_at?: string | null
  }
}
concept_completions: {
  Row: {
    id: string
    user_id: string
    sprint_number: number
    concept_slug: string
    completed_at: string
    time_spent_seconds: number | null
  }
  Insert: {
    id?: string
    user_id: string
    sprint_number: number
    concept_slug: string
    completed_at?: string
    time_spent_seconds?: number | null
  }
  Update: {
    id?: string
    user_id?: string
    sprint_number?: number
    concept_slug?: string
    completed_at?: string
    time_spent_seconds?: number | null
  }
}
lab_attempts: {
  Row: {
    id: string
    user_id: string
    sprint_number: number
    lab_slug: string
    attempt_number: number
    code_submitted: string | null
    passed: boolean
    feedback: Json | null
    attempted_at: string
  }
  Insert: {
    id?: string
    user_id: string
    sprint_number: number
    lab_slug: string
    attempt_number?: number
    code_submitted?: string | null
    passed?: boolean
    feedback?: Json | null
    attempted_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    sprint_number?: number
    lab_slug?: string
    attempt_number?: number
    code_submitted?: string | null
    passed?: boolean
    feedback?: Json | null
    attempted_at?: string
  }
}
```

**Step 4: Create learning content types**

Create `types/learning.ts`:
```typescript
export interface Sprint {
  number: number
  title: string
  description: string
  duration: string
  concepts: Concept[]
  labs: Lab[]
  project?: Project
}

export interface Concept {
  slug: string
  title: string
  description: string
  duration: string // "10 min", "30 min"
  order: number
  content?: string // MDX content path
  videoUrl?: string
  tags: string[]
}

export interface Lab {
  slug: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  order: number
  instructions?: string
  starterCode?: string
  solution?: string
  testCases?: TestCase[]
}

export interface TestCase {
  input: string
  expectedOutput: string
  description: string
}

export interface Project {
  number: number
  title: string
  description: string
  estimatedHours: number
  techStack: string[]
  objectives: string[]
  deliverables: string[]
}

export interface UserProgress {
  sprintNumber: number
  status: 'not_started' | 'in_progress' | 'completed'
  conceptsCompleted: string[]
  labsCompleted: string[]
  startedAt: string | null
  completedAt: string | null
  percentComplete: number
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add learning content database schema and types"
```

---

## Task 2: Create Sprint 1 Content Structure

**Files:**
- Create: `content/sprints/sprint-1/index.ts`
- Create: `content/sprints/sprint-1/concepts/llm-fundamentals.mdx`
- Create: `content/sprints/sprint-1/concepts/tokens-context.mdx`
- Create: `content/sprints/sprint-1/concepts/prompt-engineering.mdx`

**Step 1: Install MDX dependencies**

Run:
```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
npm install rehype-highlight remark-gfm
```

**Step 2: Configure Next.js for MDX**

Update `next.config.js`:
```javascript
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [require('remark-gfm')],
    rehypePlugins: [require('rehype-highlight')],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
}

module.exports = withMDX(nextConfig)
```

**Step 3: Create Sprint 1 metadata**

Create `content/sprints/sprint-1/index.ts`:
```typescript
import { Sprint } from '@/types/learning'

export const sprint1: Sprint = {
  number: 1,
  title: 'Foundation + AI Chat Assistant',
  description: 'Learn LLM fundamentals and build your first AI product',
  duration: '2 weeks',
  concepts: [
    {
      slug: 'llm-fundamentals',
      title: 'How LLMs Work',
      description: 'Understanding transformers, attention, and tokens',
      duration: '15 min',
      order: 1,
      content: '/content/sprints/sprint-1/concepts/llm-fundamentals.mdx',
      tags: ['fundamentals', 'theory'],
    },
    {
      slug: 'tokens-context',
      title: 'Tokens and Context Windows',
      description: 'Understanding tokenization and context limits',
      duration: '10 min',
      order: 2,
      content: '/content/sprints/sprint-1/concepts/tokens-context.mdx',
      tags: ['fundamentals', 'practical'],
    },
    {
      slug: 'prompt-engineering',
      title: 'Prompt Engineering Basics',
      description: 'Writing effective prompts for better outputs',
      duration: '20 min',
      order: 3,
      content: '/content/sprints/sprint-1/concepts/prompt-engineering.mdx',
      videoUrl: 'https://www.youtube.com/watch?v=example',
      tags: ['prompting', 'practical'],
    },
    {
      slug: 'api-integration',
      title: 'LLM API Integration',
      description: 'Connecting to Claude, OpenAI, and other providers',
      duration: '25 min',
      order: 4,
      content: '/content/sprints/sprint-1/concepts/api-integration.mdx',
      tags: ['coding', 'apis'],
    },
    {
      slug: 'streaming-responses',
      title: 'Streaming and Async Patterns',
      description: 'Building responsive AI interfaces with streaming',
      duration: '20 min',
      order: 5,
      content: '/content/sprints/sprint-1/concepts/streaming-responses.mdx',
      tags: ['coding', 'ux'],
    },
  ],
  labs: [
    {
      slug: 'compare-models',
      title: 'Compare LLM Outputs',
      description: 'Test the same prompt with GPT-4 and Claude',
      difficulty: 'beginner',
      estimatedTime: '30 min',
      order: 1,
    },
    {
      slug: 'prompt-library',
      title: 'Build a Prompt Library',
      description: 'Create reusable prompt templates',
      difficulty: 'beginner',
      estimatedTime: '45 min',
      order: 2,
    },
    {
      slug: 'streaming-chat',
      title: 'Streaming Chat Prototype',
      description: 'Build a simple streaming chat interface',
      difficulty: 'intermediate',
      estimatedTime: '60 min',
      order: 3,
    },
  ],
  project: {
    number: 1,
    title: 'AI Chat Assistant',
    description: 'Build a production-ready chat application with Claude API',
    estimatedHours: 12,
    techStack: ['Next.js', 'Claude API', 'Vercel AI SDK', 'PostgreSQL', 'Tailwind'],
    objectives: [
      'Integrate Claude API for chat completions',
      'Implement streaming responses',
      'Build conversation history',
      'Add system prompt customization',
      'Deploy to production',
    ],
    deliverables: [
      'Working chat interface with streaming',
      'Conversation persistence',
      'Deployed app with public URL',
      'GitHub repository',
    ],
  },
}
```

**Step 4: Create first concept content**

Create `content/sprints/sprint-1/concepts/llm-fundamentals.mdx`:
```mdx
# How Large Language Models Work

Large Language Models (LLMs) like Claude and GPT-4 are neural networks trained on vast amounts of text data. Understanding how they work helps you use them more effectively.

## Key Concepts

### 1. Transformers Architecture

LLMs are built on the **Transformer** architecture, introduced in the paper "Attention is All You Need" (2017).

Key components:
- **Attention Mechanism**: Allows the model to focus on relevant parts of the input
- **Self-Attention**: Each word can "attend to" other words in the sentence
- **Multi-Head Attention**: Multiple attention mechanisms working in parallel

### 2. Training Process

LLMs learn by predicting the next word (token) in a sequence:

```
Input: "The cat sat on the"
Model predicts: "mat" (or "floor", "chair", etc.)
```

This simple task, repeated billions of times across massive datasets, teaches the model:
- Grammar and syntax
- Facts about the world
- Reasoning patterns
- Writing styles

### 3. How Text Generation Works

When you send a prompt to an LLM:

1. **Tokenization**: Your text is split into tokens
2. **Encoding**: Tokens are converted to numerical vectors
3. **Processing**: The model processes these vectors through many layers
4. **Prediction**: It predicts probability distributions for the next token
5. **Sampling**: A token is selected (with some randomness)
6. **Repeat**: Steps 3-5 repeat until a stop condition is met

## Important Implications

### Models Don't "Know" Things

LLMs don't have a database of facts. They predict plausible continuations based on patterns in training data.

**This means:**
- They can be confidently wrong (hallucinations)
- Responses may vary even with identical inputs
- They don't have access to real-time information (unless connected to tools)

### Temperature Controls Randomness

The `temperature` parameter (0-1) controls how "creative" the model is:

- **Low (0-0.3)**: Deterministic, consistent, factual
- **Medium (0.5-0.7)**: Balanced creativity and coherence
- **High (0.8-1.0)**: Creative, varied, sometimes chaotic

## Practical Takeaways

✅ **Do:**
- Be specific in your prompts
- Verify important facts
- Use low temperature for factual tasks
- Use higher temperature for creative tasks

❌ **Don't:**
- Assume the model has current information
- Trust outputs blindly for critical decisions
- Expect perfect consistency

## Next Steps

Now that you understand how LLMs work, let's dive into **tokens and context windows** to understand their limitations.
```

**Step 5: Create second concept**

Create `content/sprints/sprint-1/concepts/tokens-context.mdx`:
```mdx
# Tokens and Context Windows

Understanding tokens is crucial for working with LLMs effectively and managing costs.

## What Are Tokens?

A **token** is the basic unit of text that an LLM processes. It's not always a word!

### Tokenization Examples

```
"Hello, world!" → ["Hello", ",", " world", "!"] (4 tokens)

"ChatGPT" → ["Chat", "GPT"] (2 tokens)

"AI" → ["AI"] (1 token)

"artificial intelligence" → ["art", "ificial", " intelligence"] (3 tokens)
```

### Rules of Thumb

- 1 token ≈ 4 characters in English
- 1 token ≈ ¾ of a word on average
- 100 tokens ≈ 75 words

## Context Windows

The **context window** is the maximum number of tokens an LLM can process at once (input + output).

### Model Context Limits (as of 2024)

| Model | Context Window | Approximate Pages |
|-------|---------------|-------------------|
| Claude 3.5 Sonnet | 200K tokens | ~500 pages |
| GPT-4 Turbo | 128K tokens | ~320 pages |
| GPT-3.5 | 16K tokens | ~40 pages |

## Why This Matters

### 1. Cost Management

You pay per token (input + output):

```typescript
// Example pricing (simplified)
const inputCost = inputTokens * $0.003 / 1000
const outputCost = outputTokens * $0.015 / 1000
const totalCost = inputCost + outputCost
```

**Cost optimization tips:**
- Keep prompts concise
- Summarize long conversations
- Cache common prompts
- Use cheaper models when possible

### 2. Context Management

If your conversation exceeds the context window:

```typescript
// ❌ This will fail
const hugeConversation = Array(200000).fill("token")
// Error: Context length exceeded

// ✅ Better approach
function trimConversation(messages, maxTokens = 10000) {
  // Keep only recent messages
  return messages.slice(-20)
}
```

### 3. Response Quality

More context isn't always better:

- **Too little context**: Model lacks necessary information
- **Too much context**: Important details get "lost in the middle"
- **Optimal**: Provide relevant, focused context

## Practical Strategies

### Strategy 1: Sliding Window

Keep only the most recent N messages:

```typescript
const MAX_MESSAGES = 10

function getRecentMessages(allMessages) {
  return allMessages.slice(-MAX_MESSAGES)
}
```

### Strategy 2: Summarization

Summarize older messages:

```typescript
async function summarizeHistory(oldMessages) {
  const summary = await llm.chat({
    prompt: `Summarize these messages: ${oldMessages}`,
  })
  return summary
}
```

### Strategy 3: Selective Context

Only include messages relevant to current topic:

```typescript
function getRelevantContext(messages, currentQuery) {
  return messages.filter(msg =>
    isRelevant(msg.content, currentQuery)
  )
}
```

## Estimating Token Count

You can estimate tokens before making API calls:

```typescript
// Rough estimation
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Or use a library
import { encode } from 'gpt-tokenizer'
const tokens = encode(text).length
```

## Key Takeaways

✅ **Remember:**
- Tokens ≠ words
- Context windows have limits
- More context = higher costs
- Manage conversation history strategically

❌ **Avoid:**
- Sending entire document histories
- Ignoring token counts
- Exceeding context windows

## Next Steps

Now let's learn **prompt engineering** to get better outputs with fewer tokens!
```

**Step 6: Create third concept**

Create `content/sprints/sprint-1/concepts/prompt-engineering.mdx`:
```mdx
# Prompt Engineering Basics

Prompt engineering is the art and science of crafting inputs that get you the best outputs from LLMs.

## Core Principles

### 1. Be Specific and Clear

❌ **Vague:**
```
Write about dogs
```

✅ **Specific:**
```
Write a 3-paragraph article about golden retrievers:
- Paragraph 1: Breed history and origin
- Paragraph 2: Temperament and personality traits
- Paragraph 3: Care requirements and health considerations

Use a friendly, informative tone suitable for first-time dog owners.
```

### 2. Provide Examples (Few-Shot)

**Zero-shot** (no examples):
```
Convert this to past tense: "I walk to the store"
```

**Few-shot** (with examples):
```
Convert these sentences to past tense:

Present: I walk to the store
Past: I walked to the store

Present: She eats breakfast
Past: She ate breakfast

Present: They run in the park
Past: [Your turn]
```

### 3. Use Structure and Format

```
Task: Analyze this code for bugs

Code:
```python
def calculate_average(numbers):
    return sum(numbers) / len(numbers)
```

Analysis format:
1. Potential bugs: [list]
2. Edge cases not handled: [list]
3. Recommended fixes: [code]
```

## Advanced Techniques

### Chain-of-Thought (CoT)

Get better reasoning by asking the model to think step-by-step:

```
Problem: If a train travels 120 miles in 2 hours, and then 180 miles
in 3 hours, what is the average speed?

Solve this step by step:
1. Calculate speed for first segment
2. Calculate speed for second segment
3. Calculate overall average speed
4. Show your work
```

### System Prompts

Set behavior and constraints upfront:

```typescript
const systemPrompt = `You are an expert Python tutor. Your responses should:
- Be beginner-friendly with clear explanations
- Include code examples
- Point out common mistakes
- Suggest best practices
- Keep responses under 200 words unless asked for detail`

const userPrompt = "How do I read a file in Python?"
```

### Output Formatting

Request specific formats:

```
List 5 benefits of exercise in JSON format:

{
  "benefits": [
    {
      "category": "physical|mental|social",
      "title": "Benefit name",
      "description": "Brief explanation"
    }
  ]
}
```

## Common Patterns

### 1. Role Assignment

```
You are a senior software architect reviewing a pull request.
Review this code and provide constructive feedback on:
- Architecture decisions
- Code quality
- Potential bugs
- Performance considerations
```

### 2. Constraints

```
Explain quantum computing to a 10-year-old.

Constraints:
- Use simple words
- Use analogies from everyday life
- Max 100 words
- No technical jargon
```

### 3. Iterative Refinement

Start broad, then narrow:

```
// First prompt
"Brainstorm 10 ideas for a mobile app"

// Second prompt (after seeing results)
"Expand on idea #3. What features would it need?"

// Third prompt
"Create a technical specification for the user profile feature"
```

## Anti-Patterns to Avoid

❌ **Being too vague:**
```
"Make this better"
```

❌ **Contradictory instructions:**
```
"Write a detailed summary" (summary should be brief!)
```

❌ **Expecting mind reading:**
```
"Fix the bug" (without showing code or describing the bug)
```

❌ **Ignoring context limits:**
```
[Pasting 50 pages of documentation]
"Summarize this"
```

## Prompt Template Library

Here are reusable templates:

### Code Review Template
```
Review this {{language}} code:

```{{language}}
{{code}}
```

Focus on:
1. Correctness
2. Performance
3. Readability
4. Best practices

Provide specific suggestions for improvement.
```

### Explanation Template
```
Explain {{concept}} in {{complexity}} terms.

Format:
1. What it is (1 sentence)
2. Why it matters
3. Simple example
4. Common use cases
```

### Debugging Template
```
I'm getting this error:
```
{{error_message}}
```

In this code:
```{{language}}
{{code}}
```

Expected behavior: {{expected}}
Actual behavior: {{actual}}

What's wrong and how do I fix it?
```

## Measuring Prompt Quality

Good prompts should:
- ✅ Produce consistent results
- ✅ Be clear to a human reader
- ✅ Require minimal iteration
- ✅ Work across different models
- ✅ Handle edge cases

## Practical Exercise

Try improving this prompt:

**Before:**
```
Write code for login
```

**After:**
```
Create a secure login function in TypeScript:

Requirements:
- Accept email and password
- Validate input format
- Hash password with bcrypt
- Return JWT token on success
- Return error message on failure

Include error handling and TypeScript types.
```

## Key Takeaways

✅ **Do:**
- Be specific and structured
- Use examples when possible
- Request specific formats
- Test and iterate on prompts

❌ **Don't:**
- Be vague or ambiguous
- Assume the model knows context
- Ignore token costs
- Copy prompts without adapting

## Next Steps

Let's learn how to **integrate LLM APIs** into your applications!
```

**Step 7: Commit**

```bash
git add content/
git commit -m "feat: add Sprint 1 content structure with first 3 concepts"
```

---

## Task 3: Create Content Loader Utilities

**Files:**
- Create: `lib/content/loader.ts`
- Create: `lib/content/mdx.ts`

**Step 1: Create content loader**

Create `lib/content/loader.ts`:
```typescript
import { Sprint } from '@/types/learning'
import { sprint1 } from '@/content/sprints/sprint-1'

// In-memory content registry
const SPRINTS: Record<number, Sprint> = {
  1: sprint1,
  // 2: sprint2, // To be added later
  // 3: sprint3,
}

export function getSprint(sprintNumber: number): Sprint | null {
  return SPRINTS[sprintNumber] || null
}

export function getAllSprints(): Sprint[] {
  return Object.values(SPRINTS).sort((a, b) => a.number - b.number)
}

export function getConcept(sprintNumber: number, conceptSlug: string) {
  const sprint = getSprint(sprintNumber)
  return sprint?.concepts.find(c => c.slug === conceptSlug) || null
}

export function getLab(sprintNumber: number, labSlug: string) {
  const sprint = getSprint(sprintNumber)
  return sprint?.labs.find(l => l.slug === labSlug) || null
}

export function getNextConcept(sprintNumber: number, currentSlug: string) {
  const sprint = getSprint(sprintNumber)
  if (!sprint) return null

  const currentIndex = sprint.concepts.findIndex(c => c.slug === currentSlug)
  if (currentIndex === -1 || currentIndex === sprint.concepts.length - 1) {
    return null
  }

  return sprint.concepts[currentIndex + 1]
}

export function getPreviousConcept(sprintNumber: number, currentSlug: string) {
  const sprint = getSprint(sprintNumber)
  if (!sprint) return null

  const currentIndex = sprint.concepts.findIndex(c => c.slug === currentSlug)
  if (currentIndex <= 0) return null

  return sprint.concepts[currentIndex - 1]
}
```

**Step 2: Create MDX utilities**

Create `lib/content/mdx.ts`:
```typescript
import fs from 'fs'
import path from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

export async function loadMDXContent(contentPath: string) {
  const fullPath = path.join(process.cwd(), contentPath)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const source = fs.readFileSync(fullPath, 'utf-8')

  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
      },
    },
  })

  return content
}
```

**Step 3: Install MDX dependencies**

Run:
```bash
npm install next-mdx-remote
```

**Step 4: Commit**

```bash
git add lib/content/
git commit -m "feat: add content loader utilities for sprints and concepts"
```

---

## Task 4: Create Progress Tracking Utilities

**Files:**
- Create: `lib/progress/tracker.ts`
- Create: `app/api/progress/route.ts`

**Step 1: Create progress tracking utilities**

Create `lib/progress/tracker.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { UserProgress } from '@/types/learning'

export async function getUserProgress(
  userId: string,
  sprintNumber: number
): Promise<UserProgress | null> {
  const supabase = createClient()

  const { data } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('sprint_number', sprintNumber)
    .single()

  if (!data) return null

  const totalConcepts = 5 // From sprint1.concepts.length
  const completedCount = data.concepts_completed?.length || 0
  const percentComplete = Math.round((completedCount / totalConcepts) * 100)

  return {
    sprintNumber: data.sprint_number,
    status: data.status,
    conceptsCompleted: data.concepts_completed || [],
    labsCompleted: data.labs_completed || [],
    startedAt: data.started_at,
    completedAt: data.completed_at,
    percentComplete,
  }
}

export async function initializeSprintProgress(
  userId: string,
  sprintNumber: number
): Promise<void> {
  const supabase = createClient()

  await supabase.from('user_progress').upsert({
    user_id: userId,
    sprint_number: sprintNumber,
    status: 'in_progress',
    started_at: new Date().toISOString(),
  })

  await supabase.from('learning_events').insert({
    user_id: userId,
    event_type: 'sprint.started',
    event_data: { sprint_number: sprintNumber },
  })
}

export async function markConceptComplete(
  userId: string,
  sprintNumber: number,
  conceptSlug: string,
  timeSpentSeconds?: number
): Promise<void> {
  const supabase = createClient()

  // Add to concept_completions
  await supabase.from('concept_completions').upsert({
    user_id: userId,
    sprint_number: sprintNumber,
    concept_slug: conceptSlug,
    time_spent_seconds: timeSpentSeconds,
    completed_at: new Date().toISOString(),
  })

  // Update user_progress
  const { data: progress } = await supabase
    .from('user_progress')
    .select('concepts_completed')
    .eq('user_id', userId)
    .eq('sprint_number', sprintNumber)
    .single()

  const completed = progress?.concepts_completed || []
  if (!completed.includes(conceptSlug)) {
    completed.push(conceptSlug)

    await supabase
      .from('user_progress')
      .update({ concepts_completed: completed })
      .eq('user_id', userId)
      .eq('sprint_number', sprintNumber)
  }

  // Log event
  await supabase.from('learning_events').insert({
    user_id: userId,
    event_type: 'concept.completed',
    event_data: {
      sprint_number: sprintNumber,
      concept_slug: conceptSlug,
      time_spent_seconds: timeSpentSeconds,
    },
  })
}

export async function markLabComplete(
  userId: string,
  sprintNumber: number,
  labSlug: string
): Promise<void> {
  const supabase = createClient()

  const { data: progress } = await supabase
    .from('user_progress')
    .select('labs_completed')
    .eq('user_id', userId)
    .eq('sprint_number', sprintNumber)
    .single()

  const completed = progress?.labs_completed || []
  if (!completed.includes(labSlug)) {
    completed.push(labSlug)

    await supabase
      .from('user_progress')
      .update({ labs_completed: completed })
      .eq('user_id', userId)
      .eq('sprint_number', sprintNumber)
  }

  await supabase.from('learning_events').insert({
    user_id: userId,
    event_type: 'lab.completed',
    event_data: { sprint_number: sprintNumber, lab_slug: labSlug },
  })
}
```

**Step 2: Create progress API routes**

Create `app/api/progress/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { markConceptComplete, initializeSprintProgress } from '@/lib/progress/tracker'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, sprintNumber, conceptSlug, timeSpent } = await request.json()

    if (action === 'start_sprint') {
      await initializeSprintProgress(user.id, sprintNumber)
      return NextResponse.json({ success: true })
    }

    if (action === 'complete_concept') {
      await markConceptComplete(user.id, sprintNumber, conceptSlug, timeSpent)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Progress API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 3: Commit**

```bash
git add lib/progress/ app/api/progress/
git commit -m "feat: add progress tracking utilities and API"
```

---

## Task 5: Create Sprint Overview Page

**Files:**
- Create: `app/(dashboard)/sprint/[number]/page.tsx`
- Create: `components/learning/ConceptCard.tsx`
- Create: `components/learning/ProgressBar.tsx`

**Step 1: Create ProgressBar component**

Create `components/learning/ProgressBar.tsx`:
```typescript
import { Progress } from '@/components/ui/progress'

interface ProgressBarProps {
  completed: number
  total: number
  label?: string
}

export function ProgressBar({ completed, total, label }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">
          {label || 'Progress'}
        </span>
        <span className="font-medium text-slate-900">
          {completed}/{total} ({percentage}%)
        </span>
      </div>
      <Progress value={percentage} />
    </div>
  )
}
```

**Step 2: Create ConceptCard component**

Create `components/learning/ConceptCard.tsx`:
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import Link from 'next/link'

interface ConceptCardProps {
  sprintNumber: number
  slug: string
  title: string
  description: string
  duration: string
  tags: string[]
  isCompleted: boolean
  order: number
}

export function ConceptCard({
  sprintNumber,
  slug,
  title,
  description,
  duration,
  tags,
  isCompleted,
  order,
}: ConceptCardProps) {
  return (
    <Link href={`/sprint/${sprintNumber}/concept/${slug}`}>
      <Card className="hover:border-blue-300 transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6 text-slate-300" />
              )}
              <div>
                <div className="text-xs text-slate-500 mb-1">
                  Lesson {order}
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </div>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Clock className="h-4 w-4 mr-1" />
              {duration}
            </div>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

**Step 3: Install badge and lucide icons**

Run:
```bash
npx shadcn-ui@latest add badge
npm install lucide-react
```

**Step 4: Create sprint overview page**

Create `app/(dashboard)/sprint/[number]/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSprint } from '@/lib/content/loader'
import { getUserProgress, initializeSprintProgress } from '@/lib/progress/tracker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConceptCard } from '@/components/learning/ConceptCard'
import { ProgressBar } from '@/components/learning/ProgressBar'

export default async function SprintPage({ params }: { params: { number: string } }) {
  const sprintNumber = parseInt(params.number)
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const sprint = getSprint(sprintNumber)
  if (!sprint) {
    return <div>Sprint not found</div>
  }

  // Get user progress
  let progress = await getUserProgress(user.id, sprintNumber)

  // Initialize if not started
  if (!progress) {
    await initializeSprintProgress(user.id, sprintNumber)
    progress = await getUserProgress(user.id, sprintNumber)
  }

  const completedConcepts = progress?.conceptsCompleted || []
  const completedLabs = progress?.labsCompleted || []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="text-sm text-slate-600 mb-2">Sprint {sprint.number}</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {sprint.title}
        </h1>
        <p className="text-slate-600 text-lg">{sprint.description}</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>
            {sprint.duration} • {sprint.concepts.length} concepts • {sprint.labs.length} labs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProgressBar
            completed={completedConcepts.length}
            total={sprint.concepts.length}
            label="Concepts"
          />
          <ProgressBar
            completed={completedLabs.length}
            total={sprint.labs.length}
            label="Labs"
          />
        </CardContent>
      </Card>

      {/* Concepts */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Concepts</h2>
        <div className="space-y-3">
          {sprint.concepts.map((concept) => (
            <ConceptCard
              key={concept.slug}
              sprintNumber={sprintNumber}
              slug={concept.slug}
              title={concept.title}
              description={concept.description}
              duration={concept.duration}
              tags={concept.tags}
              isCompleted={completedConcepts.includes(concept.slug)}
              order={concept.order}
            />
          ))}
        </div>
      </div>

      {/* Labs */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Labs</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {sprint.labs.map((lab) => (
            <Card key={lab.slug}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={lab.difficulty === 'beginner' ? 'default' : 'secondary'}>
                    {lab.difficulty}
                  </Badge>
                  {completedLabs.includes(lab.slug) && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <CardTitle className="text-lg">{lab.title}</CardTitle>
                <CardDescription>{lab.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600 mb-3">
                  ⏱️ {lab.estimatedTime}
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Project */}
      {sprint.project && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="text-sm text-blue-600 font-medium mb-2">
              Final Project
            </div>
            <CardTitle className="text-2xl">{sprint.project.title}</CardTitle>
            <CardDescription>{sprint.project.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-medium text-slate-900 mb-2">Tech Stack:</h3>
              <div className="flex gap-2 flex-wrap">
                {sprint.project.techStack.map(tech => (
                  <Badge key={tech} variant="outline">{tech}</Badge>
                ))}
              </div>
            </div>
            <Button variant="outline" disabled>
              View Project Requirements
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add sprint overview page with progress tracking"
```

---

## Task 6: Create Concept Detail Page

**Files:**
- Create: `app/(dashboard)/sprint/[number]/concept/[slug]/page.tsx`
- Create: `components/learning/ConceptNavigation.tsx`
- Create: `components/learning/MarkCompleteButton.tsx`

**Step 6 continues in next task due to length...**

Let me continue with the rest of Week 4 planning.

**Step 1: Create MarkCompleteButton component**

Create `components/learning/MarkCompleteButton.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface MarkCompleteButtonProps {
  sprintNumber: number
  conceptSlug: string
  isCompleted: boolean
  onComplete?: () => void
}

export function MarkCompleteButton({
  sprintNumber,
  conceptSlug,
  isCompleted,
  onComplete,
}: MarkCompleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(isCompleted)

  const handleMarkComplete = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_concept',
          sprintNumber,
          conceptSlug,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark complete')
      }

      setCompleted(true)
      toast.success('Concept marked as complete!')
      onComplete?.()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to mark complete')
    } finally {
      setLoading(false)
    }
  }

  if (completed) {
    return (
      <Button disabled className="gap-2">
        <CheckCircle2 className="h-4 w-4" />
        Completed
      </Button>
    )
  }

  return (
    <Button
      onClick={handleMarkComplete}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {loading ? 'Marking...' : 'Mark as Complete'}
    </Button>
  )
}
```

**Step 2: Create ConceptNavigation component**

Create `components/learning/ConceptNavigation.tsx`:
```typescript
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface ConceptNavigationProps {
  sprintNumber: number
  previousSlug?: string
  nextSlug?: string
  previousTitle?: string
  nextTitle?: string
}

export function ConceptNavigation({
  sprintNumber,
  previousSlug,
  nextSlug,
  previousTitle,
  nextTitle,
}: ConceptNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-6 border-t">
      {previousSlug ? (
        <Link href={`/sprint/${sprintNumber}/concept/${previousSlug}`}>
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            <div className="text-left">
              <div className="text-xs text-slate-500">Previous</div>
              <div className="text-sm">{previousTitle}</div>
            </div>
          </Button>
        </Link>
      ) : (
        <div />
      )}

      {nextSlug ? (
        <Link href={`/sprint/${sprintNumber}/concept/${nextSlug}`}>
          <Button variant="outline" className="gap-2">
            <div className="text-right">
              <div className="text-xs text-slate-500">Next</div>
              <div className="text-sm">{nextTitle}</div>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Link href={`/sprint/${sprintNumber}`}>
          <Button variant="outline">
            Back to Sprint Overview
          </Button>
        </Link>
      )}
    </div>
  )
}
```

**Step 3: Create concept detail page**

Create `app/(dashboard)/sprint/[number]/concept/[slug]/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSprint, getConcept, getNextConcept, getPreviousConcept } from '@/lib/content/loader'
import { getUserProgress } from '@/lib/progress/tracker'
import { loadMDXContent } from '@/lib/content/mdx'
import { MarkCompleteButton } from '@/components/learning/MarkCompleteButton'
import { ConceptNavigation } from '@/components/learning/ConceptNavigation'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

export default async function ConceptPage({
  params,
}: {
  params: { number: string; slug: string }
}) {
  const sprintNumber = parseInt(params.number)
  const conceptSlug = params.slug

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const concept = getConcept(sprintNumber, conceptSlug)
  if (!concept) {
    return <div>Concept not found</div>
  }

  const progress = await getUserProgress(user.id, sprintNumber)
  const isCompleted = progress?.conceptsCompleted.includes(conceptSlug) || false

  // Load MDX content
  const content = concept.content
    ? await loadMDXContent(concept.content)
    : null

  // Get navigation
  const nextConcept = getNextConcept(sprintNumber, conceptSlug)
  const previousConcept = getPreviousConcept(sprintNumber, conceptSlug)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm text-slate-600 mb-2">
          Sprint {sprintNumber} • Lesson {concept.order}
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          {concept.title}
        </h1>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center text-slate-600">
            <Clock className="h-4 w-4 mr-1" />
            {concept.duration}
          </div>
          <div className="flex gap-2">
            {concept.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <p className="text-lg text-slate-600">{concept.description}</p>
      </div>

      {/* Video if available */}
      {concept.videoUrl && (
        <div className="mb-8 aspect-video rounded-lg overflow-hidden bg-slate-900">
          <iframe
            src={concept.videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-slate max-w-none mb-8">
        {content || (
          <div className="text-slate-600">
            Content coming soon...
          </div>
        )}
      </div>

      {/* Mark Complete Button */}
      <div className="mb-8">
        <MarkCompleteButton
          sprintNumber={sprintNumber}
          conceptSlug={conceptSlug}
          isCompleted={isCompleted}
        />
      </div>

      {/* Navigation */}
      <ConceptNavigation
        sprintNumber={sprintNumber}
        previousSlug={previousConcept?.slug}
        previousTitle={previousConcept?.title}
        nextSlug={nextConcept?.slug}
        nextTitle={nextConcept?.title}
      />
    </div>
  )
}
```

**Step 4: Add prose styling**

Update `tailwind.config.ts` to add typography:
```bash
npm install @tailwindcss/typography
```

Update `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add concept detail page with MDX rendering and navigation"
```

---

## Task 7: Update Dashboard with Sprint Access

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

**Step 1: Update dashboard to show Sprint 1**

Update the Sprint 1 card in `app/(dashboard)/dashboard/page.tsx`:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Sprint 1</CardTitle>
    <CardDescription>Foundation + Chat Assistant</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-slate-600 mb-4">
      Learn LLM fundamentals and build your first AI product
    </p>
    {diagnosisCompleted ? (
      <Link href="/sprint/1">
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          {progress?.sprint_1_started ? 'Continue' : 'Start Sprint'}
        </Button>
      </Link>
    ) : (
      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
        Complete diagnosis first
      </span>
    )}
  </CardContent>
</Card>
```

**Step 2: Show progress if sprint started**

Add progress fetching logic:
```typescript
// After fetching diagnosis
const { data: sprint1Progress } = await supabase
  .from('user_progress')
  .select('*')
  .eq('user_id', user!.id)
  .eq('sprint_number', 1)
  .single()

const sprint1Started = !!sprint1Progress
```

**Step 3: Commit**

```bash
git add app/
git commit -m "feat: update dashboard to link to Sprint 1"
```

---

## Task 8: Add Global MDX Styles

**Files:**
- Create: `app/globals.css` (update)

**Step 1: Add code highlighting styles**

Update `app/globals.css` - add at the end:
```css
/* Code highlighting */
@import 'highlight.js/styles/github-dark.css';

/* MDX Prose customization */
.prose {
  @apply text-slate-800;
}

.prose h1 {
  @apply text-3xl font-bold text-slate-900 mt-8 mb-4;
}

.prose h2 {
  @apply text-2xl font-bold text-slate-900 mt-6 mb-3;
}

.prose h3 {
  @apply text-xl font-semibold text-slate-900 mt-4 mb-2;
}

.prose p {
  @apply mb-4 leading-relaxed;
}

.prose code {
  @apply bg-slate-100 text-slate-900 px-1 py-0.5 rounded text-sm;
}

.prose pre {
  @apply bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4;
}

.prose pre code {
  @apply bg-transparent text-slate-100 p-0;
}

.prose ul {
  @apply list-disc pl-6 mb-4;
}

.prose ol {
  @apply list-decimal pl-6 mb-4;
}

.prose li {
  @apply mb-2;
}

.prose blockquote {
  @apply border-l-4 border-blue-500 pl-4 italic text-slate-600 my-4;
}

.prose table {
  @apply w-full border-collapse mb-4;
}

.prose th {
  @apply bg-slate-100 border border-slate-300 px-4 py-2 text-left font-semibold;
}

.prose td {
  @apply border border-slate-300 px-4 py-2;
}

.prose a {
  @apply text-blue-600 hover:underline;
}

/* Custom badges */
.prose p:has(> strong:first-child) {
  @apply inline-flex items-center gap-2;
}
```

**Step 2: Install highlight.js**

Run:
```bash
npm install highlight.js
```

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add MDX prose styles with code highlighting"
```

---

## Task 9: Testing and Polish

**Files:**
- Create: `README-WEEK4.md`

**Step 1: End-to-end testing**

Test checklist:
1. Log in to dashboard
2. Click "Start Sprint" on Sprint 1 (if diagnosis complete)
3. View sprint overview with progress bars
4. Click on first concept
5. Read concept content
6. Mark as complete
7. Verify progress bar updates
8. Navigate to next concept
9. Go back to sprint overview
10. Verify completion status saved

Expected: Full learning flow works

**Step 2: Test progress persistence**

Progress test:
1. Mark a concept complete
2. Log out
3. Log back in
4. Navigate to sprint
5. Verify concept still shows as complete

Expected: Progress persists across sessions

**Step 3: Create Week 4 documentation**

Create `README-WEEK4.md`:
```markdown
# Week 4: Learning Platform Core Implementation

## Completed Features

- ✅ Database schema for progress tracking
- ✅ Content management system (file-based with MDX)
- ✅ Sprint 1 structure with 5 concepts
- ✅ MDX content rendering with syntax highlighting
- ✅ Progress tracking (concepts, labs, sprints)
- ✅ Sprint overview page
- ✅ Concept detail pages
- ✅ Navigation between concepts
- ✅ Mark complete functionality
- ✅ Dashboard integration

## Architecture

```
Content (MDX files) → Loader → Sprint Pages → Progress Tracking → Database
```

### Content Structure

```
content/
└── sprints/
    └── sprint-1/
        ├── index.ts (metadata)
        └── concepts/
            ├── llm-fundamentals.mdx
            ├── tokens-context.mdx
            └── prompt-engineering.mdx
```

### Database Tables

**user_progress**
- Tracks sprint-level progress
- Lists completed concepts/labs
- Records start/completion times

**concept_completions**
- Detailed concept completion tracking
- Time spent per concept

**lab_attempts**
- Lab submission history
- Pass/fail status
- AI feedback (for future)

## Adding New Content

### Add a New Concept

1. Create MDX file in `content/sprints/sprint-N/concepts/`
2. Add metadata to `content/sprints/sprint-N/index.ts`:

```typescript
{
  slug: 'new-concept',
  title: 'New Concept',
  description: 'Description here',
  duration: '15 min',
  order: 6,
  content: '/content/sprints/sprint-1/concepts/new-concept.mdx',
  tags: ['tag1', 'tag2'],
}
```

### Add a New Sprint

1. Create `content/sprints/sprint-N/` directory
2. Create `index.ts` with sprint metadata
3. Add concepts and labs
4. Register in `lib/content/loader.ts`

## API Endpoints

### POST /api/progress
Track user progress

**Actions:**
- `start_sprint`: Initialize sprint progress
- `complete_concept`: Mark concept as complete
- `complete_lab`: Mark lab as complete

## Testing

Test learning flow:
```bash
npm run dev
# Navigate to /sprint/1
# Click on concepts
# Mark complete
# Verify progress saves
```

## Next Steps

Week 5 will add:
- AI Mentor context integration (knows which sprint you're on)
- Code Review AI
- Lab environment with code execution
- Project submission flow
```

**Step 4: Final commit**

```bash
git add .
git commit -m "chore: Week 4 complete - learning platform core ready"
git push
```

---

## Week 4 Completion Checklist

- [ ] Database schema for progress tracking
- [ ] MDX configuration and dependencies
- [ ] Sprint 1 content structure created
- [ ] 3 concept MDX files written
- [ ] Content loader utilities
- [ ] Progress tracking utilities
- [ ] Sprint overview page
- [ ] Concept detail pages
- [ ] Navigation components
- [ ] Mark complete functionality
- [ ] Dashboard updated with Sprint 1 link
- [ ] MDX prose styling
- [ ] End-to-end testing
- [ ] Documentation created
- [ ] Code pushed to GitHub

---

## Next Steps (Week 5 - AI Mentor + Code Review)

After Week 4 is complete, proceed to Week 5 which will add:
- AI Mentor with context awareness (knows current sprint/concept)
- Code Review AI for project submissions
- GitHub integration for code fetching
- Structured feedback UI
- Review history and iterations

This completes the core content delivery and combines it with AI-powered assistance for a complete learning experience.
