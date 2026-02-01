# Platform Week 11: Content Creation System + Module Builder

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build comprehensive content management system for creating, organizing, and delivering educational modules with AI-powered assistance.

**Architecture:** MDX-based content with frontmatter, rich editor with AI assistance, module builder with drag-drop, progress tracking with analytics.

**Tech Stack:** MDX, TipTap editor, DnD Kit, Recharts, @vercel/og for social cards

---

## Task 1: MDX Content Infrastructure

**Files:**
- Create: `src/lib/mdx/index.ts`
- Create: `src/lib/mdx/plugins.ts`
- Create: `src/lib/mdx/components.tsx`
- Create: `contentlayer.config.ts`
- Create: `content/modules/module-1-foundations/lesson-1-intro.mdx` (example)
- Modify: `package.json` (add contentlayer dependencies)
- Docs: `docs/content/mdx-setup.md`

**Step 1: Install MDX dependencies**

Run:
```bash
npm install @contentlayer/core @contentlayer/cli contentlayer next-contentlayer
npm install -D remark-gfm remark-math rehype-katex rehype-prism-plus rehype-slug rehype-autolink-headings
```

Expected: Dependencies installed successfully

**Step 2: Create Contentlayer configuration**

Create `contentlayer.config.ts`:

```typescript
import { defineDocumentType, makeSource } from '@contentlayer/source-files'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export const Lesson = defineDocumentType(() => ({
  name: 'Lesson',
  filePathPattern: 'modules/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      required: true,
    },
    module: {
      type: 'string',
      required: true,
    },
    order: {
      type: 'number',
      required: true,
    },
    duration: {
      type: 'number',
      description: 'Estimated duration in minutes',
      required: true,
    },
    difficulty: {
      type: 'enum',
      options: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    tags: {
      type: 'list',
      of: { type: 'string' },
      default: [],
    },
    objectives: {
      type: 'list',
      of: { type: 'string' },
      required: true,
    },
    prerequisites: {
      type: 'list',
      of: { type: 'string' },
      default: [],
    },
    published: {
      type: 'boolean',
      default: false,
    },
    publishedAt: {
      type: 'date',
    },
    updatedAt: {
      type: 'date',
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('modules/', ''),
    },
    slugAsParams: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.split('/').slice(1).join('/'),
    },
    readingTime: {
      type: 'number',
      resolve: (doc) => {
        const wordsPerMinute = 200
        const wordCount = doc.body.raw.split(/\s+/).length
        return Math.ceil(wordCount / wordsPerMinute)
      },
    },
  },
}))

export const Module = defineDocumentType(() => ({
  name: 'Module',
  filePathPattern: 'modules/*/index.mdx',
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      required: true,
    },
    order: {
      type: 'number',
      required: true,
    },
    icon: {
      type: 'string',
      required: true,
    },
    color: {
      type: 'string',
      required: true,
    },
    duration: {
      type: 'string',
      description: 'Total module duration (e.g., "2 weeks")',
      required: true,
    },
    published: {
      type: 'boolean',
      default: false,
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.sourceFileDir,
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Lesson, Module],
  mdx: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypePrismPlus,
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
})
```

**Step 3: Create MDX components**

Create `src/lib/mdx/components.tsx`:

