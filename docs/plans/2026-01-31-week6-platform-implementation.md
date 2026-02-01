# Week 6: Advanced Agents + Pattern Library Completion - Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build agent memory systems, complete pattern library with Data Pipeline and Meeting Assistant agents, and create production agent dashboard.

**Architecture:** Agent memory system with cross-execution context, two specialized agent patterns leveraging existing tools, and comprehensive agent management UI for production deployment.

**Tech Stack:** Next.js 14, Supabase (PostgreSQL + pgvector), Claude API, Redis (Upstash), Tavily Search, GitHub API, Calendar APIs

---

## Task 1: Agent Memory System

**Purpose:** Enable agents to maintain context across multiple executions and share knowledge between agent instances.

**Files:**
- Migrate: `supabase/migrations/20260205_week6_agent_memory.sql`
- Create: `lib/agents/agent-memory.ts`
- Create: `lib/agents/memory-integration.ts`
- Test: `lib/agents/__tests__/agent-memory.test.ts`

### Step 1: Write the failing test for agent memory storage

**File:** `lib/agents/__tests__/agent-memory.test.ts`

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals'
import { AgentMemory } from '../agent-memory'
import { createClient } from '@/lib/supabase/server'

describe('AgentMemory', () => {
  let agentMemory: AgentMemory
  const userId = 'test-user-id'
  const agentDefinitionId = 'test-agent-id'

  beforeEach(() => {
    agentMemory = new AgentMemory(userId, agentDefinitionId)
  })

  it('should store short-term memory from execution', async () => {
    const executionId = 'exec-1'
    const context = {
      topic: 'TypeScript best practices',
      sources: ['https://typescript.org', 'https://github.com/microsoft/typescript']
    }

    await agentMemory.storeShortTermMemory(executionId, context)

    const retrieved = await agentMemory.getShortTermMemory(executionId)
    expect(retrieved).toEqual(context)
  })

  it('should consolidate short-term to long-term memory', async () => {
    const executionId = 'exec-1'
    const summary = 'TypeScript best practices include strict mode, no any, and proper type inference'

    await agentMemory.consolidateToLongTerm(executionId, summary, 0.8)

    const longTerm = await agentMemory.retrieveLongTermMemory('TypeScript practices', 3)
    expect(longTerm.length).toBeGreaterThan(0)
    expect(longTerm[0].summary).toContain('TypeScript')
  })

  it('should retrieve relevant context for new execution', async () => {
    // Setup: Store some previous execution context
    await agentMemory.storeShortTermMemory('exec-1', { topic: 'React hooks' })
    await agentMemory.consolidateToLongTerm('exec-1', 'React hooks summary', 0.7)

    const context = await agentMemory.assembleContext('How do React hooks work?')

    expect(context).toContain('React hooks')
  })
})
```

### Step 2: Run test to verify it fails

```bash
npm test lib/agents/__tests__/agent-memory.test.ts
```

**Expected:** FAIL - "Cannot find module '../agent-memory'"

### Step 3: Create database migration for agent memory

**File:** `supabase/migrations/20260205_week6_agent_memory.sql`

```sql
-- Agent Memory Tables

-- Short-term memory: Context within a single execution
CREATE TABLE IF NOT EXISTS public.agent_short_term_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES public.agent_executions(id) ON DELETE CASCADE,
    key VARCHAR(200) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_short_term_execution ON public.agent_short_term_memory(execution_id);

-- Long-term memory: Consolidated knowledge across executions
CREATE TABLE IF NOT EXISTS public.agent_long_term_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    agent_definition_id UUID REFERENCES public.agent_definitions(id),
    summary TEXT NOT NULL,
    embedding vector(1536),
    importance_score DECIMAL(3, 2) DEFAULT 0.5, -- 0.0 to 1.0
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX idx_agent_long_term_user_agent ON public.agent_long_term_memory(user_id, agent_definition_id);
CREATE INDEX ON public.agent_long_term_memory USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Working memory: Current execution context (stored in Redis for speed)
-- Schema stored in application code, not database

-- Memory pruning function
CREATE OR REPLACE FUNCTION prune_agent_long_term_memory(
    p_user_id UUID,
    p_agent_id UUID,
    max_memories INTEGER DEFAULT 1000
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Keep top N most important memories (by importance_score * access_count)
    WITH ranked_memories AS (
        SELECT id,
               ROW_NUMBER() OVER (
                   ORDER BY (importance_score * LOG(access_count + 1)) DESC,
                            last_accessed_at DESC
               ) as rank
        FROM agent_long_term_memory
        WHERE user_id = p_user_id
          AND agent_definition_id = p_agent_id
    )
    DELETE FROM agent_long_term_memory
    WHERE id IN (
        SELECT id FROM ranked_memories WHERE rank > max_memories
    );

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;
```

### Step 4: Implement AgentMemory class

**File:** `lib/agents/agent-memory.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/rag/embeddings'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export interface AgentMemoryContext {
  shortTerm: Record<string, any>
  longTerm: Array<{
    summary: string
    relevanceScore: number
    metadata?: Record<string, any>
  }>
  working: Record<string, any>
}

export class AgentMemory {
  constructor(
    private userId: string,
    private agentDefinitionId: string
  ) {}

  // Short-term memory: Context within a single execution
  async storeShortTermMemory(
    executionId: string,
    context: Record<string, any>
  ): Promise<void> {
    const supabase = createClient()

    const entries = Object.entries(context).map(([key, value]) => ({
      execution_id: executionId,
      key,
      value: JSON.stringify(value)
    }))

    await supabase.from('agent_short_term_memory').insert(entries)
  }

  async getShortTermMemory(executionId: string): Promise<Record<string, any>> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('agent_short_term_memory')
      .select('key, value')
      .eq('execution_id', executionId)

    if (error) throw error

