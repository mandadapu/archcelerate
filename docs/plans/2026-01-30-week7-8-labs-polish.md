# Weeks 7-8: Labs Infrastructure & Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build interactive coding labs with AI feedback and polish MVP for beta launch

**Architecture:** Code sandbox integration (E2B or RunKit), lab submission system, AI feedback on code attempts, final polish and testing

**Tech Stack:** E2B/RunKit, Monaco Editor, Next.js, Supabase, Claude API

**Prerequisites:** Weeks 1-6 must be complete

---

## WEEK 7: Labs Infrastructure

### Task 1: Set Up Code Execution Sandbox

**Files:**
- Create: `lib/sandbox/client.ts`
- Install: E2B or RunKit integration

**Step 1: Choose and install sandbox**

Option A - E2B (Recommended):
```bash
npm install @e2b/sdk
```

Option B - Simple approach (RunKit):
```bash
npm install @runkit/embed
```

**Step 2: Add E2B API key**

Update `.env.local`:
```bash
E2B_API_KEY=your_e2b_api_key_here
```

**Step 3: Create sandbox client**

Create `lib/sandbox/client.ts`:
```typescript
import { Sandbox } from '@e2b/sdk'

export async function executeCode(
  code: string,
  language: 'javascript' | 'python' = 'javascript'
): Promise<{
  success: boolean
  output: string
  error?: string
  executionTime: number
}> {
  const startTime = Date.now()

  try {
    const sandbox = await Sandbox.create()

    const result = language === 'javascript'
      ? await sandbox.runCode(code)
      : await sandbox.runCode(code, { language: 'python' })

    await sandbox.kill()

    const executionTime = Date.now() - startTime

    return {
      success: !result.error,
      output: result.stdout || result.stderr || '',
      error: result.error,
      executionTime,
    }
  } catch (error: any) {
    return {
      success: false,
      output: '',
      error: error.message,
      executionTime: Date.now() - startTime,
    }
  }
}
```

**Step 4: Commit**

```bash
git add lib/sandbox/
git commit -m "feat: add code execution sandbox integration"
```

---

### Task 2: Create Lab Components

**Files:**
- Create: `components/labs/CodeEditor.tsx`
- Create: `components/labs/LabContainer.tsx`
- Install: Monaco Editor

**Step 1: Install Monaco Editor**

```bash
npm install @monaco-editor/react
```

**Step 2: Create CodeEditor component**

Create `components/labs/CodeEditor.tsx`:
```typescript
'use client'

import { Editor } from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  readOnly?: boolean
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  readOnly = false,
}: CodeEditorProps) {
  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={(value) => onChange(value || '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        readOnly,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  )
}
```

**Step 3: Create LabContainer component**

Create `components/labs/LabContainer.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CodeEditor } from './CodeEditor'
import { toast } from 'sonner'
import { Play, CheckCircle2 } from 'lucide-react'

interface LabContainerProps {
  labSlug: string
  sprintNumber: number
  title: string
  instructions: string
  starterCode: string
  testCases: Array<{ input: string; expectedOutput: string; description: string }>
  onComplete?: () => void
}

export function LabContainer({
  labSlug,
  sprintNumber,
  title,
  instructions,
  starterCode,
  testCases,
  onComplete,
}: LabContainerProps) {
  const [code, setCode] = useState(starterCode)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isPassed, setIsPassed] = useState(false)

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('')

    try {
      const response = await fetch('/api/labs/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: 'javascript' }),
      })

      const result = await response.json()

      if (result.success) {
        setOutput(result.output)
      } else {
        setOutput(`Error: ${result.error}`)
      }
    } catch (error) {
      setOutput('Failed to execute code')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    setIsRunning(true)

    try {
      const response = await fetch('/api/labs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintNumber,
          labSlug,
          code,
          testCases,
        }),
      })

      const result = await response.json()

      if (result.passed) {
        setIsPassed(true)
        toast.success('All tests passed! Lab complete.')
        onComplete?.()
      } else {
        toast.error(`${result.failedCount} test(s) failed`)
        setOutput(result.feedback)
      }
    } catch (error) {
      toast.error('Failed to submit lab')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p>{instructions}</p>
          </div>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Code</CardTitle>
            {isPassed && (
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Passed</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CodeEditor value={code} onChange={setCode} height="400px" />

          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleRun}
              disabled={isRunning}
              variant="outline"
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isRunning || isPassed}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? 'Testing...' : 'Submit'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output */}
      {output && (
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              {output}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testCases.map((test, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded text-sm">
                <div className="font-medium">{test.description}</div>
                <div className="text-slate-600">
                  Input: {test.input} → Expected: {test.expectedOutput}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add components/labs/
git commit -m "feat: add lab code editor and container components"
```