```typescript
import Image from 'next/image'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Custom components for MDX
const components = {
  Image,

  // Enhanced code blocks
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm" {...props}>
      {children}
    </pre>
  ),

  // Callout component
  Callout: ({ type = 'info', title, children }: {
    type?: 'info' | 'warning' | 'danger' | 'success'
    title?: string
    children: React.ReactNode
  }) => {
    const variants = {
      info: 'border-blue-500 bg-blue-50 text-blue-900',
      warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
      danger: 'border-red-500 bg-red-50 text-red-900',
      success: 'border-green-500 bg-green-50 text-green-900',
    }

    return (
      <Alert className={variants[type]}>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{children}</AlertDescription>
      </Alert>
    )
  },

  // Interactive code sandbox
  CodeSandbox: ({ id, title }: { id: string; title?: string }) => (
    <div className="my-6">
      <iframe
        src={`https://codesandbox.io/embed/${id}?fontsize=14&theme=dark`}
        style={{
          width: '100%',
          height: '500px',
          border: 0,
          borderRadius: '8px',
          overflow: 'hidden',
        }}
        title={title || 'Code Sandbox'}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  ),

  // Exercise component
  Exercise: ({ title, difficulty, children }: {
    title: string
    difficulty: 'easy' | 'medium' | 'hard'
    children: React.ReactNode
  }) => (
    <Card className="my-6 border-purple-200 bg-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-900">{title}</CardTitle>
          <span className={`text-xs font-semibold uppercase ${
            difficulty === 'easy' ? 'text-green-600' :
            difficulty === 'medium' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {difficulty}
          </span>
        </div>
      </CardHeader>
      <CardContent className="text-purple-900">
        {children}
      </CardContent>
    </Card>
  ),

  // Quiz component
  Quiz: ({ questions }: {
    questions: Array<{
      question: string
      options: string[]
      correctAnswer: number
      explanation: string
    }>
  }) => {
    // Interactive quiz implementation
    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Knowledge Check</CardTitle>
          <CardDescription>Test your understanding</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quiz implementation with state management */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx}>
                <p className="font-medium">{q.question}</p>
                {/* Options and answer checking */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  },

  // Tabs for code examples
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
}

export default components
```

**Step 4: Create example lesson content**

Create `content/modules/module-1-foundations/lesson-1-intro.mdx`:

```mdx
---
title: "Introduction to AI Engineering"
description: "Learn the fundamentals of AI engineering and what makes it different from traditional software development"
module: "module-1-foundations"
order: 1
duration: 45
difficulty: "beginner"
tags: ["ai-engineering", "fundamentals", "introduction"]
objectives:
  - "Understand what AI engineering is"
  - "Learn the key differences from traditional development"
  - "Explore the AI engineering lifecycle"
published: true
publishedAt: 2026-02-01
---

# Introduction to AI Engineering

Welcome to the AI Architect Accelerator! In this lesson, you'll learn what AI engineering is and how it differs from traditional software development.

## What is AI Engineering?

AI Engineering is the practice of building production-ready applications that leverage Large Language Models (LLMs) and other AI capabilities.

<Callout type="info" title="Key Insight">
AI Engineering is not about training models—it's about **using** pre-trained models effectively in real-world applications.
</Callout>

## The AI Engineering Stack

```typescript
// Traditional backend API
app.post('/api/analyze', async (req, res) => {
  const result = await analyzeData(req.body)
  res.json(result)
})

// AI-powered API
app.post('/api/analyze', async (req, res) => {
  const context = await buildContext(req.body)
  const llmResponse = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    messages: [{ role: 'user', content: context }]
  })
  res.json(llmResponse)
})
```

<Tabs defaultValue="python">
  <TabsList>
    <TabsTrigger value="python">Python</TabsTrigger>
    <TabsTrigger value="typescript">TypeScript</TabsTrigger>
  </TabsList>
  <TabsContent value="python">
    ```python
    from anthropic import Anthropic

    client = Anthropic(api_key="your-api-key")
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": "Hello, Claude!"}
        ]
    )
    print(message.content)
    ```
  </TabsContent>
  <TabsContent value="typescript">
    ```typescript
    import Anthropic from '@anthropic-ai/sdk'

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello, Claude!' }],
    })

    console.log(message.content)
    ```
  </TabsContent>
</Tabs>

## Key Concepts

### 1. Prompt Engineering

The art of crafting effective prompts to get the best results from LLMs.

### 2. Context Management

Managing the information provided to the model within token limits.

### 3. Error Handling

LLM responses are probabilistic—robust error handling is essential.

<Callout type="warning" title="Common Pitfall">
Don't assume LLM outputs are always valid JSON or follow your expected format. Always validate!
</Callout>

## Exercise: Your First AI Call

<Exercise title="Make Your First Claude API Call" difficulty="easy">
  1. Get your API key from console.anthropic.com
  2. Install the Anthropic SDK: `npm install @anthropic-ai/sdk`
  3. Write code to send a message and log the response
  4. Experiment with different prompts

  **Bonus:** Try using system messages to set Claude's behavior
</Exercise>

## Next Steps

In the next lesson, we'll dive deeper into prompt engineering techniques and learn how to structure effective prompts for different use cases.

<Callout type="success" title="You've Learned">
- What AI engineering is and why it matters
- The basic structure of an AI-powered API
- Key concepts like prompts, context, and error handling
- How to make your first Claude API call
</Callout>
```

**Step 5: Test MDX rendering**

Run:
```bash
npm run contentlayer build
```

Expected: Content processed successfully with no errors

**Step 6: Document MDX setup**

Create `docs/content/mdx-setup.md`:

```markdown
# MDX Content Setup

## Directory Structure

```
content/
├── modules/
│   ├── module-1-foundations/
│   │   ├── index.mdx (module metadata)
│   │   ├── lesson-1-intro.mdx
│   │   ├── lesson-2-prompts.mdx
│   │   └── ...
│   ├── module-2-rag/
│   │   └── ...
```

## Frontmatter Fields

### Lesson Frontmatter
- `title`: Lesson title
- `description`: Brief description
- `module`: Module ID
- `order`: Lesson order within module
- `duration`: Estimated minutes
- `difficulty`: beginner | intermediate | advanced
- `tags`: Array of tags
- `objectives`: Learning objectives
- `prerequisites`: Required prior knowledge
- `published`: Publication status

### Module Frontmatter
- `title`: Module title
- `description`: Module description
- `order`: Module order in curriculum
- `icon`: Icon name
- `color`: Theme color
- `duration`: Total duration
- `published`: Publication status

## Custom Components

### Callout
```mdx
<Callout type="info" title="Title">
  Content
</Callout>
```

### Exercise
```mdx
<Exercise title="Exercise Name" difficulty="easy">
  Instructions
</Exercise>
```

### CodeSandbox
```mdx
<CodeSandbox id="sandbox-id" title="Demo" />
```

### Quiz
```mdx
<Quiz questions={[...]} />
```

## Building Content

Generate content:
```bash
npm run contentlayer build
```

Watch for changes:
```bash
npm run contentlayer dev
```
```

**Step 7: Commit MDX infrastructure**

```bash
git add contentlayer.config.ts src/lib/mdx/ content/ docs/content/mdx-setup.md package.json
git commit -m "feat: add MDX content infrastructure with custom components"
```

---

## Task 2: Rich Content Editor with AI Assistance

**Files:**
- Create: `src/components/editor/RichEditor.tsx`
- Create: `src/components/editor/EditorToolbar.tsx`
- Create: `src/components/editor/AIAssistant.tsx`
- Create: `src/lib/editor/extensions.ts`
- Create: `src/lib/editor/ai-suggestions.ts`
- Create: `app/admin/editor/page.tsx`
- Docs: `docs/content/editor-guide.md`

**Step 1: Install TipTap dependencies**

Run:
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-code-block-lowlight @tiptap/extension-link @tiptap/extension-image @tiptap/extension-table
npm install lowlight highlight.js
```

Expected: Editor dependencies installed

**Step 2: Create editor extensions**

Create `src/lib/editor/extensions.ts`:

```typescript
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'

// Register languages
lowlight.registerLanguage('typescript', typescript)
lowlight.registerLanguage('python', python)

export const extensions = [
  StarterKit.configure({
    codeBlock: false, // Replaced by CodeBlockLowlight
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-600 underline hover:text-blue-800',
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class: 'rounded-lg max-w-full',
    },
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableCell,
  TableHeader,
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: 'typescript',
  }),
]
```

**Step 3: Create AI suggestion system**

Create `src/lib/editor/ai-suggestions.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface AISuggestion {
  type: 'improve' | 'expand' | 'simplify' | 'fix'
  original: string
  suggested: string
  explanation: string
}

export async function getAISuggestions(
  content: string,
  instruction: string
): Promise<AISuggestion> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `You are a technical writing assistant helping create educational content.

Original content:
${content}

Instruction: ${instruction}

Provide an improved version and explain your changes. Format your response as JSON:
{
  "suggested": "improved content here",
  "explanation": "brief explanation of changes"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = JSON.parse(text)

  return {
    type: 'improve',
    original: content,
    suggested: parsed.suggested,
    explanation: parsed.explanation,
  }
}

export async function generateExercise(lessonContent: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `Based on this lesson content, generate a practical coding exercise:

${lessonContent}

Create an exercise in MDX format using the <Exercise> component. Make it hands-on and practical.`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function generateQuiz(lessonContent: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Based on this lesson content, generate a 3-question multiple choice quiz:

${lessonContent}

Format as MDX <Quiz> component with questions array. Test understanding, not memorization.`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
```

**Step 4: Create AI assistant component**

Create `src/components/editor/AIAssistant.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Loader2, Sparkles, CheckCircle, XCircle } from 'lucide-react'

interface AIAssistantProps {
  selectedText: string
  onApplySuggestion: (text: string) => void
}