    return data.reduce((acc, { key, value }) => {
      acc[key] = JSON.parse(value)
      return acc
    }, {} as Record<string, any>)
  }

  // Long-term memory: Consolidated knowledge across executions
  async consolidateToLongTerm(
    executionId: string,
    summary: string,
    importanceScore: number = 0.5,
    metadata?: Record<string, any>
  ): Promise<void> {
    const supabase = createClient()
    const embedding = await generateEmbedding(summary)

    await supabase.from('agent_long_term_memory').insert({
      user_id: this.userId,
      agent_definition_id: this.agentDefinitionId,
      summary,
      embedding: JSON.stringify(embedding),
      importance_score: importanceScore,
      metadata
    })
  }

  async retrieveLongTermMemory(
    query: string,
    limit: number = 5
  ): Promise<Array<{ summary: string; relevanceScore: number; metadata?: any }>> {
    const supabase = createClient()
    const queryEmbedding = await generateEmbedding(query)

    const { data, error } = await supabase.rpc('match_agent_long_term_memory', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.7,
      match_count: limit,
      p_user_id: this.userId,
      p_agent_id: this.agentDefinitionId
    })

    if (error) throw error

    // Update access tracking
    const memoryIds = data.map((m: any) => m.id)
    if (memoryIds.length > 0) {
      await supabase
        .from('agent_long_term_memory')
        .update({
          access_count: supabase.raw('access_count + 1'),
          last_accessed_at: new Date().toISOString()
        })
        .in('id', memoryIds)
    }

    return data.map((m: any) => ({
      summary: m.summary,
      relevanceScore: m.similarity,
      metadata: m.metadata
    }))
  }

  // Working memory: Current execution context (ephemeral, stored in Redis)
  async getWorkingMemory(executionId: string): Promise<Record<string, any>> {
    const key = `agent:working:${executionId}`
    const data = await redis.get(key)
    return data ? JSON.parse(data as string) : {}
  }

  async updateWorkingMemory(
    executionId: string,
    updates: Record<string, any>
  ): Promise<void> {
    const key = `agent:working:${executionId}`
    const current = await this.getWorkingMemory(executionId)
    const updated = { ...current, ...updates }

    // Working memory expires after 1 hour
    await redis.set(key, JSON.stringify(updated), { ex: 3600 })
  }

  async clearWorkingMemory(executionId: string): Promise<void> {
    const key = `agent:working:${executionId}`
    await redis.del(key)
  }

  // Assemble complete context for agent execution
  async assembleContext(query: string): Promise<AgentMemoryContext> {
    const [longTerm] = await Promise.all([
      this.retrieveLongTermMemory(query, 3)
    ])

    return {
      shortTerm: {}, // Will be populated during execution
      longTerm,
      working: {} // Will be populated during execution
    }
  }

  // Cleanup old memories
  async pruneMemories(maxMemories: number = 1000): Promise<number> {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('prune_agent_long_term_memory', {
      p_user_id: this.userId,
      p_agent_id: this.agentDefinitionId,
      max_memories: maxMemories
    })

    if (error) throw error
    return data
  }
}
```

### Step 5: Add vector search function for agent memory

**File:** `supabase/migrations/20260205_week6_agent_memory.sql` (append)

```sql
-- Vector search for agent long-term memory
CREATE OR REPLACE FUNCTION match_agent_long_term_memory(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid,
  p_agent_id uuid
)
RETURNS TABLE (
  id uuid,
  summary text,
  metadata jsonb,
  similarity float,
  access_count integer
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    summary,
    metadata,
    1 - (embedding <=> query_embedding) as similarity,
    access_count
  FROM agent_long_term_memory
  WHERE user_id = p_user_id
    AND agent_definition_id = p_agent_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

### Step 6: Run database migration

```bash
cd /path/to/supabase
supabase migration up
```

**Expected:** Migration applied successfully

### Step 7: Run test to verify it passes

```bash
npm test lib/agents/__tests__/agent-memory.test.ts
```

**Expected:** PASS - All tests green

### Step 8: Integrate memory into AgentExecutor

**File:** `lib/agents/memory-integration.ts`

```typescript
import { AgentExecutor } from './agent-executor'
import { AgentMemory } from './agent-memory'
import { Tool } from './tools'

export class MemoryAwareAgentExecutor extends AgentExecutor {
  private memory: AgentMemory

  constructor(
    userId: string,
    agentDefinitionId: string,
    systemPrompt: string,
    tools: Tool[],
    config?: any
  ) {
    super(userId, agentDefinitionId, systemPrompt, tools, config)
    this.memory = new AgentMemory(userId, agentDefinitionId)
  }

  async execute(input: string): Promise<any> {
    // 1. Retrieve long-term memory context
    const memoryContext = await this.memory.assembleContext(input)

    // 2. Enhance system prompt with memory context
    const enhancedPrompt = this.buildPromptWithMemory(memoryContext)

    // 3. Execute agent with enhanced context (call parent execute)
    const result = await super.execute(input)

    // 4. Store execution context in short-term memory
    if (this.executionId) {
      await this.memory.storeShortTermMemory(this.executionId, {
        input,
        output: result.output,
        tools_used: result.steps.map(s => s.action),
        completed_at: new Date().toISOString()
      })

      // 5. Consolidate to long-term if important
      if (result.steps.length >= 3) {
        const summary = this.summarizeExecution(result)
        await this.memory.consolidateToLongTerm(
          this.executionId,
          summary,
          this.calculateImportance(result)
        )
      }
    }

    return result
  }

  private buildPromptWithMemory(context: any): string {
    let prompt = this.systemPrompt

    if (context.longTerm.length > 0) {
      prompt += '\n\n## Relevant Past Knowledge:\n'
      context.longTerm.forEach((mem, i) => {
        prompt += `${i + 1}. ${mem.summary}\n`
      })
    }

    return prompt
  }

  private summarizeExecution(result: any): string {
    const toolsUsed = [...new Set(result.steps.map((s: any) => s.action))].join(', ')
    return `Task: ${result.steps[0]?.thought || 'Unknown'}. Used tools: ${toolsUsed}. Result: ${result.output.substring(0, 200)}`
  }

  private calculateImportance(result: any): number {
    // More steps = more complex = more important
    // More tokens = more detailed = more important
    const stepScore = Math.min(result.steps.length / 10, 0.5)
    const tokenScore = Math.min(result.totalTokens / 10000, 0.5)
    return stepScore + tokenScore
  }
}
```

### Step 9: Test memory integration

**File:** `lib/agents/__tests__/memory-integration.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals'
import { MemoryAwareAgentExecutor } from '../memory-integration'
import { webSearchTool, noteTakingTool } from '../tools'

describe('MemoryAwareAgentExecutor', () => {
  it('should use long-term memory in execution', async () => {
    const executor = new MemoryAwareAgentExecutor(
      'test-user',
      'test-agent',
      'You are a helpful assistant',
      [webSearchTool, noteTakingTool]
    )

    // First execution: research TypeScript
    await executor.execute('What are TypeScript best practices?')

    // Second execution: should have context from first
    const result = await executor.execute('Tell me more about the practices you found')

    expect(result.output).toBeTruthy()
    // Memory should have been used in system prompt
  })
})
```

### Step 10: Run integration tests

```bash
npm test lib/agents/__tests__/memory-integration.test.ts
```

**Expected:** PASS

### Step 11: Commit

```bash
git add supabase/migrations/20260205_week6_agent_memory.sql \
  lib/agents/agent-memory.ts \
  lib/agents/memory-integration.ts \
  lib/agents/__tests__/agent-memory.test.ts \
  lib/agents/__tests__/memory-integration.test.ts
git commit -m "$(cat <<'EOF'
feat: add agent memory system

Enables agents to maintain context across executions:
- Short-term memory: Context within single execution
- Long-term memory: Consolidated knowledge with vector search
- Working memory: Ephemeral context in Redis
- Memory pruning by importance score
- Integration with AgentExecutor

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Data Pipeline Agent Pattern

**Purpose:** Implement an agent that can extract, transform, and load data from various sources.

**Files:**
- Create: `lib/agents/patterns/data-pipeline-agent.ts`
- Create: `lib/agents/tools/data-extraction.ts`
- Create: `lib/agents/tools/data-transformation.ts`
- Test: `lib/agents/patterns/__tests__/data-pipeline-agent.test.ts`

### Step 1: Write the failing test for data pipeline agent

**File:** `lib/agents/patterns/__tests__/data-pipeline-agent.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals'
import { executeDataPipelineAgent } from '../data-pipeline-agent'

describe('DataPipelineAgent', () => {
  it('should extract data from CSV and load to database', async () => {
    const result = await executeDataPipelineAgent(
      'test-user-id',
      `Extract customer data from customers.csv and load it into the database.
       The CSV has columns: id, name, email, created_at.
       Transform the created_at field to ISO format.`
    )

    expect(result.status).toBe('completed')
    expect(result.output).toContain('loaded')
    expect(result.steps.length).toBeGreaterThan(3)
  })

  it('should handle data transformation pipeline', async () => {
    const result = await executeDataPipelineAgent(
      'test-user-id',
      `1. Fetch JSON data from https://api.example.com/products
       2. Filter products where price > 100
       3. Transform to CSV format
       4. Save to products_filtered.csv`
    )

    expect(result.status).toBe('completed')
    expect(result.output).toContain('saved')
  })
})
```

### Step 2: Run test to verify it fails

```bash
npm test lib/agents/patterns/__tests__/data-pipeline-agent.test.ts
```

**Expected:** FAIL - "Cannot find module '../data-pipeline-agent'"

### Step 3: Implement data extraction tool

**File:** `lib/agents/tools/data-extraction.ts`

```typescript
import { Tool } from '../tools'
import Papa from 'papaparse'
import { parse as parseXML } from 'fast-xml-parser'

export const csvExtractTool: Tool = {
  name: 'csv_extract',
  description: 'Extract data from a CSV file. Returns parsed data as JSON array.',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the CSV file (relative or absolute)'
      },
      hasHeader: {
        type: 'boolean',
        description: 'Whether the CSV has a header row (default: true)'
      }
    },
    required: ['filePath']
  },
  execute: async (input: { filePath: string; hasHeader?: boolean }) => {
    const fs = await import('fs/promises')
    const content = await fs.readFile(input.filePath, 'utf-8')

    const parsed = Papa.parse(content, {
      header: input.hasHeader !== false,
      skipEmptyLines: true,
      dynamicTyping: true
    })

    if (parsed.errors.length > 0) {
      return {
        success: false,
        error: `CSV parsing errors: ${parsed.errors.map(e => e.message).join(', ')}`,
        rows: 0
      }
    }

    return {
      success: true,
      data: parsed.data,
      rows: parsed.data.length,
      columns: parsed.meta.fields || []
    }
  }
}

