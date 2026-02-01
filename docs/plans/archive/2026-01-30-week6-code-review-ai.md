# Week 6: Code Review AI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build AI-powered code review system that fetches code from GitHub, analyzes against project rubrics, and provides structured feedback

**Architecture:** GitHub API integration, Claude-powered analysis, structured feedback storage, beautiful review UI

**Tech Stack:** GitHub API, Claude API, Octokit, Next.js, Supabase

**Prerequisites:** Weeks 1-5 must be complete

---

## Task 1: Extend Database Schema for Code Reviews

**Files:**
- Create: `supabase/migrations/20260203_code_reviews.sql`
- Update: `types/database.ts`

**Step 1: Create code review tables migration**

Create `supabase/migrations/20260203_code_reviews.sql`:
```sql
-- Project Submissions (updated from Week 4)
ALTER TABLE public.project_submissions
ADD COLUMN IF NOT EXISTS github_repo_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS deployed_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS submission_data JSONB,
ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS overall_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

-- Code Review Feedback
CREATE TABLE public.code_review_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
    overall_score DECIMAL(3,2),
    functionality_score DECIMAL(3,2),
    code_quality_score DECIMAL(3,2),
    ai_best_practices_score DECIMAL(3,2),
    architecture_score DECIMAL(3,2),
    suggestions JSONB,
    good_practices JSONB,
    critical_issues JSONB,
    improvements_needed JSONB,
    review_iteration INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.code_review_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own feedback"
ON public.code_review_feedback
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.project_submissions
        WHERE id = code_review_feedback.submission_id
        AND user_id = auth.uid()
    )
);

-- Review Comments (file-level feedback)
CREATE TABLE public.review_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feedback_id UUID NOT NULL REFERENCES public.code_review_feedback(id) ON DELETE CASCADE,
    file_path VARCHAR(500),
    line_number INT,
    severity VARCHAR(20), -- 'error', 'warning', 'suggestion', 'praise'
    category VARCHAR(100),
    message TEXT NOT NULL,
    suggestion TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own comments"
ON public.review_comments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.code_review_feedback crf
        JOIN public.project_submissions ps ON crf.submission_id = ps.id
        WHERE crf.id = review_comments.feedback_id
        AND ps.user_id = auth.uid()
    )
);

CREATE INDEX idx_feedback_submission ON public.code_review_feedback(submission_id);
CREATE INDEX idx_comments_feedback ON public.review_comments(feedback_id);
```

**Step 2: Apply migration**

Manual action:
1. Go to Supabase dashboard → SQL Editor
2. Paste and run the migration
3. Verify tables created

Expected: Tables created with RLS policies

**Step 3: Update TypeScript types**

Update `types/database.ts` - add new tables and update existing:
```typescript
// Add to Tables interface
code_review_feedback: {
  Row: {
    id: string
    submission_id: string
    overall_score: number | null
    functionality_score: number | null
    code_quality_score: number | null
    ai_best_practices_score: number | null
    architecture_score: number | null
    suggestions: Json | null
    good_practices: Json | null
    critical_issues: Json | null
    improvements_needed: Json | null
    review_iteration: number
    created_at: string
  }
  Insert: {
    id?: string
    submission_id: string
    overall_score?: number | null
    functionality_score?: number | null
    code_quality_score?: number | null
    ai_best_practices_score?: number | null
    architecture_score?: number | null
    suggestions?: Json | null
    good_practices?: Json | null
    critical_issues?: Json | null
    improvements_needed?: Json | null
    review_iteration?: number
    created_at?: string
  }
  Update: Partial<Insert>
}
review_comments: {
  Row: {
    id: string
    feedback_id: string
    file_path: string | null
    line_number: number | null
    severity: string
    category: string | null
    message: string
    suggestion: string | null
    created_at: string
  }
  Insert: {
    id?: string
    feedback_id: string
    file_path?: string | null
    line_number?: number | null
    severity: string
    category?: string | null
    message: string
    suggestion?: string | null
    created_at?: string
  }
  Update: Partial<Insert>
}
```

**Step 4: Create code review types**

Create `types/code-review.ts`:
```typescript
export interface CodeReviewRequest {
  repositoryUrl: string
  deployedUrl?: string
  projectNumber: number
}

export interface CodeReviewSuggestion {
  file: string
  line?: number
  severity: 'error' | 'warning' | 'suggestion' | 'praise'
  category: string
  issue: string
  recommendation: string
  why: string
}

export interface CodeReviewResult {
  overallScore: number
  scores: {
    functionality: number
    codeQuality: number
    aiBestPractices: number
    architecture: number
  }
  suggestions: CodeReviewSuggestion[]
  goodPractices: string[]
  criticalIssues: string[]
  improvementsNeeded: string[]
  summary: string
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add code review database schema and types"
```