export function AIAssistant({ selectedText, onApplySuggestion }: AIAssistantProps) {
  const [instruction, setInstruction] = useState('')
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getSuggestion = async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/editor/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: selectedText,
          instruction: instruction || type,
        }),
      })

      const data = await response.json()
      setSuggestion(data.suggested)
      setExplanation(data.explanation)
    } catch (error) {
      console.error('Failed to get suggestion:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold">AI Writing Assistant</h3>
      </div>

      {selectedText && (
        <div className="p-3 bg-slate-50 rounded text-sm">
          <p className="text-slate-600 mb-1">Selected text:</p>
          <p className="line-clamp-3">{selectedText}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => getSuggestion('improve clarity and conciseness')}
          disabled={!selectedText || loading}
        >
          Improve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => getSuggestion('expand with more details and examples')}
          disabled={!selectedText || loading}
        >
          Expand
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => getSuggestion('simplify for beginners')}
          disabled={!selectedText || loading}
        >
          Simplify
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => getSuggestion('fix grammar and spelling')}
          disabled={!selectedText || loading}
        >
          Fix Grammar
        </Button>
      </div>

      <div>
        <Textarea
          placeholder="Or describe what you want to change..."
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          rows={2}
        />
        <Button
          className="mt-2 w-full"
          onClick={() => getSuggestion(instruction)}
          disabled={!selectedText || !instruction || loading}
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Get Custom Suggestion
        </Button>
      </div>

      {suggestion && (
        <div className="space-y-2">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm font-medium text-green-900 mb-1">Suggested:</p>
            <p className="text-sm text-green-800">{suggestion}</p>
          </div>

          {explanation && (
            <p className="text-xs text-slate-600 italic">{explanation}</p>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onApplySuggestion(suggestion)
                setSuggestion(null)
              }}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSuggestion(null)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
```

**Step 5: Create rich editor component**

Create `src/components/editor/RichEditor.tsx`:

```typescript
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { extensions } from '@/lib/editor/extensions'
import { EditorToolbar } from './EditorToolbar'
import { AIAssistant } from './AIAssistant'
import { useState } from 'react'

interface RichEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
}

export function RichEditor({ initialContent = '', onChange }: RichEditorProps) {
  const [selectedText, setSelectedText] = useState('')

  const editor = useEditor({
    extensions,
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to)
      setSelectedText(text)
    },
  })

  const applySuggestion = (text: string) => {
    if (!editor) return
    const { from, to } = editor.state.selection
    editor.chain().focus().deleteRange({ from, to }).insertContent(text).run()
  }

  if (!editor) return null

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 space-y-2">
        <EditorToolbar editor={editor} />
        <div className="border rounded-lg">
          <EditorContent
            editor={editor}
            className="prose prose-slate max-w-none p-4 min-h-[600px] focus:outline-none"
          />
        </div>
      </div>

      <div className="col-span-1">
        <AIAssistant
          selectedText={selectedText}
          onApplySuggestion={applySuggestion}
        />
      </div>
    </div>
  )
}
```

**Step 6: Create editor API route**

Create `app/api/editor/ai-suggest/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAISuggestions } from '@/lib/editor/ai-suggestions'

export async function POST(request: NextRequest) {
  try {
    const { content, instruction } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const suggestion = await getAISuggestions(content, instruction)

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error('AI suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    )
  }
}
```

**Step 7: Test editor**

Run:
```bash
npm run dev
# Navigate to /admin/editor
```

Expected: Rich editor loads with AI assistant, suggestions work

**Step 8: Commit editor implementation**

```bash
git add src/components/editor/ src/lib/editor/ app/api/editor/ app/admin/editor/
git commit -m "feat: add rich content editor with AI writing assistant"
```

---

## Task 3: Module Builder and Curriculum Management

**Files:**
- Create: `src/components/curriculum/ModuleBuilder.tsx`
- Create: `src/components/curriculum/LessonDragDrop.tsx`
- Create: `src/components/curriculum/ModulePreview.tsx`
- Create: `app/admin/curriculum/page.tsx`
- Create: `src/lib/curriculum/module-operations.ts`
- Docs: `docs/content/module-builder.md`

**Step 1: Install drag-and-drop dependencies**

Run:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected: DnD dependencies installed

**Step 2: Create lesson drag-and-drop component**

Create `src/components/curriculum/LessonDragDrop.tsx`:

```typescript
'use client'

import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, FileText, Clock, BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Lesson {
  id: string
  title: string
  duration: number
  difficulty: string
  order: number
}

interface LessonItemProps {
  lesson: Lesson
}

function LessonItem({ lesson }: LessonItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 mb-2 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-slate-400" />
        </div>

        <FileText className="h-5 w-5 text-blue-600" />

        <div className="flex-1">
          <h4 className="font-medium">{lesson.title}</h4>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lesson.duration} min
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              {lesson.difficulty}
            </span>
          </div>
        </div>

        <span className="text-sm text-slate-500">#{lesson.order}</span>
      </div>
    </Card>
  )
}