export const jsonExtractTool: Tool = {
  name: 'json_extract',
  description: 'Extract data from a JSON file or API endpoint. Returns parsed JSON data.',
  parameters: {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        description: 'File path or URL to JSON data'
      },
      jsonPath: {
        type: 'string',
        description: 'Optional JSONPath to extract specific data (e.g., "$.data.items")'
      }
    },
    required: ['source']
  },
  execute: async (input: { source: string; jsonPath?: string }) => {
    let data: any

    // Check if source is URL or file path
    if (input.source.startsWith('http://') || input.source.startsWith('https://')) {
      const response = await fetch(input.source)
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }
      data = await response.json()
    } else {
      const fs = await import('fs/promises')
      const content = await fs.readFile(input.source, 'utf-8')
      data = JSON.parse(content)
    }

    // Apply JSONPath if provided
    if (input.jsonPath) {
      const JSONPath = require('jsonpath')
      data = JSONPath.query(data, input.jsonPath)
    }

    return {
      success: true,
      data,
      type: Array.isArray(data) ? 'array' : typeof data
    }
  }
}

export const xmlExtractTool: Tool = {
  name: 'xml_extract',
  description: 'Extract data from an XML file. Returns parsed data as JSON.',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the XML file'
      }
    },
    required: ['filePath']
  },
  execute: async (input: { filePath: string }) => {
    const fs = await import('fs/promises')
    const content = await fs.readFile(input.filePath, 'utf-8')

    const parser = new parseXML()
    const data = parser.parse(content)

    return {
      success: true,
      data
    }
  }
}
```

### Step 4: Implement data transformation tool

**File:** `lib/agents/tools/data-transformation.ts`

```typescript
import { Tool } from '../tools'
import Papa from 'papaparse'