---

## Task 2: Create GitHub Integration

**Files:**
- Create: `lib/github/client.ts`
- Install: `@octokit/rest`

**Step 1: Install Octokit**

Run:
```bash
npm install @octokit/rest
```

**Step 2: Add GitHub token to environment**

Update `.env.local`:
```bash
# Existing vars...
GITHUB_TOKEN=github_pat_your_token_here
```

Manual action: Create GitHub personal access token at https://github.com/settings/tokens

**Step 3: Create GitHub client**

Create `lib/github/client.ts`:
```typescript
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export interface RepoFile {
  path: string
  content: string
  size: number
}

export async function fetchRepositoryFiles(
  repoUrl: string,
  maxFiles: number = 20,
  maxFileSizeKB: number = 100
): Promise<RepoFile[]> {
  // Parse GitHub URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) {
    throw new Error('Invalid GitHub URL')
  }

  const [, owner, repo] = match
  const repoName = repo.replace(/\.git$/, '')

  try {
    // Get default branch
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo: repoName,
    })

    const defaultBranch = repoData.default_branch

    // Get repository tree
    const { data: tree } = await octokit.rest.git.getTree({
      owner,
      repo: repoName,
      tree_sha: defaultBranch,
      recursive: 'true',
    })

    // Filter and sort files
    const codeFiles = tree.tree
      .filter(item =>
        item.type === 'blob' &&
        isCodeFile(item.path || '') &&
        (item.size || 0) < maxFileSizeKB * 1024
      )
      .sort((a, b) => getFilePriority(b.path || '') - getFilePriority(a.path || ''))
      .slice(0, maxFiles)

    // Fetch file contents
    const files: RepoFile[] = []

    for (const file of codeFiles) {
      if (!file.sha || !file.path) continue

      try {
        const { data: blob } = await octokit.rest.git.getBlob({
          owner,
          repo: repoName,
          file_sha: file.sha,
        })

        const content = Buffer.from(blob.content, 'base64').toString('utf-8')

        files.push({
          path: file.path,
          content,
          size: file.size || 0,
        })
      } catch (error) {
        console.error(`Failed to fetch ${file.path}:`, error)
      }
    }

    return files
  } catch (error) {
    console.error('GitHub fetch error:', error)
    throw new Error('Failed to fetch repository files')
  }
}

function isCodeFile(path: string): boolean {
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.md']
  const excludePatterns = [
    'node_modules/',
    '.next/',
    'dist/',
    'build/',
    '.git/',
    'package-lock.json',
    'yarn.lock',
  ]

  // Exclude certain patterns
  if (excludePatterns.some(pattern => path.includes(pattern))) {
    return false
  }

  // Include code files and README
  return codeExtensions.some(ext => path.endsWith(ext)) || path.toLowerCase().includes('readme')
}

function getFilePriority(path: string): number {
  // Prioritize important files
  if (path.toLowerCase().includes('readme')) return 100
  if (path.includes('app/') || path.includes('src/')) return 90
  if (path.includes('lib/') || path.includes('utils/')) return 80
  if (path.includes('components/')) return 70
  if (path.includes('api/')) return 85
  if (path.endsWith('.config.js') || path.endsWith('.config.ts')) return 60
  return 50
}
```

**Step 4: Test GitHub integration**

Create temporary test file `lib/github/__test__.ts`:
```typescript
import { fetchRepositoryFiles } from './client'

async function test() {
  const files = await fetchRepositoryFiles(
    'https://github.com/vercel/next.js',
    5
  )
  console.log('Fetched files:', files.map(f => f.path))
}

test()
```

Run:
```bash
npx tsx lib/github/__test__.ts
```

Expected: Should fetch files successfully

Delete test file after verification.

**Step 5: Commit**

```bash
git add lib/github/
git commit -m "feat: add GitHub integration for fetching repository code"
```

---

## Task 3: Create Code Review Service

**Files:**
- Create: `lib/ai/code-review.ts`
- Create: `lib/ai/review-prompts.ts`

**Step 1: Create review prompt templates**

Create `lib/ai/review-prompts.ts`:
```typescript
export const PROJECT_RUBRICS: Record<number, string> = {
  1: `Project 1: AI Chat Assistant

Functionality Requirements:
- Chat interface with streaming responses
- Conversation history persistence
- System prompt customization
- Working deployment with public URL
- Error handling for API failures