interface LessonDragDropProps {
  lessons: Lesson[]
  onReorder: (lessons: Lesson[]) => void
}

export function LessonDragDrop({ lessons, onReorder }: LessonDragDropProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = lessons.findIndex((l) => l.id === active.id)
      const newIndex = lessons.findIndex((l) => l.id === over.id)

      const reordered = arrayMove(lessons, oldIndex, newIndex).map((lesson, idx) => ({
        ...lesson,
        order: idx + 1,
      }))

      onReorder(reordered)
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
        <div>
          {lessons.map((lesson) => (
            <LessonItem key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

**Step 3: Create module builder**

Create `src/components/curriculum/ModuleBuilder.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LessonDragDrop } from './LessonDragDrop'
import { Plus, Save, Eye } from 'lucide-react'

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

export function ModuleBuilder() {
  const [module, setModule] = useState<Module>({
    id: '',
    title: '',
    description: '',
    lessons: [],
  })

  const updateModule = (field: keyof Module, value: any) => {
    setModule((prev) => ({ ...prev, [field]: value }))
  }

  const handleReorderLessons = (reorderedLessons: Lesson[]) => {
    setModule((prev) => ({ ...prev, lessons: reorderedLessons }))
  }

  const saveModule = async () => {
    const response = await fetch('/api/curriculum/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(module),
    })

    if (response.ok) {
      alert('Module saved successfully!')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Module Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={module.title}
              onChange={(e) => updateModule('title', e.target.value)}
              placeholder="Module 1: AI Engineering Foundations"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={module.description}
              onChange={(e) => updateModule('description', e.target.value)}
              placeholder="Learn the fundamentals of AI engineering..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lessons</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Lesson
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <LessonDragDrop
            lessons={module.lessons}
            onReorder={handleReorderLessons}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={saveModule}>
          <Save className="h-4 w-4 mr-2" />
          Save Module
        </Button>
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>
    </div>
  )
}
```

**Step 4: Create module operations**

Create `src/lib/curriculum/module-operations.ts`:

```typescript
import { prisma } from '@/lib/db'

export async function createModule(data: {
  title: string
  description: string
  order: number
}) {
  return await prisma.module.create({
    data: {
      ...data,
      published: false,
    },
  })
}

export async function updateModuleLessons(
  moduleId: string,
  lessons: Array<{ id: string; order: number }>
) {
  await prisma.$transaction(
    lessons.map((lesson) =>
      prisma.lesson.update({
        where: { id: lesson.id },
        data: { order: lesson.order },
      })
    )
  )
}

export async function publishModule(moduleId: string) {
  return await prisma.module.update({
    where: { id: moduleId },
    data: { published: true, publishedAt: new Date() },
  })
}

export async function getModuleWithProgress(moduleId: string, userId: string) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          progress: {
            where: { userId },
          },
        },
      },
    },
  })

  return module
}
```

**Step 5: Test module builder**

Run:
```bash
npm run dev
# Navigate to /admin/curriculum
```

Expected: Can create modules, drag-drop lessons, save changes

**Step 6: Commit module builder**

```bash
git add src/components/curriculum/ src/lib/curriculum/ app/admin/curriculum/
git commit -m "feat: add module builder with drag-drop lesson ordering"
```

---

## Task 4: Progress Tracking and Analytics

**Files:**
- Create: `src/lib/analytics/progress-tracking.ts`
- Create: `src/components/analytics/ProgressDashboard.tsx`
- Create: `src/components/analytics/CompletionChart.tsx`
- Create: `app/api/progress/track/route.ts`
- Create: `app/student/progress/page.tsx`
- Docs: `docs/content/analytics.md`

**Step 1: Install chart dependencies**

Run:
```bash
npm install recharts date-fns
```

Expected: Chart dependencies installed

**Step 2: Create progress tracking system**

Create `src/lib/analytics/progress-tracking.ts`:

```typescript
import { prisma } from '@/lib/db'

export async function trackLessonProgress(
  userId: string,
  lessonId: string,
  progressPercent: number
) {
  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
    create: {
      userId,
      lessonId,
      progressPercent,
      startedAt: new Date(),
      lastAccessedAt: new Date(),
    },
    update: {
      progressPercent,
      lastAccessedAt: new Date(),
      completedAt: progressPercent >= 100 ? new Date() : null,
    },
  })
}

export async function getUserProgress(userId: string) {
  const progress = await prisma.lessonProgress.findMany({
    where: { userId },
    include: {
      lesson: {
        include: {
          module: true,
        },
      },
    },
  })

  const moduleProgress = new Map<string, {
    moduleId: string
    moduleName: string
    totalLessons: number
    completedLessons: number
    progressPercent: number
  }>()

  progress.forEach((p) => {
    const moduleId = p.lesson.module.id
    if (!moduleProgress.has(moduleId)) {
      moduleProgress.set(moduleId, {
        moduleId,
        moduleName: p.lesson.module.title,
        totalLessons: 0,
        completedLessons: 0,
        progressPercent: 0,
      })
    }

    const mp = moduleProgress.get(moduleId)!
    mp.totalLessons++
    if (p.progressPercent >= 100) {
      mp.completedLessons++
    }
    mp.progressPercent = (mp.completedLessons / mp.totalLessons) * 100
  })

  return {
    lessons: progress,
    modules: Array.from(moduleProgress.values()),
  }
}

export async function getPlatformAnalytics() {
  const [
    totalUsers,
    totalModules,
    totalLessons,
    completionData,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.module.count({ where: { published: true } }),
    prisma.lesson.count({ where: { published: true } }),
    prisma.lessonProgress.groupBy({
      by: ['completedAt'],
      _count: true,
      where: {
        completedAt: {
          not: null,
        },
      },
    }),
  ])

  return {
    totalUsers,
    totalModules,
    totalLessons,
    completionData,
  }
}
```

**Step 3: Create completion chart**

Create `src/components/analytics/CompletionChart.tsx`:

```typescript
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface CompletionChartProps {
  data: Array<{
    date: Date
    completions: number
  }>
}

export function CompletionChart({ data }: CompletionChartProps) {
  const chartData = data.map((d) => ({
    date: format(new Date(d.date), 'MMM dd'),
    completions: d.completions,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="completions"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

**Step 4: Create progress dashboard**

Create `src/components/analytics/ProgressDashboard.tsx`:

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface Module {
  moduleName: string
  totalLessons: number
  completedLessons: number
  progressPercent: number
}

interface ProgressDashboardProps {
  modules: Module[]
  totalTimeSpent: number
  streak: number
}

export function ProgressDashboard({
  modules,
  totalTimeSpent,
  streak,
}: ProgressDashboardProps) {
  const totalLessons = modules.reduce((acc, m) => acc + m.totalLessons, 0)
  const completedLessons = modules.reduce((acc, m) => acc + m.completedLessons, 0)
  const overallProgress = (completedLessons / totalLessons) * 100

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(0)}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedLessons} / {totalLessons}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTimeSpent}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak} days</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modules.map((module) => (
            <div key={module.moduleName}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{module.moduleName}</span>
                <span className="text-sm text-slate-600">
                  {module.completedLessons} / {module.totalLessons} lessons
                </span>
              </div>
              <Progress value={module.progressPercent} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 5: Create progress tracking API**

Create `app/api/progress/track/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { trackLessonProgress } from '@/lib/analytics/progress-tracking'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { lessonId, progressPercent } = await request.json()

    await trackLessonProgress(session.user.id, lessonId, progressPercent)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Progress tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track progress' },
      { status: 500 }
    )
  }
}
```

**Step 6: Test progress tracking**

Run:
```bash
npm run dev
# Navigate to /student/progress
```

Expected: Dashboard shows progress, charts render correctly

**Step 7: Commit analytics implementation**

```bash
git add src/lib/analytics/ src/components/analytics/ app/api/progress/ app/student/progress/
git commit -m "feat: add progress tracking and analytics dashboard"
```

---

## Verification Checklist

After completing Platform Week 11:

- [ ] MDX content builds without errors
- [ ] Custom components render in lessons
- [ ] Rich editor loads and saves content
- [ ] AI writing assistant provides suggestions
- [ ] Module builder allows drag-drop reordering
- [ ] Progress tracking updates in real-time
- [ ] Analytics dashboard displays charts
- [ ] All documentation is complete

## Next Steps

- **Platform Week 12**: Final polish, comprehensive documentation, and launch preparation
