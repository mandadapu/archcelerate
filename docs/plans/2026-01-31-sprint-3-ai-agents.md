# Sprint 3: AI Agents Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Sprint 3 (AI Agents) with complete learning content (3 concepts, 4 labs, 1 project) about agent architectures, tool use, and multi-step task automation.

**Architecture:** Follow Sprint 1-2 structure with MDX concepts, JSON lab specs, and project specification. Focus on practical agent patterns (ReAct, tool use, error recovery).

**Tech Stack:** Next.js 14, TypeScript, MDX, Claude API with tool use, Tavily Search API (optional)

---

## Task 1: Create Sprint 3 Content Structure

**Files:**
- Create: `content/sprints/sprint-3/metadata.json`
- Create: `content/sprints/sprint-3/concepts/` (directory)

**Step 1: Create sprint-3 directory structure**

Run:
```bash
mkdir -p content/sprints/sprint-3/concepts
```

**Step 2: Create Sprint 3 metadata**

Create `content/sprints/sprint-3/metadata.json`:

```json
{
  "id": "sprint-3",
  "title": "AI Agents (Multi-Step Task Automation)",
  "description": "Build intelligent agents that can plan, use tools, and execute complex multi-step tasks",
  "order": 3,
  "concepts": [
    {
      "id": "agent-architectures",
      "title": "Agent Architectures (ReAct & Planning)",
      "description": "Learn how AI agents reason, plan, and execute multi-step tasks",
      "difficulty": "advanced",
      "estimatedMinutes": 60,
      "order": 1,
      "prerequisites": ["llm-fundamentals", "prompt-engineering"],
      "tags": ["agents", "react", "planning", "reasoning"]
    },
    {
      "id": "tool-use",
      "title": "Tool Use & Function Calling",
      "description": "Enable AI agents to use external tools and APIs through function calling",
      "difficulty": "advanced",
      "estimatedMinutes": 60,
      "order": 2,
      "prerequisites": ["agent-architectures"],
      "tags": ["agents", "tools", "function-calling", "apis"]
    },
    {
      "id": "agent-loops",
      "title": "Agent Loops & Error Recovery",
      "description": "Build robust agents with retry logic, error handling, and iterative refinement",
      "difficulty": "advanced",
      "estimatedMinutes": 90,
      "order": 3,
      "prerequisites": ["agent-architectures", "tool-use"],
      "tags": ["agents", "loops", "error-recovery", "production"]
    }
  ]
}
```

**Step 3: Commit**

```bash
git add content/sprints/sprint-3/metadata.json
git commit -m "feat: add Sprint 3 metadata structure

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Concept 1 - Agent Architectures

**Files:**
- Create: `content/sprints/sprint-3/concepts/agent-architectures.mdx`

**Step 1: Write agent architectures concept**

Create comprehensive MDX content covering:
- What are AI agents
- ReAct pattern (Reasoning + Acting)
- Planning approaches (chain-of-thought, tree-of-thought)
- Agent execution flow
- Real-world examples
- Best practices

**Step 2: Commit**

```bash
git add content/sprints/sprint-3/concepts/agent-architectures.mdx
git commit -m "feat: add agent architectures concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Concept 2 - Tool Use & Function Calling

**Files:**
- Create: `content/sprints/sprint-3/concepts/tool-use.mdx`

**Step 1: Write tool use concept**

Create comprehensive MDX content covering:
- What is tool use / function calling
- Claude's tool use API
- Tool definition schema
- Tool execution patterns
- Common tools (search, calculator, database)
- Security considerations
- Best practices

**Step 2: Commit**

```bash
git add content/sprints/sprint-3/concepts/tool-use.mdx
git commit -m "feat: add tool use & function calling concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Concept 3 - Agent Loops & Error Recovery

**Files:**
- Create: `content/sprints/sprint-3/concepts/agent-loops.mdx`

**Step 1: Write agent loops concept**

Create comprehensive MDX content covering:
- Agent loop architecture
- State management in agents
- Retry logic and exponential backoff
- Error recovery strategies
- Graceful degradation
- Monitoring and observability
- Production patterns

**Step 2: Commit**

```bash
git add content/sprints/sprint-3/concepts/agent-loops.mdx
git commit -m "feat: add agent loops & error recovery concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Lab Exercises Specifications

