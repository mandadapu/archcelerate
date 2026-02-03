# Platform Week 12: Final Polish + Launch Preparation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finalize platform with production-ready polish, comprehensive documentation, onboarding flow, and launch checklist.

**Architecture:** Complete user experience with onboarding, help system, admin dashboard, SEO optimization, and launch readiness.

**Tech Stack:** Next.js SEO, Intercom/Crisp (support), PostHog (analytics), Launch checklist automation

---

## Task 1: User Onboarding Flow

**Files:**
- Create: `src/components/onboarding/WelcomeFlow.tsx`
- Create: `src/components/onboarding/SkillAssessment.tsx`
- Create: `src/components/onboarding/LearningPathSelector.tsx`
- Create: `src/lib/onboarding/personalization.ts`
- Create: `app/onboarding/page.tsx`
- Docs: `docs/product/onboarding-design.md`

**Step 1: Create welcome flow component**

Create `src/components/onboarding/WelcomeFlow.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sparkles, Target, Rocket, CheckCircle } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AI Architect Accelerator',
    description: 'Your journey to becoming an AI engineer starts here',
    icon: <Sparkles className="h-8 w-8 text-purple-600" />,
  },
  {
    id: 'assessment',
    title: 'Quick Skill Assessment',
    description: "Let's understand your current knowledge level",
    icon: <Target className="h-8 w-8 text-blue-600" />,
  },
  {
    id: 'path',
    title: 'Choose Your Learning Path',
    description: 'Personalized curriculum based on your goals',
    icon: <Rocket className="h-8 w-8 text-green-600" />,
  },
  {
    id: 'ready',
    title: "You're All Set!",
    description: 'Ready to start your first module',
    icon: <CheckCircle className="h-8 w-8 text-emerald-600" />,
  },
]

export function WelcomeFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const progress = ((currentStep + 1) / steps.length) * 100

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = steps[currentStep]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {step.icon}
          </div>
          <CardTitle className="text-center text-2xl">{step.title}</CardTitle>
          <CardDescription className="text-center text-base">
            {step.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Progress value={progress} className="h-2" />

          <div className="min-h-[300px]">
            {step.id === 'welcome' && <WelcomeContent />}
            {step.id === 'assessment' && <SkillAssessment />}
            {step.id === 'path' && <LearningPathSelector />}
            {step.id === 'ready' && <ReadyContent />}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-2 rounded-full ${
                    idx === currentStep ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
            >
              {currentStep === steps.length - 2 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WelcomeContent() {
  return (
    <div className="space-y-4 text-center">
      <p className="text-lg">
        Transform from developer to AI engineer in 12 weeks
      </p>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">8</div>
          <div className="text-sm text-slate-600 mt-1">Learning Modules</div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">40+</div>
          <div className="text-sm text-slate-600 mt-1">Hands-on Projects</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">12</div>
          <div className="text-sm text-slate-600 mt-1">Weeks to Complete</div>
        </div>
      </div>
    </div>
  )
}

function ReadyContent() {
  return (
    <div className="space-y-6 text-center">
      <p className="text-lg">Your personalized learning path is ready!</p>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Recommended Start</h3>
        <p className="text-slate-600">Module 1: AI Engineering Foundations</p>
        <p className="text-sm text-slate-500 mt-1">Estimated: 1 week • 5 lessons</p>
      </div>

      <Button size="lg" className="w-full mt-4">
        Start Learning
      </Button>
    </div>
  )
}
```

**Step 2: Create skill assessment**

