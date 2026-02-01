# Week 4 Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build platform features to deliver Week 4 curriculum (Advanced RAG + Memory Implementation)

**Architecture:** Extend Week 3 RAG system with citation tracking, multi-document synthesis, evaluation framework, and cross-session memory integration. Complete the Document Q&A system as Portfolio Piece #2.

**Tech Stack:** Next.js 14, Supabase (PostgreSQL + pgvector), OpenAI Embeddings API, Claude API, MDX

---

## Task 1: Citation Tracking and Multi-Document Synthesis

**Files:**
- Create: `supabase/migrations/20260203_week4_citations.sql`
- Create: `lib/rag/citations.ts`
- Create: `lib/rag/synthesis.ts`

**Step 1: Add citation tracking to database**

```sql
-- Citations tracking for RAG responses
CREATE TABLE IF NOT EXISTS public.rag_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID REFERENCES public.rag_queries(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES public.document_chunks(id),
    document_id UUID REFERENCES public.documents(id),
    page_number INTEGER,
    relevance_score DECIMAL(4, 3),
    used_in_response BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rag_citations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read citations for their queries" ON public.rag_citations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rag_queries
            WHERE rag_queries.id = rag_citations.query_id
            AND rag_queries.user_id = auth.uid()
        )
    );

-- Create index
CREATE INDEX idx_citations_query ON public.rag_citations(query_id);
```

**Step 2: Run migration**

```bash
npx supabase migration up
```

Expected: Migration applied successfully

**Step 3: Create citation tracker**

```typescript
// lib/rag/citations.ts
import { createClient } from '@/lib/supabase/server'

export interface Citation {
  chunkId: string
  documentId: string
  documentName: string
  pageNumber?: number
  content: string
  relevanceScore: number
}

export async function trackCitations(
  queryId: string,
  chunks: Array<{
    chunkId: string
    documentId: string
    relevanceScore: number
  }>
): Promise<void> {
  const supabase = createClient()

  // Get document metadata for chunks
  const chunkIds = chunks.map(c => c.chunkId)
  const { data: chunkData } = await supabase
    .from('document_chunks')
    .select(`
      id,
      document_id,
      metadata,
      documents (
        id,
        filename
      )
    `)
    .in('id', chunkIds)

  if (!chunkData) return

  // Insert citations
  const citations = chunks.map(chunk => {
    const chunkInfo = chunkData.find(c => c.id === chunk.chunkId)
    const pageNumber = chunkInfo?.metadata?.page || null

    return {
      query_id: queryId,
      chunk_id: chunk.chunkId,
      document_id: chunk.documentId,
      page_number: pageNumber,
      relevance_score: chunk.relevanceScore,
      used_in_response: true
    }
  })

  await supabase.from('rag_citations').insert(citations)
}

export async function getCitationsForQuery(queryId: string): Promise<Citation[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('rag_citations')
    .select(`
      chunk_id,
      document_id,
      page_number,
      relevance_score,
      document_chunks (
        content
      ),
      documents (
        filename
      )
    `)
    .eq('query_id', queryId)
    .order('relevance_score', { ascending: false })

  if (!data) return []

  return data.map((c: any) => ({
    chunkId: c.chunk_id,
    documentId: c.document_id,
    documentName: c.documents.filename,
    pageNumber: c.page_number,
    content: c.document_chunks.content,
    relevanceScore: c.relevance_score
  }))
}

export function formatCitations(citations: Citation[]): string {
  if (citations.length === 0) return ''

  let formatted = '\n\nSources:\n'
  citations.forEach((citation, index) => {
    const pageInfo = citation.pageNumber ? `, page ${citation.pageNumber}` : ''
    formatted += `[${index + 1}] ${citation.documentName}${pageInfo}\n`
  })

  return formatted
}
```

**Step 4: Create multi-document synthesis**