---

### Task 3: Create Labs API

**Files:**
- Create: `app/api/labs/execute/route.ts`
- Create: `app/api/labs/submit/route.ts`

**Step 1: Create code execution API**

Create `app/api/labs/execute/route.ts`:
```typescript
import { executeCode } from '@/lib/sandbox/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json()

    const result = await executeCode(code, language)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Execution error:', error)
    return NextResponse.json(
      { success: false, output: '', error: 'Execution failed' },
      { status: 500 }
    )
  }
}
```

**Step 2: Create lab submission API**

Create `app/api/labs/submit/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { executeCode } from '@/lib/sandbox/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sprintNumber, labSlug, code, testCases } = await request.json()

    // Run test cases
    const results = []
    for (const test of testCases) {
      const testCode = `${code}\n\nconsole.log(${test.input})`
      const result = await executeCode(testCode)

      const passed = result.output.trim() === test.expectedOutput.trim()
      results.push({ ...test, passed, actualOutput: result.output })
    }

    const allPassed = results.every(r => r.passed)
    const failedCount = results.filter(r => !r.passed).length

    // Store attempt
    await supabase.from('lab_attempts').insert({
      user_id: user.id,
      sprint_number: sprintNumber,
      lab_slug: labSlug,
      code_submitted: code,
      passed: allPassed,
      feedback: results,
    })

    // Update progress if passed
    if (allPassed) {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('labs_completed')
        .eq('user_id', user.id)
        .eq('sprint_number', sprintNumber)
        .single()

      const completed = progress?.labs_completed || []
      if (!completed.includes(labSlug)) {
        completed.push(labSlug)

        await supabase
          .from('user_progress')
          .update({ labs_completed: completed })
          .eq('user_id', user.id)
          .eq('sprint_number', sprintNumber)
      }

      await supabase.from('learning_events').insert({
        user_id: user.id,
        event_type: 'lab.completed',
        event_data: { sprint_number: sprintNumber, lab_slug: labSlug },
      })
    }

    return NextResponse.json({
      passed: allPassed,
      failedCount,
      results,
      feedback: allPassed
        ? 'All tests passed! Great work.'
        : `${failedCount} test(s) failed. Check the expected vs actual outputs.`,
    })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json(
      { error: 'Submission failed' },
      { status: 500 }
    )
  }
}
```

**Step 3: Commit**

```bash
git add app/api/labs/
git commit -m "feat: add lab execution and submission APIs"
```

---

### Task 4: Create Lab Pages

**Files:**
- Create: `app/(dashboard)/sprint/[number]/lab/[slug]/page.tsx`

**Step 1: Create lab page**

