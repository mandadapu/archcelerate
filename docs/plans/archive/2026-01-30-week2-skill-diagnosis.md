# Week 2: Skill Diagnosis (Sprint 0) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build complete skill diagnosis flow that assesses user AI knowledge and generates personalized learning paths

**Architecture:** Interactive quiz with 15-20 questions, Claude API integration for analysis, personalized results stored in database

**Tech Stack:** Next.js, TypeScript, Claude API, Supabase, Tailwind CSS, shadcn/ui

**Prerequisites:** Week 1 must be complete (auth, dashboard, database)

---

## Task 1: Extend Database Schema for Diagnosis

**Files:**
- Create: `supabase/migrations/20260131_skill_diagnosis.sql`
- Update: `types/database.ts`

**Step 1: Create skill diagnosis migration**

Create `supabase/migrations/20260131_skill_diagnosis.sql`:
```sql
-- Skill Diagnosis Results
CREATE TABLE public.skill_diagnosis (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    quiz_answers JSONB NOT NULL,
    skill_scores JSONB NOT NULL,
    recommended_path VARCHAR(50) NOT NULL,
    completed_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.skill_diagnosis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own diagnosis"
ON public.skill_diagnosis
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnosis"
ON public.skill_diagnosis
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnosis"
ON public.skill_diagnosis
FOR UPDATE
USING (auth.uid() = user_id);

-- Add onboarded flag to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS diagnosis_completed BOOLEAN DEFAULT FALSE;
```

**Step 2: Apply migration**

Manual action:
1. Go to Supabase dashboard → SQL Editor
2. Paste and run the migration
3. Verify table created

Expected: `skill_diagnosis` table exists with RLS policies

**Step 3: Update TypeScript types**

Update `types/database.ts` - add to Tables interface:
```typescript
skill_diagnosis: {
  Row: {
    user_id: string
    quiz_answers: Json
    skill_scores: Json
    recommended_path: string
    completed_at: string
  }
  Insert: {
    user_id: string
    quiz_answers: Json
    skill_scores: Json
    recommended_path: string
    completed_at?: string
  }
  Update: {
    user_id?: string
    quiz_answers?: Json
    skill_scores?: Json
    recommended_path?: string
    completed_at?: string
  }
}
```

Also update `users` table Row type:
```typescript
users: {
  Row: {
    id: string
    email: string
    name: string | null
    experience_years: number | null
    target_role: string | null
    onboarded_at: string | null
    diagnosis_completed: boolean | null  // Add this
    created_at: string
  }
  // ... rest of Insert and Update
}
```

**Step 4: Create diagnosis types**

Create `types/diagnosis.ts`:
```typescript
export type QuestionType = 'single-choice' | 'multiple-choice' | 'code-evaluation'

export interface QuizQuestion {
  id: string
  type: QuestionType
  question: string
  code?: string
  options: {
    id: string
    text: string
  }[]
  correctAnswers: string[]
  skillArea: SkillArea
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export type SkillArea =
  | 'llm_fundamentals'
  | 'prompt_engineering'
  | 'rag'
  | 'agents'
  | 'multimodal'
  | 'production_ai'

export interface QuizAnswer {
  questionId: string
  selectedOptions: string[]
  isCorrect: boolean
}

export interface SkillScores {
  llm_fundamentals: number
  prompt_engineering: number
  rag: number
  agents: number
  multimodal: number
  production_ai: number
}

export type LearningPath = 'standard' | 'fast-track' | 'foundation-first'

export interface DiagnosisResult {
  userId: string
  answers: QuizAnswer[]
  skillScores: SkillScores
  recommendedPath: LearningPath
  skipConcepts: string[]
  focusAreas: SkillArea[]
  completedAt: string
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add skill diagnosis database schema and types"
```

---

## Task 2: Create Quiz Question Bank

**Files:**
- Create: `lib/quiz/questions.ts`

**Step 1: Create questions data file**