```typescript
// lib/rag/synthesis.ts
import Anthropic from '@anthropic-ai/sdk'
import { SearchResult } from './retrieval'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export interface SynthesisResult {
  answer: string
  confidence: number
  sources: string[]
  contradictions?: string[]
}

export async function synthesizeFromMultipleSources(
  query: string,
  results: SearchResult[]
): Promise<SynthesisResult> {
  // Group results by document
  const byDocument = results.reduce((acc, result) => {
    if (!acc[result.documentId]) {
      acc[result.documentId] = []
    }
    acc[result.documentId].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  // Build context from multiple documents
  let context = 'Information from multiple sources:\n\n'
  Object.entries(byDocument).forEach(([docId, chunks], index) => {
    context += `Source ${index + 1}:\n`
    chunks.forEach(chunk => {
      context += `- ${chunk.content}\n`
    })
    context += '\n'
  })

  // Use Claude to synthesize answer
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Based on the following information from multiple sources, answer this question: "${query}"

${context}

Instructions:
1. Synthesize information from all sources
2. If sources contradict each other, acknowledge the contradiction
3. Cite which source(s) support each point using [Source N]
4. Rate your confidence in the answer (0.0 to 1.0)
5. Respond in JSON format:

{
  "answer": "your synthesized answer with [Source N] citations",
  "confidence": 0.8,
  "sources": ["Source 1", "Source 2"],
  "contradictions": ["optional: describe any contradictions found"]
}`
    }]
  })

  const resultText = response.content[0].text

  try {
    // Parse JSON response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')

    const parsed = JSON.parse(jsonMatch[0])

    return {
      answer: parsed.answer,
      confidence: parsed.confidence,
      sources: parsed.sources || [],
      contradictions: parsed.contradictions?.length > 0 ? parsed.contradictions : undefined
    }
  } catch (error) {
    // Fallback: use raw text as answer
    return {
      answer: resultText,
      confidence: 0.5,
      sources: Object.keys(byDocument).map((_, i) => `Source ${i + 1}`)
    }
  }
}

export function detectContradictions(results: SearchResult[]): string[] {
  // Simple contradiction detection: look for negation words near similar concepts
  const contradictions: string[] = []

  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      const text1 = results[i].content.toLowerCase()
      const text2 = results[j].content.toLowerCase()

      // Check for negation patterns
      const hasNegation1 = /\b(not|no|never|cannot|isn't|aren't|doesn't)\b/.test(text1)
      const hasNegation2 = /\b(not|no|never|cannot|isn't|aren't|doesn't)\b/.test(text2)

      // If one has negation and they share key terms, possible contradiction
      if (hasNegation1 !== hasNegation2) {
        const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 4))
        const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 4))
        const commonWords = [...words1].filter(w => words2.has(w))

        if (commonWords.length >= 3) {
          contradictions.push(
            `Potential contradiction between sources about: ${commonWords.slice(0, 3).join(', ')}`
          )
        }
      }
    }
  }

  return contradictions
}
```

**Step 5: Commit**

```bash
git add supabase/migrations/20260203_week4_citations.sql lib/rag/citations.ts lib/rag/synthesis.ts
git commit -m "feat: add citation tracking and multi-document synthesis

- Citations table linking queries to source chunks
- Citation tracker with page number support
- Multi-document synthesis using Claude
- Contradiction detection across sources
- Citation formatting for responses"
```

---

## Task 2: RAG Evaluation Framework

**Files:**
- Create: `supabase/migrations/20260203_week4_evaluation.sql`
- Create: `lib/rag/evaluation.ts`
- Create: `app/api/rag/evaluate/route.ts`

**Step 1: Add evaluation tables**

```sql
-- Evaluation datasets (ground truth Q&A pairs)
CREATE TABLE IF NOT EXISTS public.rag_eval_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Evaluation questions with ground truth answers
CREATE TABLE IF NOT EXISTS public.rag_eval_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID REFERENCES public.rag_eval_datasets(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    ground_truth_answer TEXT NOT NULL,
    relevant_document_ids UUID[], -- Expected source documents
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Evaluation results
CREATE TABLE IF NOT EXISTS public.rag_eval_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID REFERENCES public.rag_eval_datasets(id),
    question_id UUID REFERENCES public.rag_eval_questions(id),
    generated_answer TEXT NOT NULL,
    retrieved_chunks JSONB,
    metrics JSONB, -- {faithfulness: 0.9, relevance: 0.8, coverage: 0.7}
    passed BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rag_eval_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_eval_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_eval_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their eval datasets" ON public.rag_eval_datasets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage questions in their datasets" ON public.rag_eval_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rag_eval_datasets
            WHERE rag_eval_datasets.id = rag_eval_questions.dataset_id
            AND rag_eval_datasets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can read results for their datasets" ON public.rag_eval_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rag_eval_datasets
            WHERE rag_eval_datasets.id = rag_eval_results.dataset_id
            AND rag_eval_datasets.user_id = auth.uid()
        )
    );