Code Quality Requirements:
- Clean, readable code
- Proper TypeScript typing
- Component organization
- Code comments where needed

AI Best Practices:
- Proper API error handling
- Streaming implementation
- Rate limiting or usage tracking
- Cost-conscious API usage

Architecture:
- Separation of concerns
- API route structure
- State management
- Database integration`,

  // Add more project rubrics as needed
}

export function getReviewSystemPrompt(
  projectNumber: number,
  files: Array<{ path: string; content: string }>
): string {
  const rubric = PROJECT_RUBRICS[projectNumber] || 'General AI project review'

  const fileList = files.map(f => `- ${f.path} (${f.content.length} chars)`).join('\n')

  return `You are an expert code reviewer specializing in AI applications. Review this project submission against the rubric.

Project Rubric:
${rubric}

Files to Review:
${fileList}

Provide structured feedback in this exact JSON format:
{
  "overall_score": 0.0-1.0,
  "functionality_score": 0.0-1.0,
  "code_quality_score": 0.0-1.0,
  "ai_best_practices_score": 0.0-1.0,
  "architecture_score": 0.0-1.0,
  "suggestions": [
    {
      "file": "path/to/file",
      "line": 45 (optional),
      "severity": "error|warning|suggestion|praise",
      "category": "Category name",
      "issue": "What's wrong or what's good",
      "recommendation": "What to do",
      "why": "Educational explanation"
    }
  ],
  "good_practices": ["Things done well"],
  "critical_issues": ["Must-fix issues"],
  "improvements_needed": ["Nice-to-have improvements"],
  "summary": "2-3 sentence overall assessment"
}

Scoring Guide:
- 0.9-1.0: Excellent, production-ready
- 0.7-0.89: Good, minor improvements
- 0.5-0.69: Acceptable, several issues
- <0.5: Needs significant work

Respond ONLY with the JSON object, no additional text.`
}
```

**Step 2: Create code review service**