Create `lib/quiz/questions.ts`:
```typescript
import { QuizQuestion } from '@/types/diagnosis'

export const quizQuestions: QuizQuestion[] = [
  // LLM Fundamentals (5 questions)
  {
    id: 'llm-1',
    type: 'single-choice',
    question: 'What is a token in the context of Large Language Models?',
    options: [
      { id: 'a', text: 'A security credential for API access' },
      { id: 'b', text: 'A unit of text that the model processes (word, subword, or character)' },
      { id: 'c', text: 'A special character that marks the end of a sentence' },
      { id: 'd', text: 'A programming variable in the model code' },
    ],
    correctAnswers: ['b'],
    skillArea: 'llm_fundamentals',
    difficulty: 'beginner',
  },
  {
    id: 'llm-2',
    type: 'single-choice',
    question: 'Which statement best describes how LLMs generate text?',
    options: [
      { id: 'a', text: 'They search a database for pre-written responses' },
      { id: 'b', text: 'They predict the next most likely token based on the input' },
      { id: 'c', text: 'They translate human language into a programming language' },
      { id: 'd', text: 'They randomly select words from a vocabulary' },
    ],
    correctAnswers: ['b'],
    skillArea: 'llm_fundamentals',
    difficulty: 'beginner',
  },
  {
    id: 'llm-3',
    type: 'single-choice',
    question: 'What is "temperature" in LLM API settings?',
    options: [
      { id: 'a', text: 'The processing speed of the model' },
      { id: 'b', text: 'A parameter that controls randomness/creativity in outputs (0=deterministic, 1=random)' },
      { id: 'c', text: 'The cost per API request' },
      { id: 'd', text: 'The physical temperature of the server' },
    ],
    correctAnswers: ['b'],
    skillArea: 'llm_fundamentals',
    difficulty: 'intermediate',
  },
  {
    id: 'llm-4',
    type: 'single-choice',
    question: 'What is the primary purpose of the "system prompt" in a chat completion API?',
    options: [
      { id: 'a', text: 'To authenticate the user' },
      { id: 'b', text: 'To set the behavior, personality, and constraints for the AI assistant' },
      { id: 'c', text: 'To specify the programming language for code generation' },
      { id: 'd', text: 'To limit the response length' },
    ],
    correctAnswers: ['b'],
    skillArea: 'llm_fundamentals',
    difficulty: 'beginner',
  },
  {
    id: 'llm-5',
    type: 'single-choice',
    question: 'What happens when you exceed the context window of an LLM?',
    options: [
      { id: 'a', text: 'The model processes it slower' },
      { id: 'b', text: 'You get charged extra fees' },
      { id: 'c', text: 'The API returns an error or truncates the input' },
      { id: 'd', text: 'The model automatically summarizes the content' },
    ],
    correctAnswers: ['c'],
    skillArea: 'llm_fundamentals',
    difficulty: 'intermediate',
  },

  // Prompt Engineering (4 questions)
  {
    id: 'prompt-1',
    type: 'single-choice',
    question: 'What is "few-shot prompting"?',
    options: [
      { id: 'a', text: 'Sending multiple API requests quickly' },
      { id: 'b', text: 'Providing a few examples in the prompt to guide the model behavior' },
      { id: 'c', text: 'Limiting the response to a few sentences' },
      { id: 'd', text: 'Using a small, specialized model' },
    ],
    correctAnswers: ['b'],
    skillArea: 'prompt_engineering',
    difficulty: 'intermediate',
  },
  {
    id: 'prompt-2',
    type: 'multiple-choice',
    question: 'Which techniques can improve LLM output quality? (Select all that apply)',
    options: [
      { id: 'a', text: 'Being specific and clear in your instructions' },
      { id: 'b', text: 'Using vague language to let the AI be creative' },
      { id: 'c', text: 'Providing examples of desired output format' },
      { id: 'd', text: 'Breaking complex tasks into smaller steps (chain-of-thought)' },
    ],
    correctAnswers: ['a', 'c', 'd'],
    skillArea: 'prompt_engineering',
    difficulty: 'intermediate',
  },
  {
    id: 'prompt-3',
    type: 'single-choice',
    question: 'What is "chain-of-thought" prompting?',
    options: [
      { id: 'a', text: 'Linking multiple AI models together' },
      { id: 'b', text: 'Asking the model to explain its reasoning step-by-step before giving an answer' },
      { id: 'c', text: 'Creating a conversation history' },
      { id: 'd', text: 'Chaining API requests sequentially' },
    ],
    correctAnswers: ['b'],
    skillArea: 'prompt_engineering',
    difficulty: 'intermediate',
  },
  {
    id: 'prompt-4',
    type: 'code-evaluation',
    question: 'Which prompt is likely to produce better structured output?',
    code: `// Option A:
"Write about dogs"