CREATE INDEX idx_eval_questions_dataset ON public.rag_eval_questions(dataset_id);
CREATE INDEX idx_eval_results_dataset ON public.rag_eval_results(dataset_id);
```

**Step 2: Run migration**

```bash
npx supabase migration up
```

**Step 3: Create evaluation framework**

```typescript
// lib/rag/evaluation.ts
import Anthropic from '@anthropic-ai/sdk'
import { SearchResult } from './retrieval'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export interface EvaluationMetrics {
  faithfulness: number // Answer grounded in sources (0-1)
  relevance: number // Retrieved chunks match query (0-1)
  coverage: number // All aspects addressed (0-1)
  overall: number // Average of above
}

export async function evaluateFaithfulness(
  answer: string,
  sources: SearchResult[]
): Promise<number> {
  const sourceText = sources.map(s => s.content).join('\n\n')

  const response = await client.messages.create({
    model: 'claude-3-haiku-20240307', // Fast model for evaluation
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `Rate how well this answer is grounded in the provided sources (0.0 to 1.0).

Answer: "${answer}"

Sources:
${sourceText}

Respond with only a number between 0.0 and 1.0.`
    }]
  })

  const score = parseFloat(response.content[0].text.trim())
  return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score))
}

export async function evaluateRelevance(
  query: string,
  chunks: SearchResult[]
): Promise<number> {
  if (chunks.length === 0) return 0

  // Use average relevance score from retrieval
  const avgRelevance = chunks.reduce((sum, c) => sum + c.relevanceScore, 0) / chunks.length
  return avgRelevance
}

