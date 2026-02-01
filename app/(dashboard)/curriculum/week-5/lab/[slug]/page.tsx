import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, ArrowLeft } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lab = await prisma.lab.findUnique({
    where: { slug: params.slug }
  })

  return {
    title: lab?.title || 'Lab',
    description: lab?.description || 'Complete lab exercises'
  }
}

// Exercise instructions and templates
const exerciseDetails = {
  1: {
    instructions: `Implement a web search tool using the Tavily API. Your tool should:
- Accept a search query and optional max results parameter
- Call the Tavily API endpoint with proper authentication
- Format results with title, content snippet, and URL
- Handle API errors gracefully and return meaningful error messages
- Return structured data that can be used by the agent

This tool will enable your Research Agent to gather real-time information from the web.`,
    template: `export const webSearchTool: Tool = {
  name: 'web_search',
  description: 'Search the web for information using Tavily API',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query'
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results to return (default: 5)'
      }
    },
    required: ['query']
  },
  execute: async (input) => {
    // Your implementation here
    // 1. Extract query and maxResults from input
    // 2. Call Tavily API
    // 3. Format and return results
  }
}`
  },
  2: {
    instructions: `Build the synthesis logic that combines multiple search results into a coherent report. Your implementation should:
- Accept an array of search results from the web search tool
- Track all sources with proper citations (numbered references)
- Identify key findings and themes across multiple sources
- Generate a structured output with sections and bullet points
- Include a "Sources" section with all references at the end
- Avoid hallucinating information not present in the sources

The synthesis loop is the core of the Research Agent's ability to create comprehensive reports.`,
    template: `interface SearchResult {
  title: string;
  content: string;
  url: string;
}

interface SynthesizedReport {
  summary: string;
  keyFindings: string[];
  sources: Array<{ number: number; title: string; url: string }>;
}

async function synthesize(results: SearchResult[]): Promise<SynthesizedReport> {
  // Your implementation here
  // 1. Initialize sources array
  // 2. Extract key points from each result
  // 3. Combine information coherently
  // 4. Format with citations
  // 5. Return structured report
}`
  },
  3: {
    instructions: `Create a tool that analyzes code structure using AST (Abstract Syntax Tree) parsing. Your tool should:
- Accept source code as a string and language type (JavaScript/TypeScript/Python)
- Parse the code into an AST structure
- Extract functions, classes, imports, and exports
- Calculate basic complexity metrics (function length, nesting depth)
- Return structured analysis data
- Handle parsing errors gracefully

For this exercise, you can use a simplified regex-based approach or leverage a proper AST library like @babel/parser for JS/TS or ast module for Python.`,
    template: `interface CodeAnalysis {
  functions: Array<{ name: string; lines: number; complexity: number }>;
  classes: Array<{ name: string; methods: number }>;
  imports: string[];
  issues: Array<{ line: number; message: string; severity: string }>;
}

export const astParserTool: Tool = {
  name: 'parse_code',
  description: 'Analyze code structure and extract metrics',
  parameters: {
    type: 'object',
    properties: {
      code: { type: 'string', description: 'Source code to analyze' },
      language: { type: 'string', enum: ['javascript', 'typescript', 'python'] }
    },
    required: ['code', 'language']
  },
  execute: async (input) => {
    // Your implementation here
  }
}`
  },
  4: {
    instructions: `Implement severity categorization for code issues. Your function should:
- Accept detected code issues with descriptions
- Categorize each issue as CRITICAL, HIGH, MEDIUM, or LOW severity
- Apply consistent criteria:
  * CRITICAL: Security vulnerabilities, data loss risks
  * HIGH: Functionality bugs, performance issues
  * MEDIUM: Code quality, maintainability concerns
  * LOW: Style inconsistencies, minor improvements
- Return structured feedback with severity levels and recommendations
- Provide clear reasoning for each severity assignment

This scoring system helps prioritize code review feedback effectively.`,
    template: `type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface CodeIssue {
  line: number;
  message: string;
  type: string; // e.g., 'security', 'bug', 'style', 'performance'
}

interface ScoredIssue extends CodeIssue {
  severity: Severity;
  recommendation: string;
}

function categorizeSeverity(issue: CodeIssue): ScoredIssue {
  // Your implementation here
  // 1. Analyze issue type and message
  // 2. Apply severity rules
  // 3. Add recommendation
  // 4. Return scored issue
}

function scoreAllIssues(issues: CodeIssue[]): ScoredIssue[] {
  return issues.map(categorizeSeverity);
}`
  },
  5: {
    instructions: `Build a knowledge base search tool that finds relevant articles for customer queries. Your tool should:
- Accept a search query string
- Search through KB articles (use mock data for this exercise)
- Calculate relevance scores using keyword matching or semantic similarity
- Return top N most relevant results sorted by score
- Handle "no results found" cases gracefully
- Include article title, excerpt, and relevance score in results

You can use simple string matching (TF-IDF) or vector search if you have access to an embedding model.`,
    template: `interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface SearchResult {
  article: KBArticle;
  relevanceScore: number;
  matchedExcerpt: string;
}

export const kbSearchTool: Tool = {
  name: 'search_kb',
  description: 'Search knowledge base for relevant articles',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      topN: { type: 'number', description: 'Number of results (default: 3)' }
    },
    required: ['query']
  },
  execute: async (input) => {
    // Mock KB articles for testing
    const articles: KBArticle[] = [
      {
        id: '1',
        title: 'How to reset your password',
        content: 'To reset your password, go to Settings > Account...',
        category: 'account'
      },
      // Add more mock articles
    ];

    // Your implementation here
    // 1. Calculate relevance scores
    // 2. Sort by score
    // 3. Return top N results
  }
}`
  },
  6: {
    instructions: `Implement escalation decision logic for the Customer Support Agent. Your function should:
- Evaluate the agent's confidence score (0-1)
- Check for sensitive topics (account security, billing disputes, bug reports)
- Detect sentiment indicators (angry, frustrated, urgent)
- Decide whether to escalate to a human agent
- Return escalation decision with clear reasoning
- Define escalation rules such as:
  * Confidence < 0.7 → escalate
  * Sensitive topics → escalate
  * Negative sentiment + low confidence → escalate

Clear escalation rules ensure customers get appropriate support quickly.`,
    template: `interface EscalationContext {
  query: string;
  confidenceScore: number; // 0-1
  detectedTopics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface EscalationDecision {
  shouldEscalate: boolean;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

const SENSITIVE_TOPICS = ['account', 'billing', 'security', 'bug', 'refund'];
const CONFIDENCE_THRESHOLD = 0.7;

function decideEscalation(context: EscalationContext): EscalationDecision {
  // Your implementation here
  // 1. Check confidence threshold
  // 2. Detect sensitive topics
  // 3. Factor in sentiment
  // 4. Return decision with reasoning
}

// Example usage:
const decision = decideEscalation({
  query: "I can't access my account and need to cancel my subscription",
  confidenceScore: 0.6,
  detectedTopics: ['account', 'billing'],
  sentiment: 'negative'
});`
  }
};