Create `src/components/onboarding/SkillAssessment.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const questions = [
  {
    id: 'experience',
    question: 'What is your programming experience?',
    options: [
      { value: 'beginner', label: 'Beginner (< 1 year)' },
      { value: 'intermediate', label: 'Intermediate (1-3 years)' },
      { value: 'advanced', label: 'Advanced (3+ years)' },
    ],
  },
  {
    id: 'ai_exposure',
    question: 'Have you worked with AI/LLMs before?',
    options: [
      { value: 'none', label: 'No experience' },
      { value: 'some', label: 'Played with ChatGPT/Claude' },
      { value: 'api', label: 'Used AI APIs in projects' },
      { value: 'production', label: 'Built production AI apps' },
    ],
  },
  {
    id: 'goal',
    question: 'What is your primary goal?',
    options: [
      { value: 'learn', label: 'Learn AI engineering fundamentals' },
      { value: 'build', label: 'Build specific AI applications' },
      { value: 'career', label: 'Career transition to AI engineering' },
      { value: 'business', label: 'Integrate AI into my business' },
    ],
  },
]

export function SkillAssessment() {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <Card key={question.id} className="p-4">
          <h3 className="font-medium mb-3">{question.question}</h3>
          <RadioGroup
            value={answers[question.id]}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                  <Label htmlFor={`${question.id}-${option.value}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </Card>
      ))}
    </div>
  )
}
```

**Step 3: Create learning path selector**

Create `src/components/onboarding/LearningPathSelector.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

const paths = [
  {
    id: 'full',
    name: 'Full Curriculum',
    description: 'Complete 8-module journey from fundamentals to production',
    duration: '12 weeks',
    modules: 8,
    recommended: true,
  },
  {
    id: 'rapid',
    name: 'Rapid Builder',
    description: 'Fast-track to building AI applications (skips theory)',
    duration: '6 weeks',
    modules: 5,
    recommended: false,
  },
  {
    id: 'specialist',
    name: 'RAG Specialist',
    description: 'Deep dive into RAG systems and document processing',
    duration: '4 weeks',
    modules: 3,
    recommended: false,
  },
  {
    id: 'agent',
    name: 'Agent Developer',
    description: 'Focus on building autonomous AI agents',
    duration: '4 weeks',
    modules: 3,
    recommended: false,
  },
]