**Files:**
- Create: `content/sprints/sprint-3/labs/` (directory)
- Create: `content/sprints/sprint-3/labs/lab-1-tool-definition.json`
- Create: `content/sprints/sprint-3/labs/lab-2-function-calling.json`
- Create: `content/sprints/sprint-3/labs/lab-3-retry-logic.json`
- Create: `content/sprints/sprint-3/labs/lab-4-agent-loop.json`

**Step 1: Create labs directory**

Run:
```bash
mkdir -p content/sprints/sprint-3/labs
```

**Step 2: Create Lab 1 - Tool Definition**

Create `content/sprints/sprint-3/labs/lab-1-tool-definition.json`:

```json
{
  "id": "lab-1-tool-definition",
  "title": "Define Custom Tools",
  "description": "Create tool definitions for AI agents to use",
  "difficulty": "intermediate",
  "estimatedMinutes": 30,
  "language": "javascript",
  "starterCode": "/**\n * Define a calculator tool for basic math operations\n * @returns Tool definition object\n */\nfunction defineCalculatorTool() {\n  // Your code here\n  return {\n    name: '',\n    description: '',\n    input_schema: {}\n  }\n}\n",
  "instructions": "Implement `defineCalculatorTool()` that returns a tool definition with:\n1. name: 'calculator'\n2. description: Clear explanation of what the tool does\n3. input_schema: JSON schema with properties for operation (add/subtract/multiply/divide) and numbers array\n\nFollow Claude's tool use format.",
  "testCases": [
    {
      "input": "defineCalculatorTool().name",
      "expectedOutput": "calculator",
      "description": "Tool has correct name"
    },
    {
      "input": "defineCalculatorTool().input_schema.properties.operation",
      "expectedOutput": "object",
      "description": "Schema defines operation property"
    }
  ],
  "hints": [
    "Use JSON Schema format for input_schema",
    "operation should be an enum: ['add', 'subtract', 'multiply', 'divide']",
    "numbers should be an array of numbers",
    "Mark required fields in schema"
  ]
}
```

**Step 3: Create Lab 2 - Function Calling**

Create `content/sprints/sprint-3/labs/lab-2-function-calling.json`:

```json
{
  "id": "lab-2-function-calling",
  "title": "Implement Function Calling",
  "description": "Execute tool calls from AI agent responses",
  "difficulty": "intermediate",
  "estimatedMinutes": 30,
  "language": "javascript",
  "starterCode": "/**\n * Execute a tool call\n * @param {string} toolName - Name of the tool\n * @param {object} toolInput - Input parameters\n * @returns Result of tool execution\n */\nfunction executeTool(toolName, toolInput) {\n  // Your code here\n  return null\n}\n\n/**\n * Calculator tool implementation\n */\nfunction calculator(operation, numbers) {\n  // Your code here\n  return 0\n}\n",
  "instructions": "Implement:\n1. `calculator(operation, numbers)`: Performs math operations\n   - 'add': sum all numbers\n   - 'subtract': subtract from first number\n   - 'multiply': multiply all numbers\n   - 'divide': divide first by rest\n\n2. `executeTool(toolName, toolInput)`: Routes to correct tool\n   - If toolName is 'calculator', call calculator function\n   - Return tool result",
  "testCases": [
    {
      "input": "calculator('add', [1, 2, 3])",
      "expectedOutput": "6",
      "description": "Addition works"
    },
    {
      "input": "calculator('multiply', [2, 3, 4])",
      "expectedOutput": "24",
      "description": "Multiplication works"
    },
    {
      "input": "executeTool('calculator', {operation: 'add', numbers: [5, 5]})",
      "expectedOutput": "10",
      "description": "Tool execution works"
    }
  ],
  "hints": [
    "Use switch or if-else for operation types",
    "reduce() is useful for array operations",
    "executeTool should handle unknown tools gracefully"
  ]
}
```

**Step 4: Create Lab 3 - Retry Logic**

Create `content/sprints/sprint-3/labs/lab-3-retry-logic.json`:

```json
{
  "id": "lab-3-retry-logic",
  "title": "Implement Retry Logic",
  "description": "Build robust retry mechanisms with exponential backoff",
  "difficulty": "advanced",
  "estimatedMinutes": 45,
  "language": "javascript",
  "starterCode": "/**\n * Retry a function with exponential backoff\n * @param {Function} fn - Function to retry\n * @param {number} maxRetries - Maximum retry attempts\n * @param {number} baseDelay - Base delay in ms\n * @returns Result of function or throws error\n */\nasync function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {\n  // Your code here\n  return null\n}\n\n/**\n * Sleep for specified milliseconds\n */\nfunction sleep(ms) {\n  return new Promise(resolve => setTimeout(resolve, ms))\n}\n",
  "instructions": "Implement `retryWithBackoff()` that:\n1. Tries to execute fn()\n2. If it fails, wait baseDelay * (2 ^ attempt) ms\n3. Retry up to maxRetries times\n4. If all retries fail, throw the last error\n5. If succeeds, return the result\n\nExponential backoff: 1s, 2s, 4s, 8s, etc.",
  "testCases": [
    {
      "input": "retryWithBackoff(() => Promise.resolve(42), 3, 100)",
      "expectedOutput": "42",
      "description": "Returns result on success"
    },
    {
      "input": "let count = 0; retryWithBackoff(() => { count++; if (count < 2) throw new Error(); return 'ok'; }, 3, 10)",
      "expectedOutput": "ok",
      "description": "Retries on failure then succeeds"
    }
  ],
  "hints": [
    "Use a for loop for retry attempts",
    "Calculate delay: baseDelay * Math.pow(2, attempt)",
    "Use try-catch to handle errors",
    "await sleep(delay) between retries"
  ]
}
```

**Step 5: Create Lab 4 - Agent Loop**

Create `content/sprints/sprint-3/labs/lab-4-agent-loop.json`:

```json
{
  "id": "lab-4-agent-loop",
  "title": "Build Agent Loop",
  "description": "Create a complete agent loop with reasoning and tool use",
  "difficulty": "advanced",
  "estimatedMinutes": 60,
  "language": "javascript",
  "starterCode": "/**\n * Agent loop that reasons and uses tools\n * @param {string} task - Task to accomplish\n * @param {Array} tools - Available tools\n * @param {number} maxIterations - Max loop iterations\n * @returns Final answer\n */\nasync function agentLoop(task, tools, maxIterations = 5) {\n  // Your code here\n  // 1. Start with the task\n  // 2. Agent thinks about next action\n  // 3. Execute tool if needed\n  // 4. Update context with result\n  // 5. Repeat until done or max iterations\n  // 6. Return final answer\n  return ''\n}\n\n/**\n * Mock function to get agent's next action\n */\nfunction getAgentAction(context, tools) {\n  // Simulates LLM deciding what to do next\n  return {\n    thought: 'I need to search for information',\n    action: 'search',\n    actionInput: { query: 'example' },\n    finished: false\n  }\n}\n",
  "instructions": "Build a complete agent loop that:\n1. Maintains conversation context (task, tool results, thoughts)\n2. Calls getAgentAction() to decide next step\n3. Executes tools when action is specified\n4. Adds results to context\n5. Continues until agent sets finished: true or maxIterations reached\n6. Returns the final answer\n\nThe loop should handle multiple iterations of: Think → Act → Observe",
  "testCases": [
    {
      "input": "agentLoop('test task', [], 1).includes('answer')",
      "expectedOutput": "true",
      "description": "Returns an answer"
    }
  ],
  "hints": [
    "Use a while loop with iteration counter",
    "Build context as array of {role, content} messages",
    "Check getAgentAction().finished to break loop",
    "Handle tool execution similar to Lab 2"
  ]
}
```

**Step 6: Commit**