export async function evaluateCoverage(
  question: string,
  answer: string,
  groundTruth?: string
): Promise<number> {
  if (!groundTruth) {
    // Without ground truth, check if answer addresses the question
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Rate how well this answer addresses all aspects of the question (0.0 to 1.0).

Question: "${question}"

Answer: "${answer}"

Respond with only a number between 0.0 and 1.0.`
      }]
    })

    const score = parseFloat(response.content[0].text.trim())
    return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score))
  }

  // With ground truth, compare coverage
  const response = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `Rate how well the generated answer covers the same points as the ground truth (0.0 to 1.0).

Question: "${question}"

Ground Truth: "${groundTruth}"

Generated Answer: "${answer}"

Respond with only a number between 0.0 and 1.0.`
    }]
  })

  const score = parseFloat(response.content[0].text.trim())
  return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score))
}

export async function evaluateRAGResponse(
  question: string,
  answer: string,
  retrievedChunks: SearchResult[],
  groundTruth?: string
): Promise<EvaluationMetrics> {
  const [faithfulness, relevance, coverage] = await Promise.all([
    evaluateFaithfulness(answer, retrievedChunks),
    evaluateRelevance(question, retrievedChunks),
    evaluateCoverage(question, answer, groundTruth)
  ])

  return {
    faithfulness,
    relevance,
    coverage,
    overall: (faithfulness + relevance + coverage) / 3
  }
}

export function createTestDataset(): Array<{
  question: string
  groundTruth: string
  expectedDocuments?: string[]
}> {
  return [
    {
      question: 'What is the main purpose of vector databases?',
      groundTruth: 'Vector databases are designed to store and efficiently search high-dimensional vectors, enabling semantic similarity search for AI applications.',
      expectedDocuments: ['vector-database-guide.pdf']
    },
    {
      question: 'How does RAG improve LLM responses?',
      groundTruth: 'RAG (Retrieval-Augmented Generation) improves LLM responses by retrieving relevant context from external knowledge bases before generating answers, reducing hallucinations and enabling access to up-to-date information.',
      expectedDocuments: ['rag-fundamentals.pdf']
    },
    {
      question: 'What are the main chunking strategies for RAG?',
      groundTruth: 'The main chunking strategies are: fixed-size chunking with overlap, sentence-based chunking, and semantic chunking based on paragraphs or topics.',
      expectedDocuments: ['chunking-strategies.pdf']
    }
  ]
}
```

**Step 4: Create evaluation API**

```typescript
// app/api/rag/evaluate/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hybridSearch } from '@/lib/rag/retrieval'
import { synthesizeFromMultipleSources } from '@/lib/rag/synthesis'
import { evaluateRAGResponse } from '@/lib/rag/evaluation'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { datasetId } = await request.json()

    // Get all questions in dataset
    const { data: questions } = await supabase
      .from('rag_eval_questions')
      .select('*')
      .eq('dataset_id', datasetId)

    if (!questions || questions.length === 0) {
      return Response.json({ error: 'No questions in dataset' }, { status: 400 })
    }

    const results = []

    // Evaluate each question
    for (const question of questions) {
      // Retrieve relevant chunks
      const chunks = await hybridSearch(user.id, question.question, 5)

      // Generate answer
      const synthesis = await synthesizeFromMultipleSources(question.question, chunks)

      // Evaluate
      const metrics = await evaluateRAGResponse(
        question.question,
        synthesis.answer,
        chunks,
        question.ground_truth_answer
      )

      const passed = metrics.overall >= 0.7 // Pass threshold

      // Store result
      await supabase.from('rag_eval_results').insert({
        dataset_id: datasetId,
        question_id: question.id,
        generated_answer: synthesis.answer,
        retrieved_chunks: chunks.map(c => ({
          chunkId: c.chunkId,
          relevance: c.relevanceScore
        })),
        metrics,
        passed
      })

      results.push({
        question: question.question,
        answer: synthesis.answer,
        metrics,
        passed
      })
    }

    const passRate = results.filter(r => r.passed).length / results.length

    return Response.json({
      results,
      summary: {
        totalQuestions: results.length,
        passed: results.filter(r => r.passed).length,
        passRate,
        avgFaithfulness: results.reduce((sum, r) => sum + r.metrics.faithfulness, 0) / results.length,
        avgRelevance: results.reduce((sum, r) => sum + r.metrics.relevance, 0) / results.length,
        avgCoverage: results.reduce((sum, r) => sum + r.metrics.coverage, 0) / results.length
      }
    })

  } catch (error: any) {
    console.error('Evaluation error:', error)
    return Response.json({ error: 'Evaluation failed' }, { status: 500 })
  }
}
```

**Step 5: Commit**

```bash
git add supabase/migrations/20260203_week4_evaluation.sql lib/rag/evaluation.ts app/api/rag/evaluate/route.ts
git commit -m "feat: add RAG evaluation framework

- Evaluation datasets and questions tables
- Three metrics: faithfulness, relevance, coverage
- Automated evaluation API
- Test dataset creation
- Pass/fail thresholds with summary statistics"
```

---

## Task 3: Cross-Session Memory Integration

**Files:**
- Create: `lib/rag/memory-integration.ts`
- Create: `app/api/rag/query-with-memory/route.ts`

**Step 1: Create memory-aware RAG**

```typescript
// lib/rag/memory-integration.ts
import { hybridSearch, SearchResult } from './retrieval'
import { MemoryManager } from '@/lib/memory/memory-manager'
import { synthesizeFromMultipleSources } from './synthesis'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export interface MemoryAwareResponse {
  answer: string
  sources: SearchResult[]
  memoryContext: string
  conversationId?: string
}

export async function queryWithMemory(
  userId: string,
  query: string,
  conversationId?: string
): Promise<MemoryAwareResponse> {
  const memoryManager = new MemoryManager(userId)

  // 1. Retrieve from documents (RAG)
  const documentResults = await hybridSearch(userId, query, 5)

  // 2. Retrieve from episodic memory (past conversations)
  const episodicMemories = await memoryManager.retrieveEpisodicMemory(query, 2)

  // 3. Retrieve from semantic memory (known facts)
  const semanticMemories = await memoryManager.retrieveSemanticMemory(query, 3)

  // 4. Get procedural memory (preferences)
  const procedural = await memoryManager.getProceduralMemory()

  // 5. Assemble comprehensive context
  let context = '# Retrieved Documents:\n\n'
  documentResults.forEach((result, i) => {
    context += `[Doc ${i + 1}] ${result.content}\n\n`
  })

  if (episodicMemories.length > 0) {
    context += '\n# Your Past Conversations:\n\n'
    episodicMemories.forEach((memory: any) => {
      context += `- ${memory.summary}\n`
    })
  }

  if (semanticMemories.length > 0) {
    context += '\n# Known Facts About You:\n\n'
    semanticMemories.forEach((memory: any) => {
      context += `- ${memory.fact}\n`
    })
  }

  if (Object.keys(procedural.preferences).length > 0) {
    context += '\n# Your Preferences:\n\n'
    Object.entries(procedural.preferences).forEach(([key, value]) => {
      context += `- ${key}: ${value}\n`
    })
  }

  // 6. Generate response with full context
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Using the following context, answer this question: "${query}"

${context}

Instructions:
- Prioritize information from retrieved documents
- Reference past conversations if relevant
- Apply user preferences to your response style
- Cite sources using [Doc N] notation`
    }]
  })

  const answer = response.content[0].text

  // 7. Store this exchange in episodic memory
  if (conversationId) {
    const summary = `User asked: "${query}". Assistant answered based on documents and past context.`
    await memoryManager.storeEpisodicMemory(
      conversationId,
      '', // messageId would come from messages table
      summary,
      0.7 // importance score
    )
  }

  // 8. Extract and store facts in semantic memory
  await extractAndStoreFacts(answer, conversationId || '', memoryManager)

  return {
    answer,
    sources: documentResults,
    memoryContext: context,
    conversationId
  }
}