Create `app/(dashboard)/sprint/[number]/lab/[slug]/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSprint } from '@/lib/content/loader'
import { LabContainer } from '@/components/labs/LabContainer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function LabPage({
  params,
}: {
  params: { number: string; slug: string }
}) {
  const sprintNumber = parseInt(params.number)
  const labSlug = params.slug

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const sprint = getSprint(sprintNumber)
  const lab = sprint?.labs.find(l => l.slug === labSlug)

  if (!lab) {
    return <div>Lab not found</div>
  }

  // Example lab data (in real implementation, load from files)
  const labData = {
    instructions: lab.description,
    starterCode: `function solution(input) {\n  // Your code here\n  return result;\n}`,
    testCases: [
      { input: 'solution([1, 2, 3])', expectedOutput: '6', description: 'Sum of [1,2,3]' },
      { input: 'solution([10, 20])', expectedOutput: '30', description: 'Sum of [10,20]' },
    ],
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {lab.title}
          </h1>
          <p className="text-slate-600">
            Sprint {sprintNumber} • {lab.estimatedTime}
          </p>
        </div>
        <Link href={`/sprint/${sprintNumber}`}>
          <Button variant="outline">Back to Sprint</Button>
        </Link>
      </div>

      <LabContainer
        labSlug={labSlug}
        sprintNumber={sprintNumber}
        title={lab.title}
        instructions={labData.instructions}
        starterCode={labData.starterCode}
        testCases={labData.testCases}
      />
    </div>
  )
}
```

**Step 2: Update sprint overview to link to labs**

Update `app/(dashboard)/sprint/[number]/page.tsx` - change lab cards:
```typescript
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
      <Link href={`/sprint/${sprintNumber}/lab/${lab.slug}`}>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          {completedLabs.includes(lab.slug) ? 'Review Lab' : 'Start Lab'}
        </Button>
      </Link>
    </CardContent>
  </Card>
))}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add interactive lab pages with code execution"
```

---

## WEEK 8: Polish & Testing

### Task 5: Add Portfolio Page

**Files:**
- Create: `app/(dashboard)/portfolio/page.tsx`
- Create: `components/portfolio/ProjectCard.tsx`

**Step 1: Create project card component**

Create `components/portfolio/ProjectCard.tsx`:
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Github } from 'lucide-react'

interface ProjectCardProps {
  project: {
    number: number
    title: string
    description: string
    githubUrl?: string
    deployedUrl?: string
    score?: number
    techStack: string[]
    completedAt?: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-slate-600 mb-1">
              Project {project.number}
            </div>
            <CardTitle className="text-xl">{project.title}</CardTitle>
          </div>
          {project.score && (
            <div className="text-2xl font-bold text-blue-600">
              {project.score}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-700">{project.description}</p>

        <div className="flex gap-2 flex-wrap">
          {project.techStack.map(tech => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <Github className="h-4 w-4" />
              Code
            </a>
          )}
          {project.deployedUrl && (
            <a
              href={project.deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </a>
          )}
        </div>

        {project.completedAt && (
          <div className="text-xs text-slate-500">
            Completed {new Date(project.completedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Create portfolio page**

Create `app/(dashboard)/portfolio/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllSprints } from '@/lib/content/loader'