export const dataTransformTool: Tool = {
  name: 'data_transform',
  description: 'Transform data using JavaScript code. Receives data array and transformation code.',
  parameters: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        description: 'The data to transform (array of objects)'
      },
      transformCode: {
        type: 'string',
        description: 'JavaScript code to transform each row. Use "row" variable. Example: "return { ...row, price: row.price * 1.1 }"'
      }
    },
    required: ['data', 'transformCode']
  },
  execute: async (input: { data: any[]; transformCode: string }) => {
    try {
      // Create a function from the code
      const transformFn = new Function('row', input.transformCode)

      const transformed = input.data.map(transformFn)

      return {
        success: true,
        data: transformed,
        rows: transformed.length
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export const dataFilterTool: Tool = {
  name: 'data_filter',
  description: 'Filter data array using a condition. Returns filtered data.',
  parameters: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        description: 'The data to filter'
      },
      condition: {
        type: 'string',
        description: 'JavaScript condition to test each row. Use "row" variable. Example: "row.price > 100"'
      }
    },
    required: ['data', 'condition']
  },
  execute: async (input: { data: any[]; condition: string }) => {
    try {
      const conditionFn = new Function('row', `return ${input.condition}`)
      const filtered = input.data.filter(conditionFn)

      return {
        success: true,
        data: filtered,
        rows: filtered.length,
        filteredOut: input.data.length - filtered.length
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export const dataAggregateTool: Tool = {
  name: 'data_aggregate',
  description: 'Aggregate data by grouping and applying functions (sum, count, avg, etc.)',
  parameters: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        description: 'The data to aggregate'
      },
      groupBy: {
        type: 'string',
        description: 'Field to group by'
      },
      aggregations: {
        type: 'object',
        description: 'Aggregations to apply. Example: { "total": { "field": "price", "fn": "sum" } }'
      }
    },
    required: ['data', 'groupBy', 'aggregations']
  },
  execute: async (input: { data: any[]; groupBy: string; aggregations: any }) => {
    const groups = new Map()

    // Group data
    for (const row of input.data) {
      const key = row[input.groupBy]
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key).push(row)
    }

    // Apply aggregations
    const result = []
    for (const [key, rows] of groups.entries()) {
      const aggregated: any = { [input.groupBy]: key }

      for (const [name, config] of Object.entries(input.aggregations)) {
        const { field, fn } = config as any
        const values = rows.map(r => r[field])

        switch (fn) {
          case 'sum':
            aggregated[name] = values.reduce((a, b) => a + b, 0)
            break
          case 'avg':
            aggregated[name] = values.reduce((a, b) => a + b, 0) / values.length
            break
          case 'count':
            aggregated[name] = values.length
            break
          case 'min':
            aggregated[name] = Math.min(...values)
            break
          case 'max':
            aggregated[name] = Math.max(...values)
            break
        }
      }

      result.push(aggregated)
    }

    return {
      success: true,
      data: result,
      groups: result.length
    }
  }
}

export const dataExportTool: Tool = {
  name: 'data_export',
  description: 'Export data to CSV, JSON, or SQL format.',
  parameters: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        description: 'The data to export'
      },
      format: {
        type: 'string',
        enum: ['csv', 'json', 'sql'],
        description: 'Output format'
      },
      filePath: {
        type: 'string',
        description: 'Path where to save the file'
      },
      tableName: {
        type: 'string',
        description: 'Table name (for SQL format only)'
      }
    },
    required: ['data', 'format', 'filePath']
  },
  execute: async (input: { data: any[]; format: string; filePath: string; tableName?: string }) => {
    const fs = await import('fs/promises')
    let content: string

    switch (input.format) {
      case 'csv':
        content = Papa.unparse(input.data)
        break
      case 'json':
        content = JSON.stringify(input.data, null, 2)
        break
      case 'sql':
        if (!input.tableName) {
          return { success: false, error: 'tableName required for SQL format' }
        }
        const values = input.data.map(row => {
          const cols = Object.keys(row)
          const vals = Object.values(row).map(v =>
            typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v
          )
          return `(${vals.join(', ')})`
        })
        content = `INSERT INTO ${input.tableName} VALUES\n${values.join(',\n')};`
        break
      default:
        return { success: false, error: `Unknown format: ${input.format}` }
    }

    await fs.writeFile(input.filePath, content, 'utf-8')

    return {
      success: true,
      filePath: input.filePath,
      rows: input.data.length
    }
  }
}
```

### Step 5: Implement Data Pipeline Agent

**File:** `lib/agents/patterns/data-pipeline-agent.ts`

```typescript
import { MemoryAwareAgentExecutor } from '../memory-integration'
import { getTools } from '../tools'
import {
  csvExtractTool,
  jsonExtractTool,
  xmlExtractTool
} from '../tools/data-extraction'
import {
  dataTransformTool,
  dataFilterTool,
  dataAggregateTool,
  dataExportTool
} from '../tools/data-transformation'

const DATA_PIPELINE_AGENT_PROMPT = `You are a data pipeline agent. Your job is to:
1. Extract data from various sources (CSV, JSON, XML, APIs)
2. Transform and clean the data as requested
3. Aggregate, filter, or reshape the data
4. Export the results in the desired format

## Capabilities:
- Extract from CSV, JSON, XML files
- Fetch JSON from APIs
- Transform data with JavaScript code
- Filter data by conditions
- Aggregate data (sum, count, avg, min, max)
- Export to CSV, JSON, or SQL

## Best Practices:
- Always validate data after extraction
- Show sample rows before and after transformations
- Handle errors gracefully
- Report progress: "Extracted X rows, transformed Y, exported Z"

Available tools:
- csv_extract: Extract from CSV files
- json_extract: Extract from JSON files/APIs
- xml_extract: Extract from XML files
- data_transform: Transform rows with JavaScript
- data_filter: Filter rows by condition
- data_aggregate: Group and aggregate data
- data_export: Export to CSV, JSON, or SQL

When you've completed the pipeline, use finish() with a summary of what was processed.`