```bash
git add content/sprints/sprint-3/labs/
git commit -m "feat: add Sprint 3 lab exercise specifications

- Lab 1: Define custom tools with JSON schema
- Lab 2: Implement function calling and tool execution
- Lab 3: Build retry logic with exponential backoff
- Lab 4: Create complete agent loop with reasoning

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Project Specification

**Files:**
- Create: `content/sprints/sprint-3/project.json`

**Step 1: Create project specification**

Create `content/sprints/sprint-3/project.json`:

```json
{
  "id": "research-agent",
  "title": "Research Agent with Multi-Step Planning",
  "description": "Build an AI agent that researches topics, analyzes sources, and generates comprehensive reports",
  "difficulty": "advanced",
  "estimatedHours": 4,
  "technologies": ["Next.js", "Claude API", "Tavily Search API", "TypeScript"],
  "learningObjectives": [
    "Implement ReAct agent pattern",
    "Use Claude's tool calling API",
    "Build multi-step task planning",
    "Handle iterative refinement",
    "Create structured report generation",
    "Implement error recovery"
  ],
  "requirements": {
    "functional": [
      "Accept research topic as input",
      "Plan research strategy (what to search)",
      "Search for relevant sources (5+ sources)",
      "Analyze and synthesize information",
      "Generate structured report with citations",
      "Display agent's reasoning process",
      "Handle errors and retry failures"
    ],
    "technical": [
      "Use Claude API with tool calling",
      "Implement search tool (Tavily or similar)",
      "Build ReAct agent loop",
      "Store and display agent steps",
      "Implement retry logic for API failures",
      "Rate limit search queries"
    ],
    "ui": [
      "Topic input form",
      "Live agent progress display (thinking, searching, analyzing)",
      "Step-by-step execution log",
      "Final report with sections and citations",
      "Source list with URLs",
      "Error messages and retry indicators"
    ]
  },
  "successCriteria": [
    {
      "criterion": "Research Quality",
      "description": "Report covers 5+ relevant sources with accurate information",
      "weight": 30
    },
    {
      "criterion": "Agent Reasoning",
      "description": "Clear thought process visible, logical planning",
      "weight": 25
    },
    {
      "criterion": "Report Structure",
      "description": "Well-organized report with intro, body, conclusion, citations",
      "weight": 20
    },
    {
      "criterion": "Error Handling",
      "description": "Gracefully handles API failures, retries appropriately",
      "weight": 15
    },
    {
      "criterion": "Code Quality",
      "description": "Clean code, proper types, good UX",
      "weight": 10
    }
  ],
  "testTopics": [
    "Recent developments in AI agent architectures",
    "How vector databases work",
    "Best practices for prompt engineering",
    "Comparison of different LLM APIs",
    "Latest research on retrieval-augmented generation"
  ],
  "starterFiles": {
    "structure": [
      "app/api/research/route.ts",
      "lib/research-agent.ts",
      "lib/tools/search-tool.ts",
      "lib/tools/tool-registry.ts",
      "components/ResearchAgent.tsx",
      "components/AgentStepDisplay.tsx",
      "components/ResearchReport.tsx"
    ]
  },
  "technicalGuidance": {
    "agentPattern": "Use ReAct (Reason + Act) with Claude tool calling",
    "searchAPI": "Tavily Search API (free tier: 1000 requests/month) or Brave Search API",
    "toolDefinition": "Follow Claude's tool use schema with name, description, input_schema",
    "loopControl": "Max 10 iterations, break when agent returns final_answer",
    "caching": "Cache search results for same queries (5 min TTL)",
    "rateLimit": "5 searches per research task maximum"
  },
  "deploymentRequirements": {
    "platform": "Vercel",
    "environment": [
      "ANTHROPIC_API_KEY",
      "TAVILY_API_KEY (or BRAVE_API_KEY)"
    ],
    "instructions": "Deploy to Vercel, configure API keys, set rate limits"
  },
  "estimatedCosts": {
    "development": {
      "search": "$0 (free tier)",
      "llm": "$1.00 (testing 20 research tasks)",
      "total": "$1.00"
    },
    "production": {
      "search": "$0-5/month (depends on usage)",
      "llm": "$10/month (50 research tasks)",
      "total": "$10-15/month"
    }
  },
  "extensionIdeas": [
    "Add web scraping tool to read full articles",
    "Implement memory for follow-up research",
    "Add visualization tool for creating charts/diagrams",
    "Build database query tool for structured data",
    "Add email tool to send reports",
    "Implement parallel search across multiple sources",
    "Add fact-checking tool to verify claims",
    "Build citation graph visualization"
  ],
  "rubric": {
    "exceeds": "Report is comprehensive, well-structured, cites 7+ sources, agent reasoning is transparent, handles errors gracefully, polished UI",
    "meets": "Report covers 5+ sources, logical structure, visible agent steps, basic error handling, functional UI",
    "approaching": "Report has 3-4 sources, some structure issues, limited visibility into agent reasoning, minimal error handling",
    "incomplete": "<3 sources, poorly structured, agent loop doesn't work properly, or not deployed"
  }
}
```

**Step 2: Commit**

```bash
git add content/sprints/sprint-3/project.json
git commit -m "feat: add Sprint 3 project specification

Research Agent with:
- Multi-step planning and execution
- Tool use (search, analysis)
- ReAct pattern implementation
- Structured report generation
- Error handling and retry logic