// Option B:
"Write a 3-paragraph article about dogs. Format:
Paragraph 1: History of domestication
Paragraph 2: Popular breeds
Paragraph 3: Care tips
Use markdown formatting."`,
    options: [
      { id: 'a', text: 'Option A - gives the AI more creative freedom' },
      { id: 'b', text: 'Option B - provides clear structure and expectations' },
      { id: 'c', text: 'Both are equally effective' },
      { id: 'd', text: 'Neither will work well' },
    ],
    correctAnswers: ['b'],
    skillArea: 'prompt_engineering',
    difficulty: 'beginner',
  },

  // RAG (3 questions)
  {
    id: 'rag-1',
    type: 'single-choice',
    question: 'What does RAG stand for in AI systems?',
    options: [
      { id: 'a', text: 'Random Access Generation' },
      { id: 'b', text: 'Retrieval-Augmented Generation' },
      { id: 'c', text: 'Rapid AI Gateway' },
      { id: 'd', text: 'Recursive Agent Graph' },
    ],
    correctAnswers: ['b'],
    skillArea: 'rag',
    difficulty: 'beginner',
  },
  {
    id: 'rag-2',
    type: 'single-choice',
    question: 'What is the primary purpose of vector embeddings in RAG systems?',
    options: [
      { id: 'a', text: 'To compress text for storage' },
      { id: 'b', text: 'To convert text into numerical representations for semantic similarity search' },
      { id: 'c', text: 'To encrypt sensitive data' },
      { id: 'd', text: 'To translate between languages' },
    ],
    correctAnswers: ['b'],
    skillArea: 'rag',
    difficulty: 'intermediate',
  },
  {
    id: 'rag-3',
    type: 'single-choice',
    question: 'In a RAG pipeline, what happens first?',
    options: [
      { id: 'a', text: 'Generate a response with the LLM' },
      { id: 'b', text: 'Retrieve relevant documents based on the query' },
      { id: 'c', text: 'Summarize the entire knowledge base' },
      { id: 'd', text: 'Train a new model' },
    ],
    correctAnswers: ['b'],
    skillArea: 'rag',
    difficulty: 'beginner',
  },

  // Agents (3 questions)
  {
    id: 'agent-1',
    type: 'single-choice',
    question: 'What is an AI agent in the context of LLM applications?',
    options: [
      { id: 'a', text: 'A person who sells AI software' },
      { id: 'b', text: 'An LLM that can use tools and take actions to accomplish tasks autonomously' },
      { id: 'c', text: 'A type of neural network architecture' },
      { id: 'd', text: 'A cloud service provider' },
    ],
    correctAnswers: ['b'],
    skillArea: 'agents',
    difficulty: 'beginner',
  },
  {
    id: 'agent-2',
    type: 'single-choice',
    question: 'What is "tool calling" (also called function calling) in AI agents?',
    options: [
      { id: 'a', text: 'Calling the API support team' },
      { id: 'b', text: 'The ability for an LLM to invoke external functions or APIs based on the conversation' },
      { id: 'c', text: 'Using multiple LLMs simultaneously' },
      { id: 'd', text: 'A debugging technique' },
    ],
    correctAnswers: ['b'],
    skillArea: 'agents',
    difficulty: 'intermediate',
  },
  {
    id: 'agent-3',
    type: 'single-choice',
    question: 'Why do AI agents need "guardrails"?',
    options: [
      { id: 'a', text: 'To improve response speed' },
      { id: 'b', text: 'To prevent infinite loops, unsafe actions, and excessive costs' },
      { id: 'c', text: 'To train the model faster' },
      { id: 'd', text: 'To encrypt communications' },
    ],
    correctAnswers: ['b'],
    skillArea: 'agents',
    difficulty: 'intermediate',
  },

  // Multimodal (2 questions)
  {
    id: 'multi-1',
    type: 'single-choice',
    question: 'What does "multimodal" mean in AI?',
    options: [
      { id: 'a', text: 'Using multiple programming languages' },
      { id: 'b', text: 'Processing different types of data (text, images, audio) together' },
      { id: 'c', text: 'Running multiple models in parallel' },
      { id: 'd', text: 'Supporting multiple languages (English, Spanish, etc.)' },
    ],
    correctAnswers: ['b'],
    skillArea: 'multimodal',
    difficulty: 'beginner',
  },
  {
    id: 'multi-2',
    type: 'single-choice',
    question: 'Which is a common use case for vision-language models?',
    options: [
      { id: 'a', text: 'Generating images from text prompts' },
      { id: 'b', text: 'Extracting text and data from documents/images (OCR + understanding)' },
      { id: 'c', text: 'Compressing video files' },
      { id: 'd', text: 'Training new language models' },
    ],
    correctAnswers: ['b'],
    skillArea: 'multimodal',
    difficulty: 'intermediate',
  },

  // Production AI (3 questions)
  {
    id: 'prod-1',
    type: 'multiple-choice',
    question: 'What are important considerations for production AI systems? (Select all that apply)',
    options: [
      { id: 'a', text: 'Cost monitoring and budget controls' },
      { id: 'b', text: 'Error handling and fallback strategies' },
      { id: 'c', text: 'Response latency and caching' },
      { id: 'd', text: 'Using the most expensive model for all tasks' },
    ],
    correctAnswers: ['a', 'b', 'c'],
    skillArea: 'production_ai',
    difficulty: 'intermediate',
  },
  {
    id: 'prod-2',
    type: 'single-choice',
    question: 'Why is caching important in production AI applications?',
    options: [
      { id: 'a', text: 'It makes the code more complex' },
      { id: 'b', text: 'It reduces costs and latency for repeated/similar queries' },
      { id: 'c', text: 'It is required by AI providers' },
      { id: 'd', text: 'It increases accuracy' },
    ],
    correctAnswers: ['b'],
    skillArea: 'production_ai',
    difficulty: 'intermediate',
  },
  {
    id: 'prod-3',
    type: 'single-choice',
    question: 'What is a key benefit of streaming responses in AI applications?',
    options: [
      { id: 'a', text: 'It reduces the total cost' },
      { id: 'b', text: 'It improves perceived performance by showing results progressively' },
      { id: 'c', text: 'It makes the model more accurate' },
      { id: 'd', text: 'It eliminates the need for error handling' },
    ],
    correctAnswers: ['b'],
    skillArea: 'production_ai',
    difficulty: 'beginner',
  },
]