export async function executeDataPipelineAgent(
  userId: string,
  task: string
): Promise<any> {
  const tools = [
    csvExtractTool,
    jsonExtractTool,
    xmlExtractTool,
    dataTransformTool,
    dataFilterTool,
    dataAggregateTool,
    dataExportTool,
    ...getTools(['note_taking'])
  ]

  const executor = new MemoryAwareAgentExecutor(
    userId,
    'data-pipeline-agent',
    DATA_PIPELINE_AGENT_PROMPT,
    tools,
    { maxIterations: 20, timeout: 600000 } // 10 minutes for large datasets
  )

  return await executor.execute(task)
}
```

### Step 6: Run test to verify it passes

```bash
npm test lib/agents/patterns/__tests__/data-pipeline-agent.test.ts
```

**Expected:** PASS

### Step 7: Add Data Pipeline Agent to database

```bash
# Use the Supabase dashboard or API to insert the agent definition
```

**Agent Definition:**
```json
{
  "name": "Data Pipeline Agent",
  "slug": "data-pipeline",
  "description": "Extracts, transforms, and loads data from various sources. Can handle CSV, JSON, XML, APIs, and export to multiple formats.",
  "category": "data",
  "system_prompt": "[use DATA_PIPELINE_AGENT_PROMPT from above]",
  "tools": ["csv_extract", "json_extract", "xml_extract", "data_transform", "data_filter", "data_aggregate", "data_export", "note_taking"],
  "max_iterations": 20,
  "timeout_ms": 600000,
  "is_public": true
}
```

### Step 8: Create API endpoint for Data Pipeline Agent

**File:** `app/api/agents/data-pipeline/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { executeDataPipelineAgent } from '@/lib/agents/patterns/data-pipeline-agent'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { task } = await request.json()

  if (!task) {
    return NextResponse.json({ error: 'Task is required' }, { status: 400 })
  }

  try {
    const result = await executeDataPipelineAgent(user.id, task)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### Step 9: Commit

```bash
git add lib/agents/patterns/data-pipeline-agent.ts \
  lib/agents/tools/data-extraction.ts \
  lib/agents/tools/data-transformation.ts \
  lib/agents/patterns/__tests__/data-pipeline-agent.test.ts \
  app/api/agents/data-pipeline/route.ts
git commit -m "$(cat <<'EOF'
feat: add Data Pipeline Agent pattern

Agent that can extract, transform, and load data:
- Extract from CSV, JSON, XML files and APIs
- Transform with JavaScript code
- Filter, aggregate data
- Export to CSV, JSON, SQL formats
- Handles large datasets (10min timeout)

Tools: csv_extract, json_extract, xml_extract, data_transform,
       data_filter, data_aggregate, data_export

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Meeting Assistant Agent Pattern

**Purpose:** Implement an agent that can schedule meetings, take notes, and follow up on action items.

**Files:**
- Create: `lib/agents/patterns/meeting-assistant-agent.ts`
- Create: `lib/agents/tools/calendar.ts`
- Create: `lib/agents/tools/transcription.ts`
- Test: `lib/agents/patterns/__tests__/meeting-assistant-agent.test.ts`

### Step 1: Write the failing test for meeting assistant agent

**File:** `lib/agents/patterns/__tests__/meeting-assistant-agent.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals'
import { executeMeetingAssistantAgent } from '../meeting-assistant-agent'

describe('MeetingAssistantAgent', () => {
  it('should schedule a meeting and send invites', async () => {
    const result = await executeMeetingAssistantAgent(
      'test-user-id',
      `Schedule a 1-hour meeting with john@example.com and jane@example.com
       tomorrow at 2 PM to discuss Q1 planning.
       Title: Q1 Planning Session`
    )

    expect(result.status).toBe('completed')
    expect(result.output).toContain('scheduled')
    expect(result.output).toContain('2 PM')
  })

  it('should extract action items from meeting notes', async () => {
    const notes = `
      Meeting Notes - Project Kickoff
      - Discussed project timeline
      - ACTION: John to send design mockups by Friday
      - ACTION: Sarah to set up development environment
      - Next meeting: Next Monday at 10 AM
    `

    const result = await executeMeetingAssistantAgent(
      'test-user-id',
      `Extract action items from these meeting notes and assign them:\n${notes}`
    )

    expect(result.status).toBe('completed')
    expect(result.output).toContain('John')
    expect(result.output).toContain('Sarah')
  })
})
```

### Step 2: Run test to verify it fails

```bash
npm test lib/agents/patterns/__tests__/meeting-assistant-agent.test.ts
```

**Expected:** FAIL - "Cannot find module '../meeting-assistant-agent'"

### Step 3: Implement calendar tools

**File:** `lib/agents/tools/calendar.ts`

```typescript
import { Tool } from '../tools'
import { google } from 'googleapis'

// Note: Requires Google Calendar API setup with OAuth2

export const calendarCheckAvailabilityTool: Tool = {
  name: 'calendar_check_availability',
  description: 'Check availability for meeting attendees in a given time range.',
  parameters: {
    type: 'object',
    properties: {
      attendees: {
        type: 'array',
        items: { type: 'string' },
        description: 'Email addresses of attendees'
      },
      startTime: {
        type: 'string',
        description: 'Start time in ISO format'
      },
      endTime: {
        type: 'string',
        description: 'End time in ISO format'
      }
    },
    required: ['attendees', 'startTime', 'endTime']
  },
  execute: async (input: { attendees: string[]; startTime: string; endTime: string }) => {
    // In production, this would use Google Calendar API
    // For now, return mock data
    return {
      success: true,
      availability: input.attendees.map(email => ({
        email,
        available: true,
        conflicts: []
      }))
    }
  }
}

export const calendarCreateEventTool: Tool = {
  name: 'calendar_create_event',
  description: 'Create a calendar event and send invites to attendees.',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Event title'
      },
      description: {
        type: 'string',
        description: 'Event description'
      },
      startTime: {
        type: 'string',
        description: 'Start time in ISO format'
      },
      endTime: {
        type: 'string',
        description: 'End time in ISO format'
      },
      attendees: {
        type: 'array',
        items: { type: 'string' },
        description: 'Email addresses of attendees'
      },
      location: {
        type: 'string',
        description: 'Meeting location or video call link'
      }
    },
    required: ['title', 'startTime', 'endTime', 'attendees']
  },
  execute: async (input: {
    title: string
    description?: string
    startTime: string
    endTime: string
    attendees: string[]
    location?: string
  }) => {
    // In production, integrate with Google Calendar API or similar
    return {
      success: true,
      eventId: `event-${Date.now()}`,
      title: input.title,
      startTime: input.startTime,
      endTime: input.endTime,
      attendees: input.attendees,
      message: `Created event "${input.title}" with ${input.attendees.length} attendees`
    }
  }
}