export function LearningPathSelector() {
  const [selectedPath, setSelectedPath] = useState<string>('full')

  return (
    <div className="space-y-4">
      {paths.map((path) => (
        <Card
          key={path.id}
          className={`cursor-pointer transition-all ${
            selectedPath === path.id
              ? 'border-purple-600 border-2 shadow-md'
              : 'hover:border-slate-400'
          }`}
          onClick={() => setSelectedPath(path.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {path.name}
                  {path.recommended && (
                    <Badge variant="secondary">Recommended</Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {path.description}
                </CardDescription>
              </div>
              {selectedPath === path.id && (
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm text-slate-600">
              <span>⏱️ {path.duration}</span>
              <span>📚 {path.modules} modules</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**Step 4: Create personalization logic**

Create `src/lib/onboarding/personalization.ts`:

```typescript
export interface AssessmentAnswers {
  experience: 'beginner' | 'intermediate' | 'advanced'
  ai_exposure: 'none' | 'some' | 'api' | 'production'
  goal: 'learn' | 'build' | 'career' | 'business'
}

export interface LearningPath {
  id: string
  name: string
  modules: string[]
  skipModules?: string[]
  recommendedPace: 'slow' | 'medium' | 'fast'
}

export function recommendPath(answers: AssessmentAnswers): LearningPath {
  const { experience, ai_exposure, goal } = answers

  // Beginner path
  if (experience === 'beginner' || ai_exposure === 'none') {
    return {
      id: 'full-beginner',
      name: 'Full Curriculum (Beginner Pace)',
      modules: ['all'],
      recommendedPace: 'slow',
    }
  }

  // Rapid builder path
  if (goal === 'build' && experience === 'advanced' && ai_exposure !== 'none') {
    return {
      id: 'rapid',
      name: 'Rapid Builder',
      modules: ['1', '2', '3', '5', '7'],
      skipModules: ['4', '6'],
      recommendedPace: 'fast',
    }
  }

  // RAG specialist path
  if (goal === 'learn' && ai_exposure === 'some') {
    return {
      id: 'rag-specialist',
      name: 'RAG Specialist',
      modules: ['1', '2', '3'],
      recommendedPace: 'medium',
    }
  }

  // Default full curriculum
  return {
    id: 'full',
    name: 'Full Curriculum',
    modules: ['all'],
    recommendedPace: 'medium',
  }
}

export async function saveUserPath(userId: string, path: LearningPath) {
  // Save to database
  await prisma.userProfile.update({
    where: { userId },
    data: {
      learningPathId: path.id,
      recommendedPace: path.recommendedPace,
      onboardingCompletedAt: new Date(),
    },
  })
}
```

**Step 5: Test onboarding flow**

Run:
```bash
npm run dev
# Navigate to /onboarding
```

Expected: Complete onboarding flow works, path recommendation based on answers

**Step 6: Commit onboarding**

```bash
git add src/components/onboarding/ src/lib/onboarding/ app/onboarding/
git commit -m "feat: add user onboarding flow with skill assessment"
```

---

## Task 2: Help System and Documentation

**Files:**
- Create: `src/components/help/HelpWidget.tsx`
- Create: `src/components/help/FAQSection.tsx`
- Create: `src/components/help/VideoTutorials.tsx`
- Create: `app/help/page.tsx`
- Create: `public/docs/user-guide.pdf`
- Create: `docs/help/` (markdown docs)
- Docs: `docs/product/help-system.md`

**Step 1: Create help widget component**

Create `src/components/help/HelpWidget.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { HelpCircle, Search, BookOpen, Video, MessageCircle } from 'lucide-react'

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>How can we help?</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ✕
          </Button>
        </div>
        <CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search for help..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/help/getting-started">
            <BookOpen className="h-4 w-4 mr-2" />
            Getting Started Guide
          </a>
        </Button>

        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/help/tutorials">
            <Video className="h-4 w-4 mr-2" />
            Video Tutorials
          </a>
        </Button>

        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/help/faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </a>
        </Button>

        <Button variant="ghost" className="w-full justify-start" onClick={() => {
          // Open chat widget (Intercom, Crisp, etc.)
          if (window.Intercom) {
            window.Intercom('show')
          }
        }}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat with Support
        </Button>

        <div className="pt-4 border-t">
          <p className="text-xs text-slate-600">
            Need urgent help? Email{' '}
            <a href="mailto:support@archcelerate.com" className="text-blue-600">
              support@archcelerate.com
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Create FAQ section**

Create `src/components/help/FAQSection.tsx`:

```typescript
'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  {
    question: 'How long does it take to complete the full curriculum?',
    answer: 'The full 8-module curriculum is designed to be completed in 12 weeks with 10-15 hours per week of study time. However, you can progress at your own pace.',
  },
  {
    question: 'Do I need prior AI experience?',
    answer: 'No! The curriculum starts from fundamentals. You should have basic programming knowledge (any language), but we teach AI concepts from the ground up.',
  },
  {
    question: 'What AI models do you teach?',
    answer: 'We focus on Claude (Anthropic) as the primary model, but also cover OpenAI, embeddings, and other popular AI APIs. The concepts apply across all LLMs.',
  },
  {
    question: 'Can I get help if I am stuck?',
    answer: 'Yes! We offer multiple support channels: in-app help widget, community forum, email support, and live office hours twice a week.',
  },
  {
    question: 'Do you offer certificates?',
    answer: 'Yes, you receive a verified certificate of completion after finishing each module and a final certificate for completing the full curriculum.',
  },
  {
    question: 'What if I need to pause my learning?',
    answer: 'No problem! Your progress is automatically saved. You can pause and resume anytime. Your subscription remains active.',
  },
]

export function FAQSection() {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>

      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            <AccordionTrigger className="text-left font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-slate-600">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
```

**Step 3: Create video tutorials page**

Create `src/components/help/VideoTutorials.tsx`:

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play } from 'lucide-react'

const tutorials = [
  {
    id: '1',
    title: 'Platform Overview (5 min)',
    description: 'Quick tour of the platform and key features',
    thumbnail: '/thumbnails/platform-overview.jpg',
    duration: '5:23',
    videoUrl: 'https://youtube.com/...',
  },
  {
    id: '2',
    title: 'Your First AI Application (15 min)',
    description: 'Build a simple chatbot from scratch',
    thumbnail: '/thumbnails/first-app.jpg',
    duration: '15:42',
    videoUrl: 'https://youtube.com/...',
  },
  {
    id: '3',
    title: 'Understanding RAG Systems (20 min)',
    description: 'Deep dive into Retrieval Augmented Generation',
    thumbnail: '/thumbnails/rag-deep-dive.jpg',
    duration: '20:15',
    videoUrl: 'https://youtube.com/...',
  },
]

export function VideoTutorials() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tutorials.map((tutorial) => (
        <Card key={tutorial.id} className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="p-0">
            <div className="relative">
              <img
                src={tutorial.thumbnail}
                alt={tutorial.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-t-lg">
                <Play className="h-16 w-16 text-white" />
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {tutorial.duration}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <CardTitle className="text-lg mb-2">{tutorial.title}</CardTitle>
            <CardDescription>{tutorial.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**Step 4: Test help system**

Run:
```bash
npm run dev
# Test help widget, FAQ, tutorials
```

Expected: Help widget accessible from all pages, content renders correctly

**Step 5: Commit help system**

```bash
git add src/components/help/ app/help/ docs/help/
git commit -m "feat: add comprehensive help system with widget, FAQ, and tutorials"
```

---

## Task 3: Admin Dashboard

**Files:**
- Create: `app/admin/dashboard/page.tsx`
- Create: `src/components/admin/UserManagement.tsx`
- Create: `src/components/admin/ContentModeration.tsx`
- Create: `src/components/admin/AnalyticsDashboard.tsx`
- Create: `src/lib/admin/metrics.ts`
- Docs: `docs/admin/dashboard-guide.md`

**Step 1: Create admin metrics library**

Create `src/lib/admin/metrics.ts`:

```typescript
import { prisma } from '@/lib/db'
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns'

export async function getDashboardMetrics() {
  const now = new Date()
  const weekStart = startOfWeek(now)
  const weekEnd = endOfWeek(now)
  const lastWeekStart = startOfWeek(subWeeks(now, 1))

  const [
    totalUsers,
    activeUsers,
    totalModules,
    totalLessons,
    completionRate,
    weeklySignups,
    lastWeekSignups,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),

    // Active users (accessed in last 7 days)
    prisma.user.count({
      where: {
        lastLoginAt: {
          gte: subWeeks(now, 1),
        },
      },
    }),

    // Total modules
    prisma.module.count({ where: { published: true } }),

    // Total lessons
    prisma.lesson.count({ where: { published: true } }),

    // Average completion rate
    prisma.lessonProgress.aggregate({
      _avg: {
        progressPercent: true,
      },
      where: {
        progressPercent: {
          gte: 100,
        },
      },
    }),

    // This week signups
    prisma.user.count({
      where: {
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    }),

    // Last week signups
    prisma.user.count({
      where: {
        createdAt: {
          gte: lastWeekStart,
          lte: weekStart,
        },
      },
    }),
  ])

  const signupGrowth = lastWeekSignups > 0
    ? ((weeklySignups - lastWeekSignups) / lastWeekSignups) * 100
    : 0

  return {
    totalUsers,
    activeUsers,
    totalModules,
    totalLessons,
    averageCompletionRate: completionRate._avg.progressPercent || 0,
    weeklySignups,
    signupGrowth,
  }
}

export async function getUserActivity(days: number = 30) {
  const activity = await prisma.lessonProgress.groupBy({
    by: ['userId'],
    _count: true,
    where: {
      lastAccessedAt: {
        gte: subWeeks(new Date(), Math.ceil(days / 7)),
      },
    },
    orderBy: {
      _count: {
        userId: 'desc',
      },
    },
    take: 10,
  })

  return activity
}
```

**Step 2: Create analytics dashboard**

Create `src/components/admin/AnalyticsDashboard.tsx`:

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, BookOpen, TrendingUp, TrendingDown } from 'lucide-react'

interface Metrics {
  totalUsers: number
  activeUsers: number
  totalModules: number
  totalLessons: number
  averageCompletionRate: number
  weeklySignups: number
  signupGrowth: number
}

interface AnalyticsDashboardProps {
  metrics: Metrics
}

export function AnalyticsDashboard({ metrics }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-slate-600 mt-1">
              {metrics.weeklySignups} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-slate-600 mt-1">
              {((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published Content</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalModules}M / {metrics.totalLessons}L
            </div>
            <p className="text-xs text-slate-600 mt-1">Modules / Lessons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Signup Growth</CardTitle>
            {metrics.signupGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              metrics.signupGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.signupGrowth >= 0 ? '+' : ''}{metrics.signupGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-600 mt-1">vs last week</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 3: Create user management**

Create `src/components/admin/UserManagement.tsx`:

```typescript
'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  lastLoginAt: Date | null
}

interface UserManagementProps {
  users: User[]
}

export function UserManagement({ users }: UserManagementProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge
                variant={
                  user.status === 'active'
                    ? 'default'
                    : user.status === 'suspended'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleDateString()
                : 'Never'}
            </TableCell>
            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

**Step 4: Create admin dashboard page**

Create `app/admin/dashboard/page.tsx`:

```typescript
import { getDashboardMetrics } from '@/lib/admin/metrics'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'
import { UserManagement } from '@/components/admin/UserManagement'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function AdminDashboard() {
  const metrics = await getDashboardMetrics()

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Platform overview and management</p>
      </div>

      <AnalyticsDashboard metrics={metrics} />

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement users={[]} />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {/* Content moderation */}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {/* Reporting and analytics */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Step 5: Test admin dashboard**

Run:
```bash
npm run dev
# Navigate to /admin/dashboard
```

Expected: Dashboard shows metrics, user management works

**Step 6: Commit admin dashboard**

```bash
git add src/lib/admin/ src/components/admin/ app/admin/dashboard/
git commit -m "feat: add admin dashboard with metrics and user management"
```

---

## Task 4: SEO Optimization and Launch Preparation

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.txt`
- Create: `app/manifest.json`
- Modify: `app/layout.tsx` (add metadata)
- Create: `src/lib/seo/metadata.ts`
- Create: `public/og-image.png`
- Docs: `docs/launch/seo-checklist.md`

**Step 1: Create SEO metadata utility**

Create `src/lib/seo/metadata.ts`:

```typescript
import { Metadata } from 'next'

const defaultMetadata = {
  title: 'AI Architect Accelerator - Learn AI Engineering',
  description: 'Transform from developer to AI engineer in 12 weeks. Build production-ready AI applications with RAG, agents, and more.',
  keywords: ['AI engineering', 'learn AI', 'RAG systems', 'AI agents', 'Claude', 'LLM development'],
  authors: [{ name: 'AI Architect Accelerator' }],
  creator: 'AI Architect Accelerator',
  publisher: 'AI Architect Accelerator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export function generateMetadata(params: {
  title?: string
  description?: string
  image?: string
  path?: string
}): Metadata {
  const { title, description, image, path = '' } = params

  const fullTitle = title
    ? `${title} | AI Architect Accelerator`
    : defaultMetadata.title

  const fullDescription = description || defaultMetadata.description
  const fullImage = image || '/og-image.png'
  const url = `https://archcelerate.com${path}`

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: defaultMetadata.keywords,
    authors: defaultMetadata.authors,
    creator: defaultMetadata.creator,
    publisher: defaultMetadata.publisher,
    formatDetection: defaultMetadata.formatDetection,
    metadataBase: new URL('https://archcelerate.com'),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url,
      siteName: 'AI Architect Accelerator',
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: '@archcelerate',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}
```

**Step 2: Create sitemap**

Create `app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next'
import { allLessons, allModules } from 'contentlayer/generated'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://archcelerate.com'

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/pricing',
    '/blog',
    '/help',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // Module pages
  const modulePages = allModules.map((module) => ({
    url: `${baseUrl}/modules/${module.slug}`,
    lastModified: new Date(module.updatedAt || module.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Lesson pages
  const lessonPages = allLessons
    .filter((lesson) => lesson.published)
    .map((lesson) => ({
      url: `${baseUrl}/lessons/${lesson.slug}`,
      lastModified: new Date(lesson.updatedAt || lesson.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  return [...staticPages, ...modulePages, ...lessonPages]
}
```

**Step 3: Create robots.txt**

Create `app/robots.ts`:

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/onboarding/'],
      },
    ],
    sitemap: 'https://archcelerate.com/sitemap.xml',
  }
}
```

**Step 4: Update root layout with metadata**

Modify `app/layout.tsx`:

```typescript
import { generateMetadata } from '@/lib/seo/metadata'

export const metadata = generateMetadata({})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

**Step 5: Create web manifest**

Create `public/manifest.json`:

```json
{
  "name": "AI Architect Accelerator",
  "short_name": "AIcelerate",
  "description": "Learn AI Engineering - Build production-ready AI applications",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#8b5cf6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Step 6: Create launch checklist**

Create `docs/launch/seo-checklist.md`:

```markdown
# SEO and Launch Checklist

## Pre-Launch SEO

- [ ] Generate and test sitemap.xml
- [ ] Verify robots.txt configuration
- [ ] Test Open Graph images
- [ ] Validate meta tags with tools
- [ ] Check mobile responsiveness
- [ ] Test page load speed (Lighthouse)
- [ ] Verify structured data markup
- [ ] Set up Google Search Console
- [ ] Submit sitemap to Google
- [ ] Set up Bing Webmaster Tools

## Performance

- [ ] Lighthouse score 90+ for all metrics
- [ ] Images optimized (WebP, lazy loading)
- [ ] Bundle size < 200KB
- [ ] TTI < 3.5s
- [ ] LCP < 2.5s

## Security

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting in place
- [ ] CSRF protection enabled
- [ ] Input validation on all forms

## Monitoring

- [ ] Sentry error tracking active
- [ ] Analytics tracking verified
- [ ] Uptime monitoring configured
- [ ] Log aggregation setup
- [ ] Alert rules configured

## Launch Day

- [ ] Database backup completed
- [ ] CDN cache warmed
- [ ] DNS records propagated
- [ ] Email notifications tested
- [ ] Support channels ready
- [ ] Launch announcement prepared
- [ ] Social media posts scheduled

## Post-Launch

- [ ] Monitor error rates
- [ ] Check conversion funnels
- [ ] Review user feedback
- [ ] Address critical bugs within 24h
- [ ] Weekly performance review
```

**Step 7: Test SEO configuration**

Run:
```bash
npm run build
npm run lighthouse
```

Expected: Lighthouse scores 90+, sitemap generates, metadata correct

**Step 8: Commit SEO and launch prep**

```bash
git add app/sitemap.ts app/robots.ts src/lib/seo/ public/manifest.json docs/launch/
git commit -m "feat: add SEO optimization and launch preparation checklist"
```

---

## Verification Checklist

After completing Platform Week 12:

- [ ] Onboarding flow guides new users smoothly
- [ ] Help widget accessible on all pages
- [ ] FAQ and tutorials comprehensive
- [ ] Admin dashboard shows real-time metrics
- [ ] User management functional
- [ ] SEO metadata correct on all pages
- [ ] Sitemap generates dynamically
- [ ] Lighthouse scores meet targets (90+)
- [ ] Launch checklist complete

## Platform Complete!

**Congratulations!** All 12 weeks of platform implementation are complete. The AI Architect Accelerator platform is production-ready with:

- ✅ Authentication and user management
- ✅ RAG systems with vector search
- ✅ AI Agents framework
- ✅ Memory architecture
- ✅ Frontend components and design system
- ✅ Comprehensive testing
- ✅ Performance optimization
- ✅ Deployment infrastructure
- ✅ Content creation system
- ✅ Launch readiness

**Next:** Begin content creation for Learning Modules 1-8 and student onboarding!