// Utility to get questions by difficulty
export function getQuestionsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced') {
  return quizQuestions.filter(q => q.difficulty === difficulty)
}

// Utility to get questions by skill area
export function getQuestionsBySkill(skill: string) {
  return quizQuestions.filter(q => q.skillArea === skill)
}
```

**Step 2: Verify question bank**

Manual verification:
- Count total questions: Should be 20
- Verify all skill areas covered
- Check correct answers are valid option IDs

Expected: 20 well-structured questions

**Step 3: Commit**

```bash
git add lib/quiz/
git commit -m "feat: add quiz question bank with 20 questions across 6 skill areas"
```

---

## Task 3: Create AI Service for Diagnosis Analysis

**Files:**
- Create: `lib/ai/client.ts`
- Create: `lib/ai/prompts.ts`
- Create: `.env.local` (update)

**Step 1: Add Claude API key to environment**

Update `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
```

Manual action: Get API key from https://console.anthropic.com/

**Step 2: Install Anthropic SDK**

Run:
```bash
npm install @anthropic-ai/sdk
```

**Step 3: Create AI client service**

Create `lib/ai/client.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

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

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const responseText = message.content[0].type === 'text'
    ? message.content[0].text
    : ''

  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
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

**Step 4: Create prompt templates file**

Create `lib/ai/prompts.ts`:
```typescript
export const DIAGNOSIS_SYSTEM_PROMPT = `You are an expert AI learning path advisor. Your role is to analyze quiz results and provide accurate, helpful recommendations for learning AI engineering.

Be objective and base recommendations solely on the quiz performance data provided.`

export const MENTOR_SYSTEM_PROMPT = `You are an AI mentor for the AI Architect Accelerator program. Your role is to help learners understand concepts, debug code, and complete projects.

Guidelines:
- Provide guidance without giving away complete solutions
- Ask probing questions to help learners think through problems
- Reference relevant concepts they've already learned
- Be encouraging and supportive
- Keep responses concise and actionable`
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add AI service for diagnosis analysis using Claude API"
```

---

## Task 4: Create Quiz UI Components

**Files:**
- Create: `components/quiz/QuizQuestion.tsx`
- Create: `components/quiz/QuizProgress.tsx`
- Create: `components/quiz/QuizNavigation.tsx`

**Step 1: Install additional UI components**

Run:
```bash
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add progress
```

**Step 2: Create QuizQuestion component**

Create `components/quiz/QuizQuestion.tsx`:
```typescript
'use client'

import { QuizQuestion as QuizQuestionType } from '@/types/diagnosis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface QuizQuestionProps {
  question: QuizQuestionType
  selectedOptions: string[]
  onAnswerChange: (options: string[]) => void
}

export function QuizQuestion({
  question,
  selectedOptions,
  onAnswerChange
}: QuizQuestionProps) {
  const handleSingleChoice = (value: string) => {
    onAnswerChange([value])
  }

  const handleMultipleChoice = (optionId: string, checked: boolean) => {
    if (checked) {
      onAnswerChange([...selectedOptions, optionId])
    } else {
      onAnswerChange(selectedOptions.filter(id => id !== optionId))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-medium">
            {question.question}
          </CardTitle>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
            {question.type === 'multiple-choice' ? 'Select all that apply' : 'Select one'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {question.code && (
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4 text-sm overflow-x-auto">
            <code>{question.code}</code>
          </pre>
        )}

        {question.type === 'single-choice' || question.type === 'code-evaluation' ? (
          <RadioGroup
            value={selectedOptions[0] || ''}
            onValueChange={handleSingleChoice}
          >
            <div className="space-y-3">
              {question.options.map((option) => (
                <div key={option.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label
                    htmlFor={option.id}
                    className="font-normal cursor-pointer leading-relaxed"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-start space-x-3">
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) =>
                    handleMultipleChoice(option.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={option.id}
                  className="font-normal cursor-pointer leading-relaxed"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 3: Create QuizProgress component**

Create `components/quiz/QuizProgress.tsx`:
```typescript
import { Progress } from '@/components/ui/progress'

interface QuizProgressProps {
  current: number
  total: number
  answered: number
}

export function QuizProgress({ current, total, answered }: QuizProgressProps) {
  const percentComplete = (current / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-slate-600">
        <span>Question {current} of {total}</span>
        <span>{answered} answered</span>
      </div>
      <Progress value={percentComplete} />
    </div>
  )
}
```

**Step 4: Create QuizNavigation component**

Create `components/quiz/QuizNavigation.tsx`:
```typescript
import { Button } from '@/components/ui/button'

