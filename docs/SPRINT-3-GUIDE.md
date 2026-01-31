# Sprint 3: AI Agents - Implementation Guide

## Overview

Sprint 3 teaches learners how to build autonomous AI agents that can break down complex tasks, use tools, and recover from errors. They'll learn the ReAct pattern, tool calling, agent loops, and production-ready error handling.

## Learning Path

### Concept 1: Agent Architectures & ReAct Pattern (60 min)
- What distinguishes AI agents from basic LLM applications
- The ReAct (Reasoning + Acting) pattern
- Agent execution loops (Think → Act → Observe)
- Different planning approaches (chain-of-thought, tree-of-thought)
- Real-world agent use cases and limitations
- Agent state management
- Tool registry and orchestration
- Common agent architectures (ReAct, Plan-and-Execute, Reflexion)

### Concept 2: Tool Use & Function Calling (75 min)
- Claude's tool use API and schema format
- Defining tools with JSON Schema
- Tool calling workflow
- Parsing and executing tool calls
- Handling tool results and errors
- Best practices for tool design
- Tool versioning and backward compatibility
- Multi-tool coordination
- Rate limiting and cost management
- Security considerations for tool use

### Concept 3: Agent Loops & Error Recovery (90 min)
- Building robust agent loops
- Max iteration limits and timeouts
- Retry logic with exponential backoff
- Graceful degradation strategies
- Circuit breakers for failing tools
- Agent memory and context management
- Debugging agent behavior
- Logging and observability
- Production deployment patterns
- Cost optimization strategies

## Lab Exercises

### Lab 1: Define Custom Tools (30 min)
Create tool definitions for AI agents to use.

**Skills**: JSON Schema, tool design, API specification

**Test Cases**:
- Tool has correct name
- Schema defines operation property
- Tool has a description
- Schema has required fields array
- Schema defines numbers property
- Operation has enum values

**Learning Outcomes**:
- Understand Claude's tool use format
- Design clear, usable tool interfaces
- Define proper JSON Schema constraints

### Lab 2: Implement Function Calling (30 min)
Execute tool calls from AI agent responses.

**Skills**: Tool routing, function execution, error handling

**Test Cases**:
- Addition works correctly
- Multiplication works correctly
- Tool execution routes properly
- Subtraction works correctly
- Division works correctly
- Handles unknown tools gracefully

**Learning Outcomes**:
- Parse tool call requests
- Route to correct tool implementation
- Handle invalid tool names
- Return structured tool results

### Lab 3: Implement Retry Logic (45 min)
Build robust retry mechanisms with exponential backoff.

**Skills**: Async error handling, exponential backoff, resilience patterns

**Test Cases**:
- Returns result on success
- Returns result on first success
- Throws error after retries exhausted
- Retries until success

**Learning Outcomes**:
- Implement exponential backoff
- Handle transient failures
- Set retry limits
- Measure retry metrics

### Lab 4: Build Agent Loop (60 min)
Create a complete agent loop with reasoning and tool use.

**Skills**: Agent orchestration, state management, multi-step reasoning

**Test Cases**:
- Returns an answer
- Returns a string result
- Returns non-empty result
- Handles zero iterations
- Respects max iteration limit

**Learning Outcomes**:
- Implement Think → Act → Observe loop
- Manage agent state across iterations
- Handle loop termination conditions
- Build context for LLM calls

## Project: Research Agent with Multi-Step Planning

### Requirements

**Functional**:
- Accept research topic as input
- Plan research strategy (what to search)
- Search for relevant sources (5+ sources)
- Analyze and synthesize information
- Generate structured report with citations
- Display agent's reasoning process
- Handle errors and retry failures

**Technical**:
- Use Claude API with tool calling
- Implement search tool (Tavily or similar)
- Build ReAct agent loop
- Store and display agent steps
- Implement retry logic for API failures
- Rate limit search queries (5 max per task)

**UI**:
- Topic input form
- Live agent progress display (thinking, searching, analyzing)
- Step-by-step execution log
- Final report with sections and citations
- Source list with URLs
- Error messages and retry indicators

### Tech Stack
- **Next.js**: Full-stack application
- **Claude API**: Agent reasoning and generation
- **Tavily Search API**: Web search (free tier: 1000 requests/month)
- **TypeScript**: Type-safe agent implementation
- **React**: Interactive UI for agent progress

### Success Criteria

| Criterion | Description | Weight |
|-----------|-------------|--------|
| **Research Quality** | Report covers 5+ relevant sources with accurate information | 30% |
| **Agent Reasoning** | Clear thought process visible, logical planning | 25% |
| **Report Structure** | Well-organized with intro, body, conclusion, citations | 20% |
| **Error Handling** | Gracefully handles API failures, retries appropriately | 15% |
| **Code Quality** | Clean code, proper types, good UX | 10% |