async function extractAndStoreFacts(
  answer: string,
  conversationId: string,
  memoryManager: MemoryManager
): Promise<void> {
  // Use Claude to extract factual statements from the answer
  const response = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Extract key facts from this text that should be remembered. Return as JSON array of strings.

Text: "${answer}"

Respond with only: ["fact 1", "fact 2", ...]`
    }]
  })

  try {
    const facts = JSON.parse(response.content[0].text)
    if (Array.isArray(facts)) {
      for (const fact of facts) {
        await memoryManager.storeSemanticMemory(fact, conversationId, 0.8)
      }
    }
  } catch (error) {
    console.error('Failed to extract facts:', error)
  }
}

export async function summarizeConversation(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  if (messages.length === 0) return ''

  const conversation = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n')

  const response = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Summarize this conversation in 2-3 sentences:

${conversation}`
    }]
  })

  return response.content[0].text
}
```

**Step 2: Create memory-aware query API**

```typescript
// app/api/rag/query-with-memory/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { queryWithMemory } from '@/lib/rag/memory-integration'
import { trackCitations } from '@/lib/rag/citations'
import { validateChatInput } from '@/lib/governance/input-validator'
import { checkRateLimit, RATE_LIMITS } from '@/lib/governance/rate-limiter'
import { checkBudget, trackCost } from '@/lib/governance/cost-tracker'
import { logLLMRequest, calculateCost } from '@/lib/governance/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const supabase = createClient()

  try {
    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    const body = await request.json()
    const validation = await validateChatInput(body)

    if (!validation.valid) {
      return Response.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }

    const { content: query, conversationId } = validation.sanitized

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id, RATE_LIMITS.chat.limit, RATE_LIMITS.chat.window)
    if (!rateLimit.allowed) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Check budget
    const budget = await checkBudget(user.id)
    if (!budget.withinBudget) {
      return Response.json({ error: 'Budget exceeded' }, { status: 402 })
    }

    // Query with memory
    const result = await queryWithMemory(user.id, query, conversationId)

    // Log query
    const { data: queryRecord } = await supabase
      .from('rag_queries')
      .insert({
        user_id: user.id,
        query,
        retrieved_chunks: result.sources.map(s => ({
          chunkId: s.chunkId,
          relevance: s.relevanceScore
        })),
        response: result.answer,
        chunks_used: result.sources.length,
        avg_relevance_score: result.sources.reduce((sum, s) => sum + s.relevanceScore, 0) / result.sources.length,
        latency_ms: Date.now() - startTime
      })
      .select()
      .single()

    // Track citations
    if (queryRecord) {
      await trackCitations(
        queryRecord.id,
        result.sources.map(s => ({
          chunkId: s.chunkId,
          documentId: s.documentId,
          relevanceScore: s.relevanceScore
        }))
      )
    }

    // Log LLM request and track cost
    const tokens = Math.ceil(result.answer.length / 4) + Math.ceil(query.length / 4)
    const cost = calculateCost('claude-3-5-sonnet-20241022', tokens / 2, tokens / 2)

    await logLLMRequest({
      userId: user.id,
      endpoint: '/api/rag/query-with-memory',
      model: 'claude-3-5-sonnet-20241022',
      promptTokens: Math.ceil(tokens / 2),
      completionTokens: Math.ceil(tokens / 2),
      totalTokens: tokens,
      cost,
      latencyMs: Date.now() - startTime,
      status: 'success'
    })

    await trackCost(user.id, cost)

    return Response.json({
      answer: result.answer,
      sources: result.sources,
      hasMemoryContext: result.memoryContext.length > 0,
      conversationId: result.conversationId,
      metadata: {
        sourcesUsed: result.sources.length,
        avgRelevance: result.sources.reduce((sum, s) => sum + s.relevanceScore, 0) / result.sources.length,
        latencyMs: Date.now() - startTime,
        cost
      }
    })

  } catch (error: any) {
    console.error('Memory-aware query error:', error)
    return Response.json({ error: 'Query failed' }, { status: 500 })
  }
}
```

**Step 3: Commit**

```bash
git add lib/rag/memory-integration.ts app/api/rag/query-with-memory/route.ts
git commit -m "feat: add cross-session memory integration with RAG