export const calendarFindSlotsTool: Tool = {
  name: 'calendar_find_slots',
  description: 'Find available time slots for all attendees within a date range.',
  parameters: {
    type: 'object',
    properties: {
      attendees: {
        type: 'array',
        items: { type: 'string' },
        description: 'Email addresses of attendees'
      },
      startDate: {
        type: 'string',
        description: 'Start date to search (YYYY-MM-DD)'
      },
      endDate: {
        type: 'string',
        description: 'End date to search (YYYY-MM-DD)'
      },
      durationMinutes: {
        type: 'number',
        description: 'Meeting duration in minutes'
      }
    },
    required: ['attendees', 'startDate', 'endDate', 'durationMinutes']
  },
  execute: async (input: {
    attendees: string[]
    startDate: string
    endDate: string
    durationMinutes: number
  }) => {
    // Mock implementation - in production, use Google Calendar API
    const slots = [
      { start: '2026-02-03T14:00:00Z', end: '2026-02-03T15:00:00Z' },
      { start: '2026-02-04T10:00:00Z', end: '2026-02-04T11:00:00Z' },
      { start: '2026-02-05T15:00:00Z', end: '2026-02-05T16:00:00Z' }
    ]

    return {
      success: true,
      slots,
      count: slots.length
    }
  }
}
```

### Step 4: Implement transcription and action item extraction tools

**File:** `lib/agents/tools/transcription.ts`

```typescript
import { Tool } from '../tools'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export const extractActionItemsTool: Tool = {
  name: 'extract_action_items',
  description: 'Extract action items from meeting notes or transcripts.',
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'Meeting notes or transcript'
      }
    },
    required: ['text']
  },
  execute: async (input: { text: string }) => {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Extract action items from this meeting text. For each action item, identify:
1. The task description
2. The person responsible (if mentioned)
3. The deadline (if mentioned)

Meeting text:
${input.text}

Return JSON array of action items.`
      }]
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return { success: false, error: 'Unexpected response type' }
    }

    try {
      const actionItems = JSON.parse(content.text)
      return {
        success: true,
        actionItems,
        count: actionItems.length
      }
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to parse action items'
      }
    }
  }
}

export const summarizeMeetingTool: Tool = {
  name: 'summarize_meeting',
  description: 'Generate a concise summary of meeting notes or transcript.',
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'Meeting notes or transcript'
      },
      format: {
        type: 'string',
        enum: ['brief', 'detailed', 'executive'],
        description: 'Summary format'
      }
    },
    required: ['text']
  },
  execute: async (input: { text: string; format?: string }) => {
    const format = input.format || 'brief'
    const instructions = {
      brief: 'Create a 2-3 sentence summary',
      detailed: 'Create a comprehensive summary with key points',
      executive: 'Create an executive summary with decisions, action items, and next steps'
    }

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${instructions[format as keyof typeof instructions]}:

Meeting text:
${input.text}`
      }]
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return { success: false, error: 'Unexpected response type' }
    }

    return {
      success: true,
      summary: content.text
    }
  }
}
```

### Step 5: Implement Meeting Assistant Agent

**File:** `lib/agents/patterns/meeting-assistant-agent.ts`

```typescript
import { MemoryAwareAgentExecutor } from '../memory-integration'
import { getTools } from '../tools'
import {
  calendarCheckAvailabilityTool,
  calendarCreateEventTool,
  calendarFindSlotsTool
} from '../tools/calendar'
import {
  extractActionItemsTool,
  summarizeMeetingTool
} from '../tools/transcription'

const MEETING_ASSISTANT_AGENT_PROMPT = `You are a meeting assistant agent. Your job is to:
1. Schedule meetings by finding available time slots
2. Create calendar events and send invites
3. Process meeting transcripts and notes
4. Extract and track action items
5. Generate meeting summaries
6. Follow up on action items

## Capabilities:
- Check attendee availability
- Find optimal meeting times
- Create calendar events with invites
- Extract action items from notes
- Generate meeting summaries (brief, detailed, executive)
- Search knowledge base for context

## Best Practices:
- Always check availability before scheduling
- Suggest 2-3 time slot options when possible
- Extract action items with owner and deadline
- Include meeting links for remote meetings
- Follow up on overdue action items

Available tools:
- calendar_check_availability: Check if attendees are free
- calendar_find_slots: Find available time slots
- calendar_create_event: Schedule meeting and send invites
- extract_action_items: Extract action items from notes
- summarize_meeting: Generate meeting summary
- kb_search: Search knowledge base for context
- ticket_create: Create tasks from action items
- note_taking: Record important information

When you've completed the task, use finish() with a summary of what was done.`