### Rubric

- **Exceeds**: Report is comprehensive, well-structured, cites 7+ sources, agent reasoning is transparent, handles errors gracefully, polished UI
- **Meets**: Report covers 5+ sources, logical structure, visible agent steps, basic error handling, functional UI
- **Approaching**: Report has 3-4 sources, some structure issues, limited visibility into agent reasoning, minimal error handling
- **Incomplete**: <3 sources, poorly structured, agent loop doesn't work properly, or not deployed

### Test Topics
1. Recent developments in AI agent architectures
2. How vector databases work
3. Best practices for prompt engineering
4. Comparison of different LLM APIs
5. Latest research on retrieval-augmented generation

### Estimated Time
4-5 hours

### Estimated Cost

**Development**:
- Search: $0 (free tier)
- LLM: $1.00 (testing 20 research tasks)
- Total: $1.00

**Production**:
- Search: $0-5/month (depends on usage)
- LLM: $10/month (50 research tasks)
- Total: $10-15/month

### Starter File Structure
```
app/api/research/route.ts          # API endpoint for research
lib/research-agent.ts               # Core agent implementation
lib/tools/search-tool.ts            # Search tool definition
lib/tools/tool-registry.ts          # Tool management
components/ResearchAgent.tsx        # Main UI component
components/AgentStepDisplay.tsx     # Step-by-step progress
components/ResearchReport.tsx       # Final report display
```

## Technical Guidance

### Agent Pattern
Use ReAct (Reason + Act) with Claude's tool calling:
```typescript
interface AgentStep {
  thought: string
  action?: {
    tool: string
    input: any
  }
  observation?: string
  finalAnswer?: string
}
```

### Search API
**Recommended**: Tavily Search API
- Free tier: 1000 requests/month
- Simple JSON API
- High-quality results

**Alternative**: Brave Search API

### Tool Definition
Follow Claude's tool use schema:
```typescript
const searchTool = {
  name: "search",
  description: "Search the web for information",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query"
      }
    },
    required: ["query"]
  }
}
```

### Loop Control
- **Max iterations**: 10
- **Break condition**: Agent returns `final_answer`
- **Timeout**: 60 seconds total
- **Rate limit**: 5 searches per research task

### Caching
Cache search results for same queries:
- TTL: 5 minutes
- Key: `search:${hash(query)}`
- Reduces API costs and latency

## Testing Sprint 3

### Manual Testing Checklist
- [ ] Navigate to /learn/sprint-3
- [ ] Read all 3 concept pages
- [ ] Verify MDX rendering and code examples
- [ ] Check mermaid diagrams display correctly
- [ ] Complete all 4 lab exercises
- [ ] Verify Monaco editor loads
- [ ] Test lab test cases pass
- [ ] Review project requirements

### Lab Testing
- [ ] Lab 1: Define tool schema, validate structure
- [ ] Lab 2: Execute tool calls, handle errors
- [ ] Lab 3: Retry with backoff, respect limits
- [ ] Lab 4: Build agent loop, terminate correctly

### Project Testing
- [ ] Research agent accepts topic input
- [ ] Agent displays thinking steps
- [ ] Searches for 5+ relevant sources
- [ ] Generates structured report
- [ ] Includes proper citations
- [ ] Handles API failures gracefully
- [ ] Respects rate limits
- [ ] Completes within 60 seconds

### Content Quality
- [ ] All code examples are syntactically correct
- [ ] Concepts flow logically
- [ ] No broken links or references
- [ ] Consistent formatting throughout
- [ ] Mermaid diagrams render properly

## Common Issues

### Tool Call Parsing Errors
**Error**: `Invalid tool call format`

**Solution**:
```typescript
// Always validate tool calls before execution
function validateToolCall(toolCall: any): boolean {
  return (
    toolCall.name &&
    typeof toolCall.name === 'string' &&
    toolCall.input &&
    typeof toolCall.input === 'object'
  )
}
```

### Agent Loops Don't Terminate
**Error**: Agent exceeds max iterations

**Causes**:
- Agent doesn't recognize task completion
- Tool keeps returning errors
- No final_answer in prompt instructions

**Solution**:
```typescript
// Add clear termination conditions
const MAX_ITERATIONS = 10
let iteration = 0

while (iteration < MAX_ITERATIONS) {
  const response = await callClaude(context, tools)

  if (response.finalAnswer) {
    return response.finalAnswer
  }

  iteration++
}

throw new Error('Agent exceeded max iterations')
```