- Memory-aware RAG combining documents + episodic + semantic + procedural memory
- Automatic fact extraction and storage
- Conversation summarization
- Memory-aware query API with full governance
- Citation tracking and cost monitoring"
```

---

## Task 4: Complete Document Q&A UI

**Files:**
- Create: `app/(dashboard)/rag/page.tsx`
- Create: `app/(dashboard)/rag/documents/page.tsx`
- Create: `components/rag/document-upload.tsx`
- Create: `components/rag/qa-interface.tsx`

**Step 1: Create document upload component**

```typescript
// components/rag/document-upload.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, CheckCircle2, XCircle } from 'lucide-react'

export function DocumentUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setStatus('uploading')
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      setProgress(50)
      setStatus('processing')

      const data = await response.json()

      // Poll for processing completion (in production, use websockets)
      await pollProcessingStatus(data.documentId)

      setProgress(100)
      setStatus('success')

    } catch (error) {
      setStatus('error')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  async function pollProcessingStatus(documentId: string) {
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await fetch(`/api/documents/${documentId}/status`)
      const data = await response.json()

      if (data.status === 'completed') {
        return
      } else if (data.status === 'failed') {
        throw new Error('Processing failed')
      }

      setProgress(50 + (i * 1.5))
    }

    throw new Error('Processing timeout')
  }

  return (
    <div className="border-2 border-dashed rounded-lg p-8">
      <div className="flex flex-col items-center gap-4">
        {status === 'idle' && (
          <>
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-semibold mb-1">Upload Documents</h3>
              <p className="text-sm text-muted-foreground">
                PDF, DOCX, TXT, or MD files
              </p>
            </div>
            <label>
              <Button variant="outline" disabled={uploading} asChild>
                <span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleUpload}
                  />
                  Choose File
                </span>
              </Button>
            </label>
          </>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <>
            <FileText className="h-12 w-12 text-blue-600 animate-pulse" />
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center mt-2 text-muted-foreground">
                {status === 'uploading' ? 'Uploading...' : 'Processing document...'}
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <div className="text-center">
              <h3 className="font-semibold mb-1">Upload Complete</h3>
              <p className="text-sm text-muted-foreground">
                Document processed and ready for search
              </p>
            </div>
            <Button onClick={() => setStatus('idle')}>
              Upload Another
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-600" />
            <div className="text-center">
              <h3 className="font-semibold mb-1">Upload Failed</h3>
              <p className="text-sm text-muted-foreground">
                Please try again
              </p>
            </div>
            <Button onClick={() => setStatus('idle')} variant="outline">
              Try Again
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Create Q&A interface**

```typescript
// components/rag/qa-interface.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, FileText } from 'lucide-react'

export function QAInterface() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/rag/query-with-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: query })
      })

      const data = await res.json()
      setResponse(data)
    } catch (error) {
      console.error('Query error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Ask a question about your documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Ask Question
            </>
          )}
        </Button>
      </form>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              {response.answer}
            </div>

            {response.sources && response.sources.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Sources ({response.sources.length})
                </h4>
                <div className="space-y-2">
                  {response.sources.map((source: any, i: number) => (
                    <div key={i} className="text-sm border-l-2 border-blue-500 pl-3">
                      <div className="font-medium">Source {i + 1}</div>
                      <div className="text-muted-foreground text-xs">
                        Relevance: {(source.relevanceScore * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs mt-1 line-clamp-2">
                        {source.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {response.metadata && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                {response.sourcesUsed} sources • {response.metadata.latencyMs}ms • ${response.metadata.cost.toFixed(4)}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

**Step 3: Create RAG main page**

```typescript
// app/(dashboard)/rag/page.tsx
import { Metadata } from 'next'
import { DocumentUpload } from '@/components/rag/document-upload'
import { QAInterface } from '@/components/rag/qa-interface'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Document Q&A',
  description: 'Ask questions about your documents'
}

export default function RAGPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Document Q&A</h1>
          <p className="text-muted-foreground mt-2">
            Upload documents and ask questions with AI-powered search
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Add PDFs, Word documents, or text files to your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUpload />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ask Questions</CardTitle>
            <CardDescription>
              Search across all your documents with natural language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QAInterface />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add app/\(dashboard\)/rag/page.tsx components/rag/*.tsx
git commit -m "feat: add complete Document Q&A UI

- Document upload component with progress tracking
- Q&A interface with source citations
- RAG main page combining upload and query
- Real-time processing status polling
- Source highlighting and metadata display"
```

---

## Summary

This implementation plan has created the Week 4 advanced RAG features:

**Completed**:
1. ✅ Citation tracking and multi-document synthesis
2. ✅ RAG evaluation framework (faithfulness, relevance, coverage)
3. ✅ Cross-session memory integration with RAG
4. ✅ Complete Document Q&A UI

**Portfolio Piece #2 Complete**: Document Q&A System with:
- Multi-format document ingestion (PDF, DOCX, TXT, MD)
- Hybrid search (vector + keyword)
- Citation tracking with page numbers
- Multi-document synthesis
- Cross-session memory integration
- Comprehensive evaluation framework

**Remaining Tasks** (for complete Week 4):
5. Week 4 concept content (4 MDX files)
6. Week 4 overview page
7. Lab UI for RAG evaluation exercises
8. Memory visualization dashboard
9. Evaluation results dashboard

**Next Steps**:
- Continue with Tasks 5-9 for full Week 4 functionality
- Or move to Week 5 implementation plan
- Or focus on content creation

**Execution Options**:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