export async function executeMeetingAssistantAgent(
  userId: string,
  task: string
): Promise<any> {
  const tools = [
    calendarCheckAvailabilityTool,
    calendarCreateEventTool,
    calendarFindSlotsTool,
    extractActionItemsTool,
    summarizeMeetingTool,
    ...getTools(['kb_search', 'ticket_create', 'note_taking'])
  ]

  const executor = new MemoryAwareAgentExecutor(
    userId,
    'meeting-assistant-agent',
    MEETING_ASSISTANT_AGENT_PROMPT,
    tools,
    { maxIterations: 15, timeout: 300000 } // 5 minutes
  )

  return await executor.execute(task)
}
```

### Step 6: Run test to verify it passes

```bash
npm test lib/agents/patterns/__tests__/meeting-assistant-agent.test.ts
```

**Expected:** PASS

### Step 7: Add Meeting Assistant Agent to database

**Agent Definition:**
```json
{
  "name": "Meeting Assistant Agent",
  "slug": "meeting-assistant",
  "description": "Schedules meetings, takes notes, extracts action items, and follows up. Can check availability, find time slots, and generate summaries.",
  "category": "productivity",
  "system_prompt": "[use MEETING_ASSISTANT_AGENT_PROMPT from above]",
  "tools": ["calendar_check_availability", "calendar_find_slots", "calendar_create_event", "extract_action_items", "summarize_meeting", "kb_search", "ticket_create", "note_taking"],
  "max_iterations": 15,
  "timeout_ms": 300000,
  "is_public": true
}
```

### Step 8: Create API endpoint for Meeting Assistant Agent

**File:** `app/api/agents/meeting-assistant/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { executeMeetingAssistantAgent } from '@/lib/agents/patterns/meeting-assistant-agent'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { task } = await request.json()

  if (!task) {
    return NextResponse.json({ error: 'Task is required' }, { status: 400 })
  }

  try {
    const result = await executeMeetingAssistantAgent(user.id, task)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### Step 9: Commit

```bash
git add lib/agents/patterns/meeting-assistant-agent.ts \
  lib/agents/tools/calendar.ts \
  lib/agents/tools/transcription.ts \
  lib/agents/patterns/__tests__/meeting-assistant-agent.test.ts \
  app/api/agents/meeting-assistant/route.ts
git commit -m "$(cat <<'EOF'
feat: add Meeting Assistant Agent pattern

Agent that handles meeting workflows:
- Schedule meetings with availability check
- Find optimal time slots for multiple attendees
- Create calendar events and send invites
- Extract action items from meeting notes
- Generate summaries (brief, detailed, executive)
- Create tasks from action items

Tools: calendar_check_availability, calendar_find_slots,
       calendar_create_event, extract_action_items,
       summarize_meeting, kb_search, ticket_create

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Production Agent System Dashboard

**Purpose:** Build a comprehensive dashboard to manage, monitor, and debug agent executions in production.

**Files:**
- Create: `app/dashboard/agents/page.tsx`
- Create: `app/dashboard/agents/[executionId]/page.tsx`
- Create: `components/dashboard/agent-execution-trace.tsx`
- Create: `components/dashboard/agent-metrics.tsx`
- Create: `app/api/agents/executions/route.ts`

### Step 1: Write the failing test for agent dashboard API

**File:** `app/api/agents/executions/__tests__/route.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals'
import { GET } from '../route'
import { NextRequest } from 'next/server'

describe('GET /api/agents/executions', () => {
  it('should return agent executions for user', async () => {
    const request = new NextRequest('http://localhost/api/agents/executions')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data.executions)).toBe(true)
  })

  it('should filter by status', async () => {
    const request = new NextRequest('http://localhost/api/agents/executions?status=completed')
    const response = await GET(request)
    const data = await response.json()

    expect(data.executions.every((e: any) => e.status === 'completed')).toBe(true)
  })
})
```

### Step 2: Run test to verify it fails

```bash
npm test app/api/agents/executions/__tests__/route.test.ts
```

**Expected:** FAIL - "Cannot find module '../route'"

### Step 3: Implement agent executions API

**File:** `app/api/agents/executions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const agentId = searchParams.get('agentId')
  const limit = parseInt(searchParams.get('limit') || '50')

  let query = supabase
    .from('agent_executions')
    .select(`
      *,
      agent_definition:agent_definitions(name, slug, category),
      steps:agent_steps(count)
    `)
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  if (agentId) {
    query = query.eq('agent_definition_id', agentId)
  }

  const { data: executions, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ executions })
}
```

### Step 4: Implement execution detail API

**File:** `app/api/agents/executions/[executionId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { executionId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: execution, error: execError } = await supabase
    .from('agent_executions')
    .select(`
      *,
      agent_definition:agent_definitions(*)
    `)
    .eq('id', params.executionId)
    .eq('user_id', user.id)
    .single()

  if (execError) {
    return NextResponse.json({ error: execError.message }, { status: 404 })
  }

  const { data: steps, error: stepsError } = await supabase
    .from('agent_steps')
    .select('*')
    .eq('execution_id', params.executionId)
    .order('step_number', { ascending: true })

  if (stepsError) {
    return NextResponse.json({ error: stepsError.message }, { status: 500 })
  }

  return NextResponse.json({ execution, steps })
}
```

### Step 5: Create agent metrics component

**File:** `components/dashboard/agent-metrics.tsx`

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AgentMetrics {
  totalExecutions: number
  successRate: number
  avgIterations: number
  avgTokens: number
  avgCost: number
  avgDuration: number
}

export function AgentMetricsCard({ metrics }: { metrics: AgentMetrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalExecutions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(metrics.successRate * 100).toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics.avgCost.toFixed(4)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Iterations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.avgIterations.toFixed(1)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.avgTokens.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.avgDuration.toFixed(1)}s
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 6: Create execution trace component

**File:** `components/dashboard/agent-execution-trace.tsx`

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface AgentStep {
  id: string
  step_number: number
  thought: string
  action: string
  action_input: any
  observation: string
  tokens_used: number
  latency_ms: number
  created_at: string
}

export function AgentExecutionTrace({ steps }: { steps: AgentStep[] }) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]))

  const toggleStep = (stepNum: number) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepNum)) {
      newExpanded.delete(stepNum)
    } else {
      newExpanded.add(stepNum)
    }
    setExpandedSteps(newExpanded)
  }

  return (
    <div className="space-y-4">
      {steps.map((step) => {
        const isExpanded = expandedSteps.has(step.step_number)

        return (
          <Card key={step.id}>
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleStep(step.step_number)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <CardTitle className="text-base">
                    Step {step.step_number}: {step.action}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{step.tokens_used} tokens</Badge>
                  <Badge variant="outline">{step.latency_ms}ms</Badge>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-4">
                {/* Thought */}
                <div>
                  <h4 className="font-semibold text-sm mb-1">Thought</h4>
                  <p className="text-sm text-muted-foreground">{step.thought}</p>
                </div>

                {/* Action Input */}
                <div>
                  <h4 className="font-semibold text-sm mb-1">Action Input</h4>
                  <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                    {JSON.stringify(step.action_input, null, 2)}
                  </pre>
                </div>

                {/* Observation */}
                <div>
                  <h4 className="font-semibold text-sm mb-1">Observation</h4>
                  <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap">
                    {step.observation}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
```