### Exponential Backoff Not Working
**Error**: Retries happen too quickly or not at all

**Solution**:
```typescript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries - 1) throw error

      const delay = baseDelay * Math.pow(2, attempt)
      await sleep(delay)
    }
  }
}
```

### Search API Rate Limits
**Error**: `429 Too Many Requests`

**Solution**:
- Implement per-task search limit (5 max)
- Cache search results
- Add delay between searches
- Use batch search when possible

### Claude API Costs
For production, monitor token usage:
```typescript
// Track costs per research task
interface UsageMetrics {
  inputTokens: number
  outputTokens: number
  estimatedCost: number
}

function calculateCost(usage: UsageMetrics): number {
  const INPUT_COST_PER_1M = 3.00  // $3 per 1M tokens
  const OUTPUT_COST_PER_1M = 15.00 // $15 per 1M tokens

  return (
    (usage.inputTokens / 1_000_000) * INPUT_COST_PER_1M +
    (usage.outputTokens / 1_000_000) * OUTPUT_COST_PER_1M
  )
}
```

### TypeScript Type Issues
If you encounter type errors with tool calls:
```typescript
// Use proper types for tool definitions
interface Tool {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, any>
    required: string[]
  }
}

// Type tool call results
interface ToolResult {
  tool: string
  result: any
  error?: string
}
```

## Deployment Notes

### Environment Variables
Required for Sprint 3 features:
```env
# Claude API (already configured)
ANTHROPIC_API_KEY="sk-ant-..."

# Search API (choose one)
TAVILY_API_KEY="tvly-..."
BRAVE_API_KEY="..."

# Optional: Rate limiting
REDIS_URL="redis://..."  # For distributed rate limiting
```

### API Setup