Create `lib/ai/code-review.ts`:
```typescript
import { aiService } from './service'
import { getReviewSystemPrompt } from './review-prompts'
import { CodeReviewResult } from '@/types/code-review'

export async function reviewCode(
  files: Array<{ path: string; content: string }>,
  projectNumber: number
): Promise<CodeReviewResult> {
  // Prepare code for review
  const codeContext = files
    .map(f => `File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
    .join('\n\n---\n\n')

  const systemPrompt = getReviewSystemPrompt(projectNumber, files)

  const prompt = `Review this code submission:\n\n${codeContext}`

  // Call AI with retry logic
  const response = await aiService.chatWithRetry(
    {
      systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      maxTokens: 4096,
    },
    3
  )

  // Parse JSON response
  const jsonMatch = response.content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse review response')
  }

  const rawReview = JSON.parse(jsonMatch[0])

  // Convert to standardized format
  return {
    overallScore: Math.round((rawReview.overall_score || 0) * 100),
    scores: {
      functionality: Math.round((rawReview.functionality_score || 0) * 100),
      codeQuality: Math.round((rawReview.code_quality_score || 0) * 100),
      aiBestPractices: Math.round((rawReview.ai_best_practices_score || 0) * 100),
      architecture: Math.round((rawReview.architecture_score || 0) * 100),
    },
    suggestions: rawReview.suggestions || [],
    goodPractices: rawReview.good_practices || [],
    criticalIssues: rawReview.critical_issues || [],
    improvementsNeeded: rawReview.improvements_needed || [],
    summary: rawReview.summary || 'Review completed',
  }
}
```

**Step 3: Commit**

```bash
git add lib/ai/
git commit -m "feat: add code review service with AI analysis"
```

---

## Task 4: Create Code Review API Endpoint

**Files:**
- Create: `app/api/code-review/route.ts`

**Step 1: Create review API**

Create `app/api/code-review/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { fetchRepositoryFiles } from '@/lib/github/client'
import { reviewCode } from '@/lib/ai/code-review'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { repositoryUrl, deployedUrl, projectNumber } = await request.json()

    // Validate inputs
    if (!repositoryUrl || !projectNumber) {
      return NextResponse.json(
        { error: 'Repository URL and project number are required' },
        { status: 400 }
      )
    }

    // Check submission limit (max 3 per day per project)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { count: recentSubmissions } = await supabase
      .from('project_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('project_number', projectNumber)
      .gte('created_at', oneDayAgo.toISOString())

    if ((recentSubmissions || 0) >= 3) {
      return NextResponse.json(
        { error: 'Submission limit reached (3 per day)' },
        { status: 429 }
      )
    }

    // Fetch code from GitHub
    let files
    try {
      files = await fetchRepositoryFiles(repositoryUrl, 20, 100)
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch repository. Make sure it\'s public.' },
        { status: 400 }
      )
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No code files found in repository' },
        { status: 400 }
      )
    }

    // Get previous submission count for iteration
    const { count: previousCount } = await supabase
      .from('project_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('project_number', projectNumber)

    const iteration = (previousCount || 0) + 1

    // Create submission record
    const { data: submission, error: submissionError } = await supabase
      .from('project_submissions')
      .insert({
        user_id: user.id,
        project_number: projectNumber,
        github_repo_url: repositoryUrl,
        deployed_url: deployedUrl,
        submission_data: {
          files_reviewed: files.length,
          total_size: files.reduce((sum, f) => sum + f.size, 0),
        },
        review_status: 'pending',
      })
      .select()
      .single()

    if (submissionError || !submission) {
      throw new Error('Failed to create submission')
    }

    // Perform AI code review
    const review = await reviewCode(files, projectNumber)

    // Store feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('code_review_feedback')
      .insert({
        submission_id: submission.id,
        overall_score: review.overallScore / 100,
        functionality_score: review.scores.functionality / 100,
        code_quality_score: review.scores.codeQuality / 100,
        ai_best_practices_score: review.scores.aiBestPractices / 100,
        architecture_score: review.scores.architecture / 100,
        suggestions: review.suggestions,
        good_practices: review.goodPractices,
        critical_issues: review.criticalIssues,
        improvements_needed: review.improvementsNeeded,
        review_iteration: iteration,
      })
      .select()
      .single()

    if (feedbackError || !feedback) {
      throw new Error('Failed to store feedback')
    }

    // Store individual comments
    if (review.suggestions.length > 0) {
      await supabase.from('review_comments').insert(
        review.suggestions.map(s => ({
          feedback_id: feedback.id,
          file_path: s.file,
          line_number: s.line || null,
          severity: s.severity,
          category: s.category,
          message: s.issue,
          suggestion: s.recommendation,
        }))
      )
    }

    // Update submission status
    await supabase
      .from('project_submissions')
      .update({
        review_status: 'reviewed',
        overall_score: review.overallScore / 100,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submission.id)

    // Log event
    await supabase.from('learning_events').insert({
      user_id: user.id,
      event_type: 'project.submitted',
      event_data: {
        project_number: projectNumber,
        score: review.overallScore,
        iteration,
      },
    })

    return NextResponse.json({
      submissionId: submission.id,
      feedbackId: feedback.id,
      review,
    })
  } catch (error) {
    console.error('Code review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add app/api/code-review/
git commit -m "feat: add code review API endpoint with GitHub integration"
```

---

## Task 5: Create Review UI Components

**Files:**
- Create: `components/code-review/SubmissionForm.tsx`
- Create: `components/code-review/ReviewResult.tsx`
- Create: `components/code-review/SuggestionCard.tsx`

**Step 1: Create submission form**

Create `components/code-review/SubmissionForm.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface SubmissionFormProps {
  projectNumber: number
  projectTitle: string
}

export function SubmissionForm({
  projectNumber,
  projectTitle,
}: SubmissionFormProps) {
  const router = useRouter()
  const [repoUrl, setRepoUrl] = useState('')
  const [deployedUrl, setDeployedUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repositoryUrl: repoUrl,
          deployedUrl: deployedUrl || undefined,
          projectNumber,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Submission failed')
      }

      const { feedbackId } = await response.json()

      toast.success('Code review complete!')
      router.push(`/project/${projectNumber}/review/${feedbackId}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Project</CardTitle>
        <CardDescription>
          Submit your GitHub repository for AI-powered code review
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo">GitHub Repository URL *</Label>
            <Input
              id="repo"
              type="url"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
            />
            <p className="text-xs text-slate-500">
              Make sure your repository is public
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deployed">Deployed URL (optional)</Label>
            <Input
              id="deployed"
              type="url"
              placeholder="https://yourapp.vercel.app"
              value={deployedUrl}
              onChange={(e) => setDeployedUrl(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              Link to your deployed application
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
              <li>We'll fetch your code from GitHub (up to 20 files)</li>
              <li>AI will analyze your code against the project rubric</li>
              <li>You'll receive detailed feedback in 30-60 seconds</li>
              <li>You can submit revisions (max 3 per day)</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !repoUrl}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Reviewing your code...' : 'Submit for Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Create suggestion card**

Create `components/code-review/SuggestionCard.tsx`:
```typescript
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'

interface SuggestionCardProps {
  suggestion: {
    file: string
    line?: number
    severity: 'error' | 'warning' | 'suggestion' | 'praise'
    category: string
    issue: string
    recommendation: string
    why: string
  }
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const severityConfig = {
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      badge: 'bg-red-100 text-red-800',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    suggestion: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badge: 'bg-blue-100 text-blue-800',
    },
    praise: {
      icon: CheckCircle,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      badge: 'bg-green-100 text-green-800',
    },
  }

  const config = severityConfig[suggestion.severity]
  const Icon = config.icon

  return (
    <Card className={`${config.bg} ${config.border}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 ${config.text} mt-0.5`} />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded ${config.badge}`}>
                {suggestion.category}
              </span>
              <span className="text-xs text-slate-600">
                {suggestion.file}
                {suggestion.line && `:${suggestion.line}`}
              </span>
            </div>

            <p className={`font-medium ${config.text}`}>
              {suggestion.issue}
            </p>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-700">Recommendation: </span>
                <span className="text-slate-700">{suggestion.recommendation}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Why: </span>
                <span className="text-slate-600">{suggestion.why}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 3: Create review result component**

Create `components/code-review/ReviewResult.tsx`:
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SuggestionCard } from './SuggestionCard'

interface ReviewResultProps {
  review: {
    overallScore: number
    scores: {
      functionality: number
      codeQuality: number
      aiBestPractices: number
      architecture: number
    }
    suggestions: any[]
    goodPractices: string[]
    criticalIssues: string[]
    improvementsNeeded: string[]
    summary: string
  }
}

export function ReviewResult({ review }: ReviewResultProps) {
  const scoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const errors = review.suggestions.filter(s => s.severity === 'error')
  const warnings = review.suggestions.filter(s => s.severity === 'warning')
  const suggestions = review.suggestions.filter(s => s.severity === 'suggestion')
  const praise = review.suggestions.filter(s => s.severity === 'praise')

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
          <CardDescription>{review.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className={`text-6xl font-bold ${scoreColor(review.overallScore)}`}>
              {review.overallScore}/100
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(review.scores).map(([key, score]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`font-medium ${scoreColor(score)}`}>
                    {score}/100
                  </span>
                </div>
                <Progress value={score} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {review.criticalIssues.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">Critical Issues</CardTitle>
            <CardDescription>These must be fixed</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {review.criticalIssues.map((issue, i) => (
                <li key={i} className="text-red-800">{issue}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Good Practices */}
      {review.goodPractices.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Good Practices</CardTitle>
            <CardDescription>Things you did well</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {review.goodPractices.map((practice, i) => (
                <li key={i} className="text-green-800">{practice}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Detailed Feedback */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Detailed Feedback</h2>

        {errors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-red-900">
              Errors ({errors.length})
            </h3>
            {errors.map((suggestion, i) => (
              <SuggestionCard key={i} suggestion={suggestion} />
            ))}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-yellow-900">
              Warnings ({warnings.length})
            </h3>
            {warnings.map((suggestion, i) => (
              <SuggestionCard key={i} suggestion={suggestion} />
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-blue-900">
              Suggestions ({suggestions.length})
            </h3>
            {suggestions.map((suggestion, i) => (
              <SuggestionCard key={i} suggestion={suggestion} />
            ))}
          </div>
        )}

        {praise.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-green-900">
              Praise ({praise.length})
            </h3>
            {praise.map((suggestion, i) => (
              <SuggestionCard key={i} suggestion={suggestion} />
            ))}
          </div>
        )}
      </div>

      {/* Improvements Needed */}
      {review.improvementsNeeded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Improvements</CardTitle>
            <CardDescription>Consider addressing these</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {review.improvementsNeeded.map((improvement, i) => (
                <li key={i} className="text-slate-700">{improvement}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add components/code-review/
git commit -m "feat: add code review UI components"
```

---

(Continuing with Task 6-8 in the next file...)

**Step 5: Commit final**

```bash
git add .
git commit -m "chore: Week 6 complete - code review AI ready"
git push
```

---

## Week 6 Completion Checklist

- [ ] Database schema for code reviews
- [ ] GitHub integration working
- [ ] Code review service with AI
- [ ] Review API endpoint
- [ ] Submission form UI
- [ ] Review results display
- [ ] Suggestion categorization
- [ ] Review history
- [ ] Dashboard integration
- [ ] End-to-end testing
- [ ] Documentation created
- [ ] Code pushed to GitHub

---

## Next Steps (Week 7-8)

After Week 6, continue to Weeks 7-8 for Project Workspace and Labs Infrastructure.