export default async function LabPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) return null

  // Fetch lab
  const lab = await prisma.lab.findUnique({
    where: { slug: params.slug },
    include: { week: true }
  })

  if (!lab) notFound()

  const exercises = lab.exercises as Array<{
    number: number
    title: string
    type: string
  }>

  // Fetch user's lab submissions
  const submissions = await prisma.labSubmission.findMany({
    where: {
      userId: user.id,
      labId: lab.id
    },
    orderBy: { exerciseNumber: 'asc' }
  })

  const submissionMap = new Map(
    submissions.map(s => [s.exerciseNumber, s])
  )

  // Capture values for server action
  const labId = lab.id
  const weekId = lab.weekId
  const totalExercises = exercises.length

  // Submit exercise action
  async function submitExercise(formData: FormData) {
    'use server'
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) return

    const exerciseNumber = parseInt(formData.get('exerciseNumber') as string)
    const submissionText = formData.get('submission') as string

    // Create or update submission
    await prisma.labSubmission.upsert({
      where: {
        userId_labId_exerciseNumber: {
          userId: user.id,
          labId: labId,
          exerciseNumber
        }
      },
      create: {
        userId: user.id,
        labId: labId,
        exerciseNumber,
        submissionData: { text: submissionText },
        completed: true
      },
      update: {
        submissionData: { text: submissionText },
        completed: true,
        submittedAt: new Date()
      }
    })

    // Check if all exercises are completed
    const allSubmissions = await prisma.labSubmission.findMany({
      where: {
        userId: user.id,
        labId: labId,
        completed: true
      }
    })

    // If all exercises completed, update week progress
    if (allSubmissions.length === totalExercises) {
      await prisma.userWeekProgress.upsert({
        where: {
          userId_weekId: {
            userId: user.id,
            weekId: weekId
          }
        },
        create: {
          userId: user.id,
          weekId: weekId,
          conceptsTotal: 4, // Week 5 has 4 concepts
          labCompleted: true
        },
        update: {
          labCompleted: true
        }
      })
    }

    redirect(`/curriculum/week-5/lab/${params.slug}`)
  }

  const completedCount = submissions.filter(s => s.completed).length
  const progressPercent = Math.round((completedCount / exercises.length) * 100)

  return (
    <div className="container max-w-4xl py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/curriculum/week-5" className="hover:text-foreground">
          Week 5
        </Link>
        <span>/</span>
        <span>Lab</span>
        <span>/</span>
        <span className="text-foreground">{lab.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{lab.title}</h1>
        <p className="text-lg text-muted-foreground">{lab.description}</p>
      </div>

      {/* Progress */}
      <Card className="mb-8 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Progress</CardTitle>
            <div className="text-sm text-muted-foreground">
              {completedCount} / {exercises.length} exercises
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <div className="space-y-6">
        {exercises.map((exercise) => {
          const submission = submissionMap.get(exercise.number)
          const isCompleted = submission?.completed || false
          const details = exerciseDetails[exercise.number as keyof typeof exerciseDetails]

          return (
            <Card
              key={exercise.number}
              className={`border-2 transition-colors ${
                isCompleted
                  ? 'border-green-200 bg-green-50 dark:bg-green-950'
                  : 'bg-white hover:border-blue-300'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>Exercise {exercise.number}: {exercise.title}</CardTitle>
                      {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-medium">
                    {exercise.type}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Exercise Instructions */}
                <div className="mb-4 space-y-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {details?.instructions}
                    </p>
                  </div>

                  {/* Code Template */}
                  {details?.template && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2">Template:</h4>
                      <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto text-xs border border-slate-200 dark:border-slate-800">
                        <code>{details.template}</code>
                      </pre>
                    </div>
                  )}
                </div>

                {/* Submission Form */}
                <form action={submitExercise} className="space-y-4">
                  <input type="hidden" name="exerciseNumber" value={exercise.number} />
                  <div>
                    <label htmlFor={`submission-${exercise.number}`} className="block text-sm font-medium mb-2">
                      Your submission
                    </label>
                    <Textarea
                      id={`submission-${exercise.number}`}
                      name="submission"
                      placeholder="Paste your implementation code, explain your approach, include any challenges you faced, or describe how you tested your solution..."
                      rows={8}
                      defaultValue={submission?.submissionData ? (submission.submissionData as any).text : ''}
                      required
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isCompleted ? 'Update Submission' : 'Submit Exercise'}
                  </Button>
                </form>

                {isCompleted && submission && (
                  <div className="mt-4 text-xs text-muted-foreground">
                    Last submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Completion Card */}
      {completedCount === exercises.length && (
        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
              Lab Completed!
            </CardTitle>
            <CardDescription className="text-base">
              Excellent work! You&apos;ve successfully implemented all three agent patterns:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li><strong>Research Agent</strong>: Web search tool and synthesis loop for comprehensive reports</li>
              <li><strong>Code Review Agent</strong>: AST parser and severity scoring for automated code analysis</li>
              <li><strong>Customer Support Agent</strong>: KB search and escalation logic for intelligent support</li>
            </ul>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Next step: Complete the Week 5 project to build a full multi-agent system that coordinates these patterns together.
              </p>
              <Link href="/curriculum/week-5">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Week 5
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