export default async function PortfolioPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get all project submissions
  const { data: submissions } = await supabase
    .from('project_submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('project_number')

  const sprints = getAllSprints()

  const projects = sprints.map(sprint => {
    const submission = submissions?.find(s => s.project_number === sprint.number)
    return {
      number: sprint.number,
      title: sprint.project?.title || '',
      description: sprint.project?.description || '',
      githubUrl: submission?.github_repo_url,
      deployedUrl: submission?.deployed_url,
      score: submission?.overall_score ? Math.round(submission.overall_score * 100) : undefined,
      techStack: sprint.project?.techStack || [],
      completedAt: submission?.created_at,
    }
  }).filter(p => p.title)

  const completedProjects = projects.filter(p => p.githubUrl)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          My Portfolio
        </h1>
        <p className="text-slate-600">
          Showcase of AI projects I've built
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projects Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {completedProjects.length}/{projects.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {completedProjects.length > 0
                ? Math.round(
                    completedProjects.reduce((sum, p) => sum + (p.score || 0), 0) /
                      completedProjects.length
                  )
                : 0}
              /100
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map(project => (
          <ProjectCard key={project.number} project={project} />
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Add portfolio link to navigation**

Update `app/(dashboard)/layout.tsx`:
```typescript
<div className="flex items-center space-x-4">
  <Link href="/dashboard" className="text-sm hover:text-slate-900">
    Dashboard
  </Link>
  <Link href="/mentor" className="text-sm hover:text-slate-900">
    AI Mentor
  </Link>
  <Link href="/portfolio" className="text-sm hover:text-slate-900">
    Portfolio
  </Link>
  <span className="text-sm text-slate-600">{user.email}</span>
  {/* ... */}
</div>
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add portfolio page to showcase completed projects"
```

---

### Task 6: Final Testing & Bug Fixes

**Step 1: Create comprehensive test checklist**

Create `docs/TESTING-CHECKLIST.md`:
```markdown
# MVP Testing Checklist

## Authentication Flow
- [ ] Sign up with email
- [ ] Email validation works
- [ ] Login with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Logout redirects to login
- [ ] Protected routes redirect when not logged in
- [ ] Session persists across page reloads

## Skill Diagnosis
- [ ] Quiz loads all 20 questions
- [ ] Navigation between questions works
- [ ] Progress bar updates correctly
- [ ] Submit quiz completes successfully
- [ ] Results page shows skill scores
- [ ] Skill radar chart displays
- [ ] Recommended path is assigned
- [ ] Can only take quiz once

## Learning Platform
- [ ] Sprint overview loads correctly
- [ ] Concept pages display MDX content
- [ ] Mark concept complete works
- [ ] Progress persists after refresh
- [ ] Navigation between concepts works
- [ ] Progress bars update correctly
- [ ] Can access next concept after completing previous

## AI Mentor
- [ ] New conversation starts
- [ ] Messages send successfully
- [ ] Streaming responses work
- [ ] Context from concept page flows through
- [ ] Quick help suggestions work
- [ ] Conversation list shows all conversations
- [ ] Can reopen existing conversations
- [ ] Rate limiting works (after 20 messages)

## Code Review
- [ ] Can submit GitHub repository URL
- [ ] GitHub integration fetches files
- [ ] Review completes in <60 seconds
- [ ] Review results display correctly
- [ ] Suggestions are categorized
- [ ] Scores are accurate
- [ ] Can submit revisions
- [ ] Submission limit works (3 per day)

## Labs
- [ ] Lab page loads with code editor
- [ ] Can write and edit code
- [ ] Run code executes successfully
- [ ] Test cases display
- [ ] Submit runs all tests
- [ ] Passing labs marks as complete
- [ ] Failed tests show feedback

## Portfolio
- [ ] Shows all projects
- [ ] Displays completion status
- [ ] Links to GitHub/deployed apps work
- [ ] Scores display correctly
- [ ] Average score calculates correctly

## General
- [ ] Mobile responsive on all pages
- [ ] No console errors
- [ ] All links work
- [ ] Forms validate correctly
- [ ] Error messages are helpful
- [ ] Loading states show appropriately
- [ ] No broken images
- [ ] All icons render
```

**Step 2: Run through entire checklist**

Manual testing - complete all items.

**Step 3: Fix critical bugs found**

Prioritize P0/P1 bugs:
- Broken authentication
- API failures
- Data loss issues
- Navigation broken

**Step 4: Commit fixes**

```bash
git add .
git commit -m "fix: address critical bugs from testing"
```

---

### Task 7: Performance Optimization

**Step 1: Optimize database queries**

Add indexes for common queries:
```sql
-- Optimize common joins
CREATE INDEX IF NOT EXISTS idx_submissions_user_project
ON project_submissions(user_id, project_number);

CREATE INDEX IF NOT EXISTS idx_progress_user_sprint
ON user_progress(user_id, sprint_number);

CREATE INDEX IF NOT EXISTS idx_conversations_user_updated
ON mentor_conversations(user_id, updated_at DESC);
```

**Step 2: Add caching headers**

Update `next.config.js`:
```javascript
const nextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
      {
        source: '/content/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}
```

**Step 3: Optimize images**

Ensure all images use Next.js Image component:
```tsx
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority
/>
```

**Step 4: Commit**

```bash
git add .
git commit -m "perf: optimize database queries and add caching"
```

---

### Task 8: Documentation & README

**Files:**
- Update: `README.md`
- Create: `docs/DEPLOYMENT.md`
- Create: `docs/ARCHITECTURE.md`

**Step 1: Update main README**

Update `README.md`:
```markdown
# AI Architect Accelerator

Transform from Software Engineer to AI Product Builder in 12 weeks.

## Features

- **Skill Diagnosis**: AI-powered assessment of your current AI/ML knowledge
- **Interactive Learning**: 7 sprints with concepts, labs, and projects
- **AI Mentor**: 24/7 context-aware AI assistant
- **Code Review AI**: Automated feedback on project submissions
- **Interactive Labs**: Code in-browser with instant feedback
- **Portfolio**: Showcase your deployed AI projects

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **AI**: Claude API (Anthropic), Vercel AI SDK
- **Database**: PostgreSQL (Supabase)
- **Caching**: Redis (Upstash)
- **Code Execution**: E2B
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run migrations in Supabase
5. Start dev server: `npm run dev`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
GITHUB_TOKEN=
E2B_API_KEY=
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing Checklist](docs/TESTING-CHECKLIST.md)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and services
│   ├── ai/               # AI service layer
│   ├── github/           # GitHub integration
│   ├── progress/         # Progress tracking
│   └── sandbox/          # Code execution
├── content/              # Learning content (MDX)
├── types/                # TypeScript types
└── supabase/            # Database migrations
```

## License

MIT
```

**Step 2: Commit**

```bash
git add .
git commit -m "docs: update README and add comprehensive documentation"
```

---

### Task 9: Final Deployment Prep

**Step 1: Create production environment**

1. Set up Vercel project
2. Add all environment variables
3. Configure custom domain (optional)
4. Set up monitoring (Vercel Analytics)

**Step 2: Deploy to production**

```bash
vercel --prod
```

**Step 3: Test production deployment**

Run through testing checklist on production URL.

**Step 4: Create launch checklist**

Create `docs/LAUNCH-CHECKLIST.md`:
```markdown
# MVP Launch Checklist

## Pre-Launch
- [ ] All environment variables set in Vercel
- [ ] Database migrations applied
- [ ] Test user accounts created
- [ ] All features tested in production
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (PostHog/Vercel)
- [ ] Backup strategy in place
- [ ] Rate limits tested
- [ ] Cost monitoring set up

## Content
- [ ] Sprint 1 content complete (5 concepts)
- [ ] At least 3 labs functional
- [ ] Project 1 rubric finalized
- [ ] AI prompts tested and refined

## Beta Launch
- [ ] Landing page live
- [ ] Beta signup form working
- [ ] Onboarding email sequence ready
- [ ] Support email configured
- [ ] Privacy policy published
- [ ] Terms of service published

## Monitoring
- [ ] Error logging working
- [ ] Performance monitoring active
- [ ] User analytics tracking
- [ ] AI cost tracking
- [ ] Database backups scheduled
```

**Step 5: Final commit**

```bash
git add .
git commit -m "chore: Weeks 7-8 complete - MVP ready for beta launch"
git push
```

---

## Weeks 7-8 Completion Checklist

### Week 7: Labs
- [ ] Code execution sandbox integrated
- [ ] Monaco code editor working
- [ ] Lab container component
- [ ] Lab execution API
- [ ] Lab submission with tests
- [ ] Lab pages functional
- [ ] Progress tracking for labs

### Week 8: Polish
- [ ] Portfolio page complete
- [ ] Navigation updated
- [ ] Full testing completed
- [ ] Critical bugs fixed
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Production deployment tested
- [ ] Launch checklist prepared

---

## Success Criteria

✅ **Feature Complete:**
- All 7 MVP features implemented
- Sprint 1 fully functional
- AI Mentor context-aware
- Code Review AI working
- Labs executable

✅ **Quality:**
- No P0/P1 bugs
- Mobile responsive
- <2s page loads
- 80%+ test coverage

✅ **Ready for Users:**
- 10 beta signups possible
- Support process defined
- Monitoring in place
- Costs tracked

---

## Next Steps (Post-MVP)

**Month 4: Beta Testing**
- Recruit 10 beta users
- Gather feedback
- Iterate on UX
- Add Sprints 2-3 content

**Month 5: Scale**
- Add remaining sprints (4-7)
- Build mock interview platform
- Improve AI prompts
- Add payment system

**Month 6: Launch**
- Public launch
- Marketing push
- First paying customers
- Community building