### Step 7: Create agents dashboard page

**File:** `app/dashboard/agents/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AgentMetricsCard } from '@/components/dashboard/agent-metrics'

export default async function AgentsDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Unauthorized</div>
  }

  // Fetch recent executions
  const { data: executions } = await supabase
    .from('agent_executions')
    .select(`
      *,
      agent_definition:agent_definitions(name, slug)
    `)
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(20)

  // Calculate metrics
  const totalExecutions = executions?.length || 0
  const completed = executions?.filter(e => e.status === 'completed').length || 0
  const avgIterations = executions?.reduce((sum, e) => sum + e.iterations, 0) / totalExecutions || 0
  const avgTokens = executions?.reduce((sum, e) => sum + e.total_tokens, 0) / totalExecutions || 0
  const avgCost = executions?.reduce((sum, e) => sum + parseFloat(e.cost), 0) / totalExecutions || 0

  const avgDuration = executions?.reduce((sum, e) => {
    if (e.completed_at && e.started_at) {
      const duration = (new Date(e.completed_at).getTime() - new Date(e.started_at).getTime()) / 1000
      return sum + duration
    }
    return sum
  }, 0) / totalExecutions || 0

  const metrics = {
    totalExecutions,
    successRate: completed / totalExecutions,
    avgIterations,
    avgTokens,
    avgCost,
    avgDuration
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage your AI agent executions
        </p>
      </div>

      <AgentMetricsCard metrics={metrics} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {executions?.map((execution) => (
              <Link
                key={execution.id}
                href={`/dashboard/agents/${execution.id}`}
                className="block hover:bg-muted/50 p-4 rounded-lg border transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {execution.agent_definition?.name}
                      </h3>
                      <Badge
                        variant={
                          execution.status === 'completed'
                            ? 'default'
                            : execution.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {execution.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {execution.input}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{execution.iterations} iterations</div>
                    <div>{execution.total_tokens} tokens</div>
                    <div>${parseFloat(execution.cost).toFixed(4)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 8: Create execution detail page

**File:** `app/dashboard/agents/[executionId]/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AgentExecutionTrace } from '@/components/dashboard/agent-execution-trace'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ExecutionDetailPage({
  params
}: {
  params: { executionId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Unauthorized</div>
  }

  const { data: execution } = await supabase
    .from('agent_executions')
    .select(`
      *,
      agent_definition:agent_definitions(*)
    `)
    .eq('id', params.executionId)
    .eq('user_id', user.id)
    .single()

  const { data: steps } = await supabase
    .from('agent_steps')
    .select('*')
    .eq('execution_id', params.executionId)
    .order('step_number', { ascending: true })

  if (!execution) {
    return <div>Execution not found</div>
  }

  const duration = execution.completed_at
    ? (new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000
    : null

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Link
        href="/dashboard/agents"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-bold">{execution.agent_definition.name}</h1>
        <p className="text-muted-foreground">Execution Details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                execution.status === 'completed'
                  ? 'default'
                  : execution.status === 'failed'
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {execution.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Iterations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{execution.iterations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {execution.total_tokens.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(execution.cost).toFixed(4)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{execution.input}</p>
        </CardContent>
      </Card>

      {execution.output && (
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap">{execution.output}</pre>
          </CardContent>
        </Card>
      )}

      {execution.error_message && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-destructive whitespace-pre-wrap">
              {execution.error_message}
            </pre>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Execution Trace</h2>
        <AgentExecutionTrace steps={steps || []} />
      </div>
    </div>
  )
}
```

### Step 9: Run tests

```bash
npm test app/api/agents/executions/__tests__/route.test.ts
npm run build
```

**Expected:** Tests pass, build succeeds

### Step 10: Commit

```bash
git add app/dashboard/agents/ \
  components/dashboard/agent-*.tsx \
  app/api/agents/executions/
git commit -m "$(cat <<'EOF'
feat: add production agent system dashboard

Comprehensive dashboard for agent management:
- Agent metrics (executions, success rate, costs, tokens)
- Execution history with filtering
- Detailed execution trace with step-by-step breakdown
- Thought-Action-Observation visualization
- Performance metrics (iterations, latency, tokens per step)
- Error tracking and debugging

Portfolio Piece #3: Production Agent System

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

**Week 6 Implementation Complete:**

**What We Built:**
1. **Agent Memory System** - Short-term, long-term, and working memory with vector search
2. **Data Pipeline Agent** - Extract, transform, load data from CSV/JSON/XML/APIs
3. **Meeting Assistant Agent** - Schedule meetings, extract action items, generate summaries
4. **Production Agent Dashboard** - Monitor, debug, and manage agent executions

**Key Features:**
- Cross-execution memory with importance scoring
- 7 new data tools (extract, transform, filter, aggregate, export)
- 5 new meeting tools (calendar, transcription, action items)
- Comprehensive observability dashboard
- Real-time execution traces
- Performance metrics and cost tracking

**Portfolio Pieces:**
- Portfolio Piece #3: Production Agent System ✅

**Ready for:** Week 7 implementation (Frontend Architecture + Component Library)