Estimated: 3-5 hours, $1 development cost

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Build and Test Sprint 3 Content

**Files:**
- Test: Build succeeds
- Test: All Sprint 3 routes load

**Step 1: Run build**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 2: Verify content structure**

Run:
```bash
ls -la content/sprints/sprint-3/concepts/
ls -la content/sprints/sprint-3/labs/
```

Expected: All 3 concept files and 4 lab files present

**Step 3: Commit**

```bash
git add .
git commit -m "test: verify Sprint 3 content structure and build

✓ Build passes successfully
✓ All 3 concept files present
✓ All 4 lab files present
✓ metadata.json configured
✓ project.json complete

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Update Dashboard to Show Sprint 3

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

**Step 1: Add Sprint 3 progress fetching**

Add after Sprint 2 progress:
```typescript
const sprint3Progress = user ? await getSprintProgress(user.id, 'sprint-3') : null
```

**Step 2: Add Sprint 3 card to dashboard**

Add after Sprint 2 card:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Sprint 3</CardTitle>
    <CardDescription>AI Agents</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-slate-600 mb-4">
      Build intelligent agents that plan and execute multi-step tasks
    </p>
    {sprint3Progress && sprint3Progress.totalCount > 0 ? (
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-600">
            <span>
              {sprint3Progress.completedCount} of {sprint3Progress.totalCount} concepts
            </span>
            <span className="font-medium">
              {Math.round(sprint3Progress.percentComplete)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${sprint3Progress.percentComplete}%` }}
            />
          </div>
        </div>
        <Link href="/learn/sprint-3">
          <Button size="sm" variant="outline" className="w-full">
            {sprint3Progress.completedCount === 0
              ? 'Start Sprint'
              : sprint3Progress.completedCount === sprint3Progress.totalCount
              ? 'Review Sprint'
              : 'Continue Sprint'}
          </Button>
        </Link>
      </div>
    ) : (
      <Link href="/learn/sprint-3">
        <Button size="sm" variant="outline">
          Start Sprint
        </Button>
      </Link>
    )}
  </CardContent>
</Card>
```

**Step 3: Commit**

```bash
git add "app/(dashboard)/dashboard/page.tsx"
git commit -m "feat: add Sprint 3 to dashboard display

- Fetch Sprint 3 progress
- Add Sprint 3 card with progress tracking
- Display 'AI Agents' description
- Link to /learn/sprint-3

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Documentation and README Update

**Files:**
- Modify: `README.md`
- Create: `docs/SPRINT-3-GUIDE.md`

**Step 1: Update README**

Add to Learning Platform features:
```markdown
- ✅ **Sprint 3**: AI Agents (ReAct, tool use, multi-step automation)
```

**Step 2: Create Sprint 3 guide**

Create comprehensive `docs/SPRINT-3-GUIDE.md` with:
- Overview of Sprint 3
- Learning path (3 concepts, 4 labs, 1 project)
- Technical details on ReAct pattern and tool use
- Testing checklist
- Common issues and solutions
- Deployment notes
- Resources

**Step 3: Commit**

```bash
git add README.md docs/SPRINT-3-GUIDE.md
git commit -m "docs: add Sprint 3 documentation and update README

- Update README with Sprint 3 in Learning Platform
- Create comprehensive Sprint 3 implementation guide
- Document agent patterns, tool use, and best practices

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Verification

After completing all tasks:

1. **Build passes**: `npm run build` succeeds
2. **All routes load**: Sprint 3 pages accessible
3. **Content quality**: Concepts are comprehensive and accurate
4. **Labs functional**: Lab exercises have clear instructions and test cases
5. **Project well-defined**: Project spec has clear requirements and rubric
6. **Documentation complete**: README and guides updated

---

## Summary

This plan implements Sprint 3 with:
- ✅ Sprint structure (metadata, directories)
- ✅ 3 comprehensive concept lessons (agent architectures, tool use, agent loops)
- ✅ 4 hands-on lab exercises (tool definition, function calling, retry logic, agent loop)
- ✅ 1 real-world project (Research Agent with multi-step planning)
- ✅ Dashboard integration
- ✅ Complete documentation

**Total estimated time**: 6-8 hours of content creation
**Learner time**: 8-12 hours to complete sprint
**Infrastructure**: Reuses existing, adds tool use examples