**Tavily Search API**:
1. Go to [Tavily.com](https://tavily.com/)
2. Sign up for free account
3. Get API key from dashboard
4. Free tier: 1000 requests/month
5. Add to `.env.local`

**Brave Search API** (Alternative):
1. Go to [Brave Search API](https://brave.com/search/api/)
2. Sign up and get API key
3. Free tier: 2000 requests/month
4. Add to `.env.local`

### Database Changes
No database schema changes required for Sprint 3. Agent state is ephemeral (stored in memory during execution).

Optional: Add agent execution logs table for debugging:
```prisma
model AgentExecution {
  id          String   @id @default(cuid())
  userId      String
  topic       String
  steps       Json     // Array of {thought, action, observation}
  result      String?  @db.Text
  error       String?
  duration    Int      // milliseconds
  tokenUsage  Json?    // {input, output, cost}
  createdAt   DateTime @default(now())

  user User @relation(...)

  @@index([userId, createdAt])
}
```

### Performance Optimization
- **Agent Loops**: Set reasonable max iterations (10)
- **Timeouts**: 60 second max per research task
- **Caching**: Cache search results for 5 minutes
- **Rate Limiting**: 5 searches per task, 10 research tasks per user per day
- **Cost Monitoring**: Log token usage per execution

### Production Checklist
- [ ] Set up search API key (Tavily or Brave)
- [ ] Configure rate limits
- [ ] Add request timeouts
- [ ] Implement cost monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add analytics for agent steps
- [ ] Test with production API quotas
- [ ] Monitor search API usage
- [ ] Set up alerts for high costs

## Extension Ideas

For advanced learners who complete the project:

1. **Web Scraping Tool**: Add tool to read full articles from URLs
2. **Memory System**: Implement conversation memory for follow-up research
3. **Visualization Tool**: Create charts/diagrams from data
4. **Database Query Tool**: Search structured data
5. **Email Tool**: Send research reports via email
6. **Parallel Search**: Search multiple sources simultaneously
7. **Fact-Checking Tool**: Verify claims across sources
8. **Citation Graph**: Visualize relationships between sources
9. **PDF Export**: Generate downloadable research reports
10. **Collaborative Research**: Share and collaborate on research tasks
11. **Agent Monitoring**: Dashboard for agent performance metrics
12. **Custom Tools**: Let users define their own tools

## Resources

### Documentation
- [Anthropic Tool Use Guide](https://docs.anthropic.com/claude/docs/tool-use)
- [Claude Tool Use Examples](https://github.com/anthropics/anthropic-cookbook/tree/main/tool_use)
- [ReAct Paper](https://arxiv.org/abs/2210.03629)
- [LangChain Agents](https://js.langchain.com/docs/modules/agents/)

### Libraries
- [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk): Claude API client
- [zod](https://www.npmjs.com/package/zod): Runtime type validation for tool schemas
- [p-retry](https://www.npmjs.com/package/p-retry): Retry with exponential backoff
- [bottleneck](https://www.npmjs.com/package/bottleneck): Rate limiting

### Tools & APIs
- [Tavily Search](https://tavily.com/): AI-optimized search API
- [Brave Search](https://brave.com/search/api/): Privacy-focused search
- [Serper](https://serper.dev/): Google Search API
- [LangSmith](https://www.langchain.com/langsmith): Agent debugging and monitoring

### Articles & Tutorials
- [Building Reliable Agents](https://www.anthropic.com/research/building-reliable-agents)
- [LLM Agent Patterns](https://eugeneyan.com/writing/llm-patterns/#agents)
- [Agent Evaluation Best Practices](https://www.braintrust.dev/docs/guides/evals)
- [Production Agent Deployment](https://www.patterns.app/blog/llm-agent-deployment)

### Research Papers
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366)
- [Tree of Thoughts: Deliberate Problem Solving with LLMs](https://arxiv.org/abs/2305.10601)
- [Toolformer: Language Models Can Teach Themselves to Use Tools](https://arxiv.org/abs/2302.04761)

## Next Steps

After completing Sprint 3, learners will be ready for:
- **Sprint 4**: Multimodal AI (vision, audio, and beyond)
- **Sprint 5**: Production Deployment (scaling, monitoring, optimization)
- **Sprint 6**: Advanced Agents (multi-agent systems, planning)

Sprint 3 provides the foundation for building production-ready AI agents that can automate complex workflows, integrate with external systems, and handle real-world tasks with reliability and transparency.

## Debugging Agent Behavior

### Common Debugging Techniques

**1. Log all agent steps**:
```typescript
const steps: AgentStep[] = []

// After each step
steps.push({
  iteration: i,
  thought: response.thought,
  action: response.action,
  observation: toolResult,
  timestamp: Date.now()
})

// Save to database or file for analysis
await logAgentExecution(steps)
```

**2. Add visibility into reasoning**:
```typescript
// Display agent's internal thoughts
console.log(`[THOUGHT ${i}]: ${response.thought}`)
console.log(`[ACTION ${i}]: ${response.action?.tool} with ${JSON.stringify(response.action?.input)}`)
console.log(`[OBSERVATION ${i}]: ${observation}`)
```

**3. Set breakpoints in agent loop**:
```typescript
if (iteration === 3) {
  debugger // Pause to inspect agent state
}
```

**4. Track token usage per step**:
```typescript
const usage = response.usage
console.log(`Step ${i}: ${usage.input_tokens} in, ${usage.output_tokens} out`)
```

### Agent Not Making Progress

**Symptoms**: Agent repeats same action, doesn't reach conclusion

**Solutions**:
- Add previous actions to context so agent doesn't repeat
- Improve tool descriptions for clarity
- Add examples in system prompt
- Reduce max iterations to fail faster
- Add "you have already tried X" to prompt

### Agent Using Wrong Tools

**Symptoms**: Calls inappropriate tools for the task

**Solutions**:
- Improve tool descriptions with clear use cases
- Add examples of when to use each tool
- Reduce number of tools (less choice paralysis)
- Add tool selection prompt guidance
- Use tool categories/tags

## Production Best Practices

### 1. Cost Management
```typescript
// Set per-user budget limits
const DAILY_BUDGET_PER_USER = 1.00 // $1/day

// Track spending
async function checkBudget(userId: string): Promise<boolean> {
  const todaySpend = await getSpendToday(userId)
  return todaySpend < DAILY_BUDGET_PER_USER
}
```

### 2. Observability
```typescript
// Use structured logging
logger.info('agent_execution_started', {
  userId,
  topic,
  timestamp: Date.now()
})

logger.info('agent_step_completed', {
  iteration: i,
  tool: action?.tool,
  duration: stepDuration
})
```

### 3. Error Recovery
```typescript
// Graceful degradation
try {
  return await runAgentLoop(task)
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    return "I'm experiencing high demand. Please try again in a few minutes."
  }

  // Return partial results if available
  if (partialResults.length > 0) {
    return formatPartialResults(partialResults)
  }

  throw error
}
```

### 4. Security
```typescript
// Validate tool inputs
function sanitizeToolInput(input: any): any {
  // Remove dangerous characters
  // Validate against schema
  // Check for injection attacks
  return validated
}

// Rate limit per user
const limiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60_000 // 10 requests per minute
})
```

---

**Sprint 3 Complete!** You now have a comprehensive understanding of AI agents, tool use, and production deployment strategies. Ready to build autonomous systems that solve real-world problems.