interface QuizNavigationProps {
  canGoPrevious: boolean
  canGoNext: boolean
  isLastQuestion: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  isAnswered: boolean
}

export function QuizNavigation({
  canGoPrevious,
  canGoNext,
  isLastQuestion,
  onPrevious,
  onNext,
  onSubmit,
  isAnswered,
}: QuizNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoPrevious}
      >
        Previous
      </Button>

      {isLastQuestion ? (
        <Button
          onClick={onSubmit}
          disabled={!isAnswered}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Submit Quiz
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canGoNext || !isAnswered}
        >
          Next
        </Button>
      )}
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add components/quiz/
git commit -m "feat: add quiz UI components for questions, progress, and navigation"
```

---

## Task 5: Create Quiz Page

**Files:**
- Create: `app/(dashboard)/diagnosis/page.tsx`
- Create: `app/(dashboard)/diagnosis/loading.tsx`

**Step 1: Create quiz page with state management**

Create `app/(dashboard)/diagnosis/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { quizQuestions } from '@/lib/quiz/questions'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { QuizNavigation } from '@/components/quiz/QuizNavigation'
import { QuizAnswer } from '@/types/diagnosis'

export default function DiagnosisPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = quizQuestions[currentIndex]
  const currentAnswer = answers[currentQuestion.id] || []

  const answeredCount = Object.keys(answers).length
  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < quizQuestions.length - 1
  const isLastQuestion = currentIndex === quizQuestions.length - 1
  const isAnswered = currentAnswer.length > 0

  const handleAnswerChange = (options: string[]) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: options,
    })
  }

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (canGoNext && isAnswered) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleSubmit = async () => {
    if (!isAnswered) return

    setIsSubmitting(true)

    try {
      // Prepare quiz results
      const quizAnswers: QuizAnswer[] = quizQuestions.map(q => {
        const selected = answers[q.id] || []
        const correct = q.correctAnswers

        // Check if answer is correct
        const isCorrect =
          selected.length === correct.length &&
          selected.every(s => correct.includes(s))

        return {
          questionId: q.id,
          selectedOptions: selected,
          isCorrect,
        }
      })

      // Send to API for analysis
      const response = await fetch('/api/diagnosis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: quizAnswers }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze quiz')
      }

      const result = await response.json()

      // Redirect to results page
      router.push(`/diagnosis/results?id=${result.userId}`)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Failed to submit quiz. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Skill Diagnosis
        </h1>
        <p className="text-slate-600">
          Answer these questions to get your personalized learning path
        </p>
      </div>

      <QuizProgress
        current={currentIndex + 1}
        total={quizQuestions.length}
        answered={answeredCount}
      />

      <QuizQuestion
        question={currentQuestion}
        selectedOptions={currentAnswer}
        onAnswerChange={handleAnswerChange}
      />

      <QuizNavigation
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isLastQuestion={isLastQuestion}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isAnswered={isAnswered}
      />

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-lg font-medium">Analyzing your results...</p>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Create loading state**

Create `app/(dashboard)/diagnosis/loading.tsx`:
```typescript
export default function DiagnosisLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-1/3" />
        <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
      </div>
      <div className="h-2 bg-slate-200 rounded animate-pulse" />
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/
git commit -m "feat: add quiz page with state management and navigation"
```

---

## Task 6: Create API Route for Diagnosis Analysis

**Files:**
- Create: `app/api/diagnosis/analyze/route.ts`

**Step 1: Create analysis API route**

Create `app/api/diagnosis/analyze/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { analyzeDiagnosis, DiagnosisAnalysisInput } from '@/lib/ai/client'
import { quizQuestions } from '@/lib/quiz/questions'
import { QuizAnswer } from '@/types/diagnosis'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const { answers }: { answers: QuizAnswer[] } = await request.json()

    // Validate answers
    if (!answers || answers.length !== quizQuestions.length) {
      return NextResponse.json(
        { error: 'Invalid answers' },
        { status: 400 }
      )
    }

    // Prepare data for AI analysis
    const analysisInput: DiagnosisAnalysisInput = {
      answers: answers.map(a => {
        const question = quizQuestions.find(q => q.id === a.questionId)!
        return {
          questionId: a.questionId,
          question: question.question,
          selectedOptions: a.selectedOptions,
          correctAnswers: question.correctAnswers,
          skillArea: question.skillArea,
          isCorrect: a.isCorrect,
        }
      }),
      totalQuestions: quizQuestions.length,
    }

    // Analyze with Claude AI
    const analysis = await analyzeDiagnosis(analysisInput)

    // Store results in database
    const { error: dbError } = await supabase
      .from('skill_diagnosis')
      .upsert({
        user_id: user.id,
        quiz_answers: answers,
        skill_scores: analysis.skillScores,
        recommended_path: analysis.recommendedPath,
        completed_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save results' },
        { status: 500 }
      )
    }

    // Update user's diagnosis_completed flag
    await supabase
      .from('users')
      .update({ diagnosis_completed: true })
      .eq('id', user.id)

    // Log event
    await supabase.from('learning_events').insert({
      user_id: user.id,
      event_type: 'diagnosis.completed',
      event_data: {
        score: answers.filter(a => a.isCorrect).length,
        total: quizQuestions.length,
        recommended_path: analysis.recommendedPath,
      },
    })

    return NextResponse.json({
      userId: user.id,
      analysis,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 2: Test API route**

Manual test (after implementing quiz UI):
1. Complete the quiz
2. Submit answers
3. Verify API responds with analysis
4. Check database for stored results

Expected: Results saved successfully

**Step 3: Commit**

```bash
git add app/api/
git commit -m "feat: add diagnosis analysis API with Claude integration"
```

---

## Task 7: Create Results Page

**Files:**
- Create: `app/(dashboard)/diagnosis/results/page.tsx`
- Create: `components/diagnosis/SkillRadar.tsx`
- Create: `components/diagnosis/LearningPathCard.tsx`

**Step 1: Install chart library**

Run:
```bash
npm install recharts
```

**Step 2: Create SkillRadar component**

Create `components/diagnosis/SkillRadar.tsx`:
```typescript
'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { SkillScores } from '@/types/diagnosis'

interface SkillRadarProps {
  scores: SkillScores
}

export function SkillRadar({ scores }: SkillRadarProps) {
  const data = [
    { skill: 'LLM Basics', value: scores.llm_fundamentals * 100 },
    { skill: 'Prompting', value: scores.prompt_engineering * 100 },
    { skill: 'RAG', value: scores.rag * 100 },
    { skill: 'Agents', value: scores.agents * 100 },
    { skill: 'Multimodal', value: scores.multimodal * 100 },
    { skill: 'Production', value: scores.production_ai * 100 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis domain={[0, 100]} />
        <Radar
          name="Skills"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
```

**Step 3: Create LearningPathCard component**

Create `components/diagnosis/LearningPathCard.tsx`:
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LearningPath } from '@/types/diagnosis'

interface LearningPathCardProps {
  path: LearningPath
  summary: string
}

export function LearningPathCard({ path, summary }: LearningPathCardProps) {
  const pathConfig = {
    'foundation-first': {
      title: 'Foundation First',
      description: 'Start with the basics and build a strong foundation',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '📚',
    },
    'standard': {
      title: 'Standard Track',
      description: 'Balanced pace covering all essential concepts',
      color: 'bg-blue-100 text-blue-800',
      icon: '🎯',
    },
    'fast-track': {
      title: 'Fast Track',
      description: 'Accelerated path, skip basics and dive deeper',
      color: 'bg-green-100 text-green-800',
      icon: '🚀',
    },
  }

  const config = pathConfig[path]

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <CardTitle>Your Recommended Path</CardTitle>
            <CardDescription>{config.title}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`${config.color} p-4 rounded-lg mb-4`}>
          <p className="font-medium">{config.description}</p>
        </div>
        <p className="text-slate-600">{summary}</p>
      </CardContent>
    </Card>
  )
}
```

**Step 4: Create results page**

Create `app/(dashboard)/diagnosis/results/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SkillRadar } from '@/components/diagnosis/SkillRadar'
import { LearningPathCard } from '@/components/diagnosis/LearningPathCard'
import Link from 'next/link'

export default async function DiagnosisResultsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch diagnosis results
  const { data: diagnosis, error } = await supabase
    .from('skill_diagnosis')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !diagnosis) {
    redirect('/diagnosis')
  }

  const skillScores = diagnosis.skill_scores as any
  const correctAnswers = (diagnosis.quiz_answers as any[]).filter(a => a.isCorrect).length
  const totalQuestions = (diagnosis.quiz_answers as any[]).length
  const percentCorrect = Math.round((correctAnswers / totalQuestions) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Your Diagnosis Results
        </h1>
        <p className="text-slate-600">
          Based on your quiz performance, here's your personalized learning path
        </p>
      </div>

      {/* Score Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {percentCorrect}%
              </div>
              <p className="text-slate-600">
                {correctAnswers} out of {totalQuestions} questions correct
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Path Recommendation */}
      <LearningPathCard
        path={diagnosis.recommended_path as any}
        summary="Based on your results, this path will help you build AI products most effectively."
      />

      {/* Skill Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillRadar scores={skillScores} />

          <div className="grid grid-cols-2 gap-4 mt-6">
            {Object.entries(skillScores).map(([skill, score]) => {
              const percentage = Math.round((score as number) * 100)
              const level =
                percentage >= 80 ? 'Advanced' :
                percentage >= 50 ? 'Intermediate' : 'Beginner'

              return (
                <div key={skill} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">
                      {skill.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium">{level}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Start?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Your learning path has been customized based on your results.
            Start Sprint 1 to build your first AI product!
          </p>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Go to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add diagnosis results page with skill radar and recommendations"
```

---

## Task 8: Update Dashboard to Show Diagnosis Status

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

**Step 1: Update dashboard to check diagnosis status**

Update `app/(dashboard)/dashboard/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Check if diagnosis is completed
  const { data: diagnosis } = await supabase
    .from('skill_diagnosis')
    .select('recommended_path')
    .eq('user_id', user!.id)
    .single()

  const diagnosisCompleted = !!diagnosis

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          Welcome back, {profile?.name || 'there'}!
        </h2>
        <p className="text-slate-600 mt-2">
          {diagnosisCompleted
            ? `You're on the ${diagnosis.recommended_path.replace('-', ' ')} path`
            : 'Take the skill diagnosis to get started'
          }
        </p>
      </div>

      {!diagnosisCompleted && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>🎯 Start Here</CardTitle>
            <CardDescription>
              Take a quick 10-minute assessment to personalize your learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/diagnosis">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start Skill Diagnosis
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sprint 0</CardTitle>
            <CardDescription>Skill Diagnosis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Take a quick assessment to personalize your learning path
            </p>
            {diagnosisCompleted ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  ✓ Completed
                </span>
                <Link href="/diagnosis/results" className="text-xs text-blue-600 hover:underline">
                  View results
                </Link>
              </div>
            ) : (
              <Link href="/diagnosis">
                <Button size="sm" variant="outline">
                  Start
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint 1</CardTitle>
            <CardDescription>Foundation + Chat Assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Learn LLM fundamentals and build your first AI product
            </p>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
              {diagnosisCompleted ? 'Coming soon' : 'Complete diagnosis first'}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Mentor</CardTitle>
            <CardDescription>24/7 Support</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Get help from your AI learning assistant anytime
            </p>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
              Coming soon
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 2: Test full flow**

Manual testing:
1. Log in to dashboard
2. See "Start Skill Diagnosis" prompt
3. Click to start diagnosis
4. Complete quiz
5. View results
6. Return to dashboard
7. Verify diagnosis shows as completed

Expected: Full flow works seamlessly

**Step 3: Commit**

```bash
git add app/
git commit -m "feat: update dashboard to show diagnosis status and prompt"
```

---

## Task 9: Add Error Handling and Validation

**Files:**
- Create: `lib/utils/validation.ts`
- Modify: `app/api/diagnosis/analyze/route.ts`

**Step 1: Create validation utilities**

Create `lib/utils/validation.ts`:
```typescript
import { QuizAnswer } from '@/types/diagnosis'
import { quizQuestions } from '@/lib/quiz/questions'

export function validateQuizAnswers(answers: QuizAnswer[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check if all questions are answered
  if (answers.length !== quizQuestions.length) {
    errors.push(`Expected ${quizQuestions.length} answers, got ${answers.length}`)
  }

  // Validate each answer
  answers.forEach((answer, index) => {
    const question = quizQuestions.find(q => q.id === answer.questionId)

    if (!question) {
      errors.push(`Invalid question ID at index ${index}: ${answer.questionId}`)
      return
    }

    // Check if selected options are valid
    const invalidOptions = answer.selectedOptions.filter(
      opt => !question.options.some(o => o.id === opt)
    )

    if (invalidOptions.length > 0) {
      errors.push(`Invalid options for question ${question.id}: ${invalidOptions.join(', ')}`)
    }

    // Check answer type constraints
    if (question.type === 'single-choice' && answer.selectedOptions.length > 1) {
      errors.push(`Question ${question.id} should have only one answer`)
    }

    if (answer.selectedOptions.length === 0) {
      errors.push(`Question ${question.id} has no answer selected`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}
```

**Step 2: Add validation to API route**

Update `app/api/diagnosis/analyze/route.ts` - add after parsing request body:
```typescript
// Add this after: const { answers }: { answers: QuizAnswer[] } = await request.json()

// Validate answers
const validation = validateQuizAnswers(answers)
if (!validation.isValid) {
  return NextResponse.json(
    { error: 'Invalid answers', details: validation.errors },
    { status: 400 }
  )
}
```

Import at top:
```typescript
import { validateQuizAnswers } from '@/lib/utils/validation'
```

**Step 3: Add try-catch to quiz submission**

Update `app/(dashboard)/diagnosis/page.tsx` - improve error handling in handleSubmit:
```typescript
const handleSubmit = async () => {
  if (!isAnswered) return

  setIsSubmitting(true)

  try {
    // Prepare quiz results
    const quizAnswers: QuizAnswer[] = quizQuestions.map(q => {
      const selected = answers[q.id] || []
      const correct = q.correctAnswers

      const isCorrect =
        selected.length === correct.length &&
        selected.every(s => correct.includes(s))

      return {
        questionId: q.id,
        selectedOptions: selected,
        isCorrect,
      }
    })

    // Send to API for analysis
    const response = await fetch('/api/diagnosis/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: quizAnswers }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to analyze quiz')
    }

    const result = await response.json()

    // Redirect to results page
    router.push('/diagnosis/results')
  } catch (error) {
    console.error('Error submitting quiz:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    alert(`Failed to submit quiz: ${message}. Please try again.`)
  } finally {
    setIsSubmitting(false)
  }
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add validation and error handling for quiz submission"
```

---

## Task 10: Add Loading States and Toast Notifications

**Files:**
- Install: toast component
- Update: `app/(dashboard)/diagnosis/page.tsx`
- Create: `app/providers.tsx`

**Step 1: Install toast component**

Run:
```bash
npx shadcn-ui@latest add sonner
```

**Step 2: Create providers wrapper**

Create `app/providers.tsx`:
```typescript
'use client'

import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
```

**Step 3: Update root layout**

Update `app/layout.tsx` - wrap children with Providers:
```typescript
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

**Step 4: Add toast notifications to quiz**

Update `app/(dashboard)/diagnosis/page.tsx` - add import and use toast:
```typescript
import { toast } from 'sonner'

// In handleSubmit, replace alert with toast:
} catch (error) {
  console.error('Error submitting quiz:', error)
  const message = error instanceof Error ? error.message : 'Unknown error'
  toast.error('Failed to submit quiz', {
    description: message,
  })
} finally {
  setIsSubmitting(false)
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add toast notifications for better user feedback"
```

---

## Task 11: Testing and Polish

**Files:**
- Create: `README-WEEK2.md`

**Step 1: End-to-end manual testing**

Test checklist:
1. Navigate to /diagnosis
2. Answer all 20 questions
3. Navigate back and forth between questions
4. Verify progress bar updates
5. Submit quiz
6. Verify loading state shows
7. View results page
8. Check skill radar displays correctly
9. Verify recommended path shows
10. Return to dashboard
11. Verify diagnosis shows as completed

Expected: All flows work without errors

**Step 2: Test edge cases**

Edge case testing:
1. Try submitting without answering all questions
2. Try accessing /diagnosis/results before taking quiz
3. Test with different answer combinations
4. Verify multiple-choice questions work correctly
5. Test navigation limits (can't go before first/after last)

Expected: Edge cases handled gracefully

**Step 3: Create Week 2 documentation**

Create `README-WEEK2.md`:
```markdown
# Week 2: Skill Diagnosis Implementation

## Completed Features

- ✅ Database schema for skill diagnosis
- ✅ 20-question quiz bank across 6 skill areas
- ✅ Claude AI integration for analysis
- ✅ Interactive quiz UI with progress tracking
- ✅ Results page with skill radar chart
- ✅ Personalized learning path recommendations
- ✅ Dashboard integration
- ✅ Validation and error handling
- ✅ Toast notifications

## How It Works

1. User takes 20-question quiz covering AI fundamentals
2. Answers submitted to API route
3. Claude analyzes results and generates:
   - Skill scores (0-1 for each area)
   - Recommended path (foundation/standard/fast-track)
   - Focus areas and concepts to skip
4. Results stored in database
5. User sees personalized recommendations

## API Endpoints

### POST /api/diagnosis/analyze
Analyzes quiz results and returns recommendations

**Request:**
```json
{
  "answers": [
    {
      "questionId": "llm-1",
      "selectedOptions": ["b"],
      "isCorrect": true
    }
  ]
}
```

**Response:**
```json
{
  "userId": "...",
  "analysis": {
    "skillScores": {
      "llm_fundamentals": 0.8,
      "prompt_engineering": 0.6,
      ...
    },
    "recommendedPath": "standard",
    "summary": "..."
  }
}
```

## Database Tables

### skill_diagnosis
Stores quiz results and AI analysis

### learning_events
Logs diagnosis completion events

## Testing

Run development server:
```bash
npm run dev
```

Test flow:
1. Go to /diagnosis
2. Complete quiz
3. View results at /diagnosis/results
4. Check dashboard shows completion

## Next Steps

Week 3 will add:
- AI Mentor chat interface
- Sprint 1 content structure
- Labs infrastructure
```

**Step 4: Final commit**

```bash
git add .
git commit -m "chore: Week 2 complete - skill diagnosis ready"
git push
```

---

## Week 2 Completion Checklist

- [ ] Database schema extended with skill_diagnosis table
- [ ] 20 quiz questions created across 6 skill areas
- [ ] Claude AI integration working
- [ ] Quiz UI with progress tracking
- [ ] Navigation between questions
- [ ] API route for analysis
- [ ] Results page with skill radar
- [ ] Learning path recommendations
- [ ] Dashboard updated with diagnosis status
- [ ] Validation and error handling
- [ ] Toast notifications
- [ ] End-to-end testing complete
- [ ] Documentation created
- [ ] Code pushed to GitHub

---

## Next Steps (Week 3)

After Week 2 is complete, proceed to Week 3: AI Infrastructure (AI Mentor + Streaming)

This will include:
- AI service layer architecture
- Chat interface with streaming
- Context assembly for mentor
- Conversation persistence
- System prompt templates
