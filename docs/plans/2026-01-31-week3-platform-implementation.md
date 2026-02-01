# Week 3 Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build platform features to deliver Week 3 curriculum (RAG Fundamentals + Memory Architecture)

**Architecture:** Integrate vector database (pgvector extension in Supabase), build document ingestion pipeline, implement retrieval system, add memory architecture (working, episodic, semantic). Content stored in MDX.

**Tech Stack:** Next.js 14, Supabase (PostgreSQL + pgvector), OpenAI Embeddings API, Claude API, MDX

---

## Task 1: Database Schema for RAG and Memory

**Files:**
- Create: `supabase/migrations/20260202_week3_rag_memory.sql`

**Step 1: Enable pgvector extension**

```sql
-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;
```

**Step 2: Create documents and embeddings tables**

```sql
-- Documents uploaded by users
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    filename VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    content_preview TEXT, -- First 500 chars
    total_chunks INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Document chunks with embeddings
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI ada-002 produces 1536-dimensional vectors
    token_count INTEGER,
    metadata JSONB, -- {page: 1, section: "Introduction", ...}
    created_at TIMESTAMP DEFAULT NOW()
);

-- Memory: Episodic (conversation history with embeddings for retrieval)
CREATE TABLE IF NOT EXISTS public.memory_episodic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    summary TEXT, -- Compressed summary of the exchange
    embedding vector(1536),
    importance_score DECIMAL(3, 2), -- 0.0 to 1.0, for memory pruning
    created_at TIMESTAMP DEFAULT NOW()
);

-- Memory: Semantic (facts and knowledge extracted from conversations)
CREATE TABLE IF NOT EXISTS public.memory_semantic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    fact TEXT NOT NULL,
    source_conversation_id UUID REFERENCES public.conversations(id),
    embedding vector(1536),
    confidence DECIMAL(3, 2), -- 0.0 to 1.0
    last_accessed TIMESTAMP DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Memory: Procedural (user preferences and patterns)
CREATE TABLE IF NOT EXISTS public.memory_procedural (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) UNIQUE,
    preferences JSONB, -- {responseStyle: "concise", codeLanguage: "typescript", ...}
    patterns JSONB, -- {typicalQuestionTypes: [...], commonTopics: [...], ...}
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- RAG queries (for analytics and improvement)
CREATE TABLE IF NOT EXISTS public.rag_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    query TEXT NOT NULL,
    retrieved_chunks JSONB, -- Array of chunk IDs and relevance scores
    response TEXT,
    chunks_used INTEGER,
    avg_relevance_score DECIMAL(4, 3),
    latency_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_episodic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_semantic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_procedural ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own documents" ON public.documents
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read chunks from their documents" ON public.document_chunks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE documents.id = document_chunks.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their episodic memory" ON public.memory_episodic
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their semantic memory" ON public.memory_semantic
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their procedural memory" ON public.memory_procedural
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their RAG queries" ON public.rag_queries
    FOR SELECT USING (auth.uid() = user_id);

-- Create vector similarity search indexes
CREATE INDEX ON public.document_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX ON public.memory_episodic USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 50);

CREATE INDEX ON public.memory_semantic USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 50);

-- Create other indexes for performance
CREATE INDEX idx_documents_user_status ON public.documents(user_id, status);
CREATE INDEX idx_chunks_document ON public.document_chunks(document_id, chunk_index);
CREATE INDEX idx_memory_episodic_user ON public.memory_episodic(user_id, created_at DESC);
CREATE INDEX idx_memory_semantic_user ON public.memory_semantic(user_id, last_accessed DESC);
```

**Step 3: Run migration**

```bash
npx supabase migration up
```

Expected: Migration applied successfully, pgvector extension enabled

**Step 4: Seed Week 3 data**

Create: `supabase/seed/week3_data.sql`

```sql
-- Insert Week 3
INSERT INTO public.curriculum_weeks (week_number, title, description, objectives)
VALUES (
    3,
    'RAG Fundamentals + Memory Architecture',
    'Understand RAG architecture, master vector databases, and learn memory types in AI systems',
    '["Understand RAG architecture", "Master embedding models and vector databases", "Learn memory types (working, episodic, semantic, procedural)", "Build document ingestion and retrieval pipeline"]'::jsonb
);

-- Get week 3 ID
DO $$
DECLARE
    week3_id UUID;
BEGIN
    SELECT id INTO week3_id FROM public.curriculum_weeks WHERE week_number = 3;

    -- Insert Concepts
    INSERT INTO public.concepts (week_id, order_index, slug, title, content_path, estimated_minutes)
    VALUES
        (week3_id, 1, 'rag-fundamentals', 'RAG Fundamentals', 'content/week3/rag-fundamentals.mdx', 60),
        (week3_id, 2, 'vector-databases', 'Vector Databases & Indexing', 'content/week3/vector-databases.mdx', 60),
        (week3_id, 3, 'retrieval-optimization', 'Retrieval Optimization', 'content/week3/retrieval-optimization.mdx', 45),
        (week3_id, 4, 'memory-architecture', 'Memory Architecture Deep-Dive', 'content/week3/memory-architecture.mdx', 75);

    -- Insert Lab
    INSERT INTO public.labs (week_id, slug, title, description, exercises)
    VALUES (
        week3_id,
        'rag-pipeline',
        'RAG Pipeline Construction',
        'Build production-grade retrieval pipelines with optimal chunking and ranking',
        '[
            {"number": 1, "title": "Chunk documents with 3 strategies, compare", "type": "coding"},
            {"number": 2, "title": "Generate embeddings and store in pgvector", "type": "coding"},
            {"number": 3, "title": "Implement semantic search with ranking", "type": "coding"},
            {"number": 4, "title": "Build hybrid search (vector + keyword)", "type": "coding"},
            {"number": 5, "title": "Add metadata filtering", "type": "coding"},
            {"number": 6, "title": "Implement query transformation", "type": "coding"}
        ]'::jsonb
    );

    -- Insert Project
    INSERT INTO public.projects (week_id, slug, title, description, requirements, success_criteria, estimated_hours)
    VALUES (
        week3_id,
        'document-qa-foundation',
        'Document Q&A System (Foundation)',
        'Build document ingestion pipeline and basic retrieval system',
        '[
            "Document ingestion pipeline (upload PDFs, process, embed)",
            "Vector database integration (pgvector)",
            "Basic retrieval working",
            "Simple Q&A interface",
            "Initial deployment"
        ]'::jsonb,
        '[
            "3-5 documents successfully ingested",
            "Semantic search returns relevant chunks",
            "Basic Q&A working (no citations yet)",
            "Foundation ready for Week 4 enhancements"
        ]'::jsonb,
        4
    );
END $$;
```

**Step 5: Run seed**

```bash
psql $DATABASE_URL < supabase/seed/week3_data.sql
```

Expected: Week 3 data inserted successfully

**Step 6: Commit**

```bash
git add supabase/migrations/20260202_week3_rag_memory.sql supabase/seed/week3_data.sql
git commit -m "feat: add Week 3 database schema for RAG and memory

- Enable pgvector extension for vector similarity search
- Add documents and document_chunks tables with vector embeddings
- Add memory tables (episodic, semantic, procedural)
- Add rag_queries for analytics
- Create vector similarity search indexes (IVFFlat)
- Enable RLS with appropriate policies
- Seed Week 3 curriculum data"
```

---

## Task 2: Document Processing Service

**Files:**
- Create: `lib/rag/document-processor.ts`
- Create: `lib/rag/chunking.ts`
- Create: `lib/rag/embeddings.ts`

**Step 1: Install dependencies**

```bash
npm install pdf-parse mammoth openai tiktoken
```

**Step 2: Create chunking strategies**

```typescript
// lib/rag/chunking.ts
import { encoding_for_model } from 'tiktoken'

export interface Chunk {
  content: string
  index: number
  tokens: number
  metadata?: Record<string, any>
}

export interface ChunkingStrategy {
  name: string
  chunk(text: string): Chunk[]
}

// Strategy 1: Fixed-size chunking with overlap
export class FixedSizeChunking implements ChunkingStrategy {
  name = 'fixed-size'

  constructor(
    private chunkSize: number = 1000,
    private overlap: number = 200
  ) {}

  chunk(text: string): Chunk[] {
    const encoding = encoding_for_model('gpt-3.5-turbo')
    const tokens = encoding.encode(text)
    const chunks: Chunk[] = []

    for (let i = 0; i < tokens.length; i += this.chunkSize - this.overlap) {
      const chunkTokens = tokens.slice(i, i + this.chunkSize)
      const chunkText = new TextDecoder().decode(encoding.decode(chunkTokens))

      chunks.push({
        content: chunkText,
        index: chunks.length,
        tokens: chunkTokens.length
      })
    }

    encoding.free()
    return chunks
  }
}

// Strategy 2: Sentence-based chunking
export class SentenceChunking implements ChunkingStrategy {
  name = 'sentence'

  constructor(
    private maxTokens: number = 1000
  ) {}

  chunk(text: string): Chunk[] {
    const encoding = encoding_for_model('gpt-3.5-turbo')

    // Split into sentences (simple regex)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    const chunks: Chunk[] = []
    let currentChunk: string[] = []
    let currentTokens = 0

    for (const sentence of sentences) {
      const sentenceTokens = encoding.encode(sentence).length

      if (currentTokens + sentenceTokens > this.maxTokens && currentChunk.length > 0) {
        // Save current chunk
        const chunkText = currentChunk.join(' ')
        chunks.push({
          content: chunkText,
          index: chunks.length,
          tokens: encoding.encode(chunkText).length
        })
        currentChunk = []
        currentTokens = 0
      }

      currentChunk.push(sentence)
      currentTokens += sentenceTokens
    }

    // Add remaining chunk
    if (currentChunk.length > 0) {
      const chunkText = currentChunk.join(' ')
      chunks.push({
        content: chunkText,
        index: chunks.length,
        tokens: encoding.encode(chunkText).length
      })
    }

    encoding.free()
    return chunks
  }
}

// Strategy 3: Semantic chunking (paragraph-based)
export class SemanticChunking implements ChunkingStrategy {
  name = 'semantic'

  constructor(
    private maxTokens: number = 1000
  ) {}

  chunk(text: string): Chunk[] {
    const encoding = encoding_for_model('gpt-3.5-turbo')

    // Split into paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
    const chunks: Chunk[] = []
    let currentChunk: string[] = []
    let currentTokens = 0

    for (const paragraph of paragraphs) {
      const paragraphTokens = encoding.encode(paragraph).length

      if (currentTokens + paragraphTokens > this.maxTokens && currentChunk.length > 0) {
        // Save current chunk
        const chunkText = currentChunk.join('\n\n')
        chunks.push({
          content: chunkText,
          index: chunks.length,
          tokens: encoding.encode(chunkText).length
        })
        currentChunk = []
        currentTokens = 0
      }

      currentChunk.push(paragraph)
      currentTokens += paragraphTokens
    }

    // Add remaining chunk
    if (currentChunk.length > 0) {
      const chunkText = currentChunk.join('\n\n')
      chunks.push({
        content: chunkText,
        index: chunks.length,
        tokens: encoding.encode(chunkText).length
      })
    }

    encoding.free()
    return chunks
  }
}

export const CHUNKING_STRATEGIES = {
  'fixed-size': FixedSizeChunking,
  'sentence': SentenceChunking,
  'semantic': SemanticChunking
}
```

**Step 3: Create embeddings service**

```typescript
// lib/rag/embeddings.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  })

  return response.data[0].embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // Batch process for efficiency (max 2048 texts per request)
  const batchSize = 2048
  const allEmbeddings: number[][] = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: batch
    })

    allEmbeddings.push(...response.data.map(d => d.embedding))
  }

  return allEmbeddings
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimensions')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
```

**Step 4: Create document processor**

```typescript
// lib/rag/document-processor.ts
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import { createClient } from '@/lib/supabase/server'
import { FixedSizeChunking, SentenceChunking, SemanticChunking } from './chunking'
import { generateEmbeddings } from './embeddings'

export async function processDocument(
  documentId: string,
  filePath: string,
  fileType: string
): Promise<void> {
  const supabase = createClient()

  try {
    // Update status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId)

    // Extract text based on file type
    const text = await extractText(filePath, fileType)

    // Chunk the text (using semantic chunking by default)
    const chunker = new SemanticChunking(1000)
    const chunks = chunker.chunk(text)

    // Generate embeddings for all chunks
    const embeddings = await generateEmbeddings(chunks.map(c => c.content))

    // Insert chunks into database
    const chunkRecords = chunks.map((chunk, i) => ({
      document_id: documentId,
      chunk_index: chunk.index,
      content: chunk.content,
      embedding: JSON.stringify(embeddings[i]), // pgvector accepts array
      token_count: chunk.tokens,
      metadata: chunk.metadata || {}
    }))

    await supabase
      .from('document_chunks')
      .insert(chunkRecords)

    // Update document status
    await supabase
      .from('documents')
      .update({
        status: 'completed',
        total_chunks: chunks.length,
        content_preview: text.substring(0, 500)
      })
      .eq('id', documentId)

  } catch (error: any) {
    console.error('Document processing error:', error)

    await supabase
      .from('documents')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', documentId)

    throw error
  }
}

async function extractText(filePath: string, fileType: string): Promise<string> {
  if (fileType === 'application/pdf') {
    const buffer = await fetch(filePath).then(r => r.arrayBuffer())
    const data = await pdf(Buffer.from(buffer))
    return data.text
  }

  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const buffer = await fetch(filePath).then(r => r.arrayBuffer())
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
    return result.value
  }

  if (fileType === 'text/plain' || fileType === 'text/markdown') {
    const response = await fetch(filePath)
    return await response.text()
  }

  throw new Error(`Unsupported file type: ${fileType}`)
}
```

**Step 5: Commit**

```bash
git add lib/rag/*.ts package.json package-lock.json
git commit -m "feat: add document processing service for RAG

- Three chunking strategies: fixed-size, sentence, semantic
- Embeddings service using OpenAI ada-002
- Document processor supporting PDF, DOCX, TXT, MD
- Automatic chunk generation and embedding
- Cosine similarity utility for relevance scoring"
```

---

## Task 3: Vector Search and Retrieval

**Files:**
- Create: `lib/rag/retrieval.ts`
- Create: `app/api/documents/upload/route.ts`
- Create: `app/api/rag/search/route.ts`

**Step 1: Create retrieval service**

```typescript
// lib/rag/retrieval.ts
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from './embeddings'

export interface SearchResult {
  chunkId: string
  documentId: string
  content: string
  relevanceScore: number
  metadata: Record<string, any>
}

export async function semanticSearch(
  userId: string,
  query: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<SearchResult[]> {
  const supabase = createClient()

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query)

  // Perform vector similarity search
  const { data, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
    p_user_id: userId
  })

  if (error) throw error

  return data.map((row: any) => ({
    chunkId: row.id,
    documentId: row.document_id,
    content: row.content,
    relevanceScore: row.similarity,
    metadata: row.metadata
  }))
}

export async function hybridSearch(
  userId: string,
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const supabase = createClient()

  // Get vector search results
  const vectorResults = await semanticSearch(userId, query, limit * 2, 0.5)

  // Get keyword search results (PostgreSQL full-text search)
  const { data: keywordResults } = await supabase
    .from('document_chunks')
    .select(`
      id,
      document_id,
      content,
      metadata,
      documents!inner(user_id)
    `)
    .textSearch('content', query, {
      type: 'websearch',
      config: 'english'
    })
    .eq('documents.user_id', userId)
    .limit(limit * 2)

  // Combine and re-rank results
  const combined = new Map<string, SearchResult>()

  vectorResults.forEach((result, index) => {
    combined.set(result.chunkId, {
      ...result,
      relevanceScore: result.relevanceScore * 0.7 + (1 - index / vectorResults.length) * 0.3
    })
  })

  keywordResults?.forEach((result, index) => {
    const existing = combined.get(result.id)
    if (existing) {
      // Boost score if appears in both results
      existing.relevanceScore += 0.2
    } else {
      combined.set(result.id, {
        chunkId: result.id,
        documentId: result.document_id,
        content: result.content,
        relevanceScore: (1 - index / keywordResults.length) * 0.5,
        metadata: result.metadata
      })
    }
  })

  // Sort by relevance and return top results
  return Array.from(combined.values())
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
}
```

**Step 2: Create vector search SQL function**

Add to migration: `supabase/migrations/20260202_week3_rag_memory.sql`

```sql
-- Function for vector similarity search
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE d.user_id = p_user_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

**Step 3: Create document upload API**

```typescript
// app/api/documents/upload/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processDocument } from '@/lib/rag/document-processor'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ]

    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: 'Unsupported file type', allowedTypes },
        { status: 400 }
      )
    }

    // Upload file to Supabase Storage
    const filePath = `${user.id}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_path: publicUrl,
        file_size: file.size,
        file_type: file.type,
        status: 'pending'
      })
      .select()
      .single()

    if (docError) throw docError

    // Process document asynchronously (in production, use a queue)
    processDocument(document.id, publicUrl, file.type)
      .catch(error => console.error('Background processing error:', error))

    return Response.json({
      documentId: document.id,
      filename: file.name,
      status: 'processing',
      message: 'Document uploaded successfully and is being processed'
    })

  } catch (error: any) {
    console.error('Document upload error:', error)
    return Response.json(
      { error: 'Upload failed', message: error.message },
      { status: 500 }
    )
  }
}
```

**Step 4: Create RAG search API**

```typescript
// app/api/rag/search/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hybridSearch } from '@/lib/rag/retrieval'
import { validateChatInput } from '@/lib/governance/input-validator'
import { checkRateLimit, RATE_LIMITS } from '@/lib/governance/rate-limiter'

export async function POST(request: NextRequest) {
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

    const { content: query } = validation.sanitized

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id, 20, 60) // 20 searches per minute

    if (!rateLimit.allowed) {
      return Response.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Perform hybrid search
    const startTime = Date.now()
    const results = await hybridSearch(user.id, query, 5)
    const latencyMs = Date.now() - startTime

    // Log query for analytics
    await supabase.from('rag_queries').insert({
      user_id: user.id,
      query,
      retrieved_chunks: results.map(r => ({
        chunkId: r.chunkId,
        relevance: r.relevanceScore
      })),
      chunks_used: results.length,
      avg_relevance_score: results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length,
      latency_ms: latencyMs
    })

    return Response.json({
      results,
      metadata: {
        totalResults: results.length,
        latencyMs,
        avgRelevance: results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length
      }
    })

  } catch (error: any) {
    console.error('RAG search error:', error)
    return Response.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    )
  }
}
```

**Step 5: Create storage bucket**

```bash
# Run this in Supabase dashboard or via CLI
npx supabase storage create documents --public
```

**Step 6: Commit**

```bash
git add lib/rag/retrieval.ts app/api/documents/upload/route.ts app/api/rag/search/route.ts supabase/migrations/20260202_week3_rag_memory.sql
git commit -m "feat: add vector search and document upload

- Semantic search using pgvector cosine similarity
- Hybrid search combining vector + keyword search
- Document upload API with storage integration
- RAG search API with rate limiting and analytics
- SQL function for efficient vector similarity search"
```

---

## Task 4: Memory System Implementation

**Files:**
- Create: `lib/memory/memory-manager.ts`
- Create: `app/api/memory/store/route.ts`

**Step 1: Create memory manager**

```typescript
// lib/memory/memory-manager.ts
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/rag/embeddings'

export class MemoryManager {
  constructor(private userId: string) {}

  // Episodic Memory: Store conversation exchanges
  async storeEpisodicMemory(
    conversationId: string,
    messageId: string,
    summary: string,
    importanceScore: number = 0.5
  ) {
    const supabase = createClient()
    const embedding = await generateEmbedding(summary)

    await supabase.from('memory_episodic').insert({
      user_id: this.userId,
      conversation_id: conversationId,
      message_id: messageId,
      summary,
      embedding: JSON.stringify(embedding),
      importance_score: importanceScore
    })
  }

  // Retrieve relevant episodic memories
  async retrieveEpisodicMemory(query: string, limit: number = 3): Promise<any[]> {
    const supabase = createClient()
    const queryEmbedding = await generateEmbedding(query)

    const { data } = await supabase.rpc('match_episodic_memory', {
      query_embedding: queryEmbedding,
      match_count: limit,
      p_user_id: this.userId
    })

    return data || []
  }

  // Semantic Memory: Store facts extracted from conversations
  async storeSemanticMemory(
    fact: string,
    sourceConversationId: string,
    confidence: number = 0.8
  ) {
    const supabase = createClient()
    const embedding = await generateEmbedding(fact)

    await supabase.from('memory_semantic').insert({
      user_id: this.userId,
      fact,
      source_conversation_id: sourceConversationId,
      embedding: JSON.stringify(embedding),
      confidence
    })
  }

  // Retrieve relevant semantic memories
  async retrieveSemanticMemory(query: string, limit: number = 3): Promise<any[]> {
    const supabase = createClient()
    const queryEmbedding = await generateEmbedding(query)

    const { data } = await supabase.rpc('match_semantic_memory', {
      query_embedding: queryEmbedding,
      match_count: limit,
      p_user_id: this.userId
    })

    // Update access count
    if (data) {
      const ids = data.map((m: any) => m.id)
      await supabase
        .from('memory_semantic')
        .update({
          access_count: supabase.rpc('increment', { x: 1 }),
          last_accessed: new Date().toISOString()
        })
        .in('id', ids)
    }

    return data || []
  }

  // Procedural Memory: Update user preferences
  async updateProceduralMemory(preferences: Record<string, any>) {
    const supabase = createClient()

    const { data: existing } = await supabase
      .from('memory_procedural')
      .select('*')
      .eq('user_id', this.userId)
      .single()

    if (existing) {
      await supabase
        .from('memory_procedural')
        .update({
          preferences: { ...existing.preferences, ...preferences },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', this.userId)
    } else {
      await supabase.from('memory_procedural').insert({
        user_id: this.userId,
        preferences,
        patterns: {}
      })
    }
  }

  // Get procedural memory (preferences)
  async getProceduralMemory(): Promise<any> {
    const supabase = createClient()

    const { data } = await supabase
      .from('memory_procedural')
      .select('*')
      .eq('user_id', this.userId)
      .single()

    return data || { preferences: {}, patterns: {} }
  }

  // Memory pruning: Remove low-importance episodic memories
  async pruneEpisodicMemory(threshold: number = 0.3, maxAge: number = 90) {
    const supabase = createClient()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - maxAge)

    await supabase
      .from('memory_episodic')
      .delete()
      .eq('user_id', this.userId)
      .lt('importance_score', threshold)
      .lt('created_at', cutoffDate.toISOString())
  }

  // Assemble context from all memory types
  async assembleContext(query: string): Promise<string> {
    const [episodic, semantic, procedural] = await Promise.all([
      this.retrieveEpisodicMemory(query, 2),
      this.retrieveSemanticMemory(query, 3),
      this.getProceduralMemory()
    ])

    let context = ''

    if (episodic.length > 0) {
      context += 'Recent relevant conversations:\n'
      episodic.forEach((m: any) => {
        context += `- ${m.summary}\n`
      })
      context += '\n'
    }

    if (semantic.length > 0) {
      context += 'Known facts about you:\n'
      semantic.forEach((m: any) => {
        context += `- ${m.fact}\n`
      })
      context += '\n'
    }

    if (Object.keys(procedural.preferences).length > 0) {
      context += 'Your preferences:\n'
      Object.entries(procedural.preferences).forEach(([key, value]) => {
        context += `- ${key}: ${value}\n`
      })
    }

    return context
  }
}
```

**Step 2: Add memory search functions to migration**

Add to: `supabase/migrations/20260202_week3_rag_memory.sql`

```sql
-- Function for episodic memory search
CREATE OR REPLACE FUNCTION match_episodic_memory(
  query_embedding vector(1536),
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  summary text,
  conversation_id uuid,
  similarity float,
  created_at timestamp
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    summary,
    conversation_id,
    1 - (embedding <=> query_embedding) as similarity,
    created_at
  FROM memory_episodic
  WHERE user_id = p_user_id
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function for semantic memory search
CREATE OR REPLACE FUNCTION match_semantic_memory(
  query_embedding vector(1536),
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  fact text,
  confidence decimal,
  similarity float,
  access_count int
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    fact,
    confidence,
    1 - (embedding <=> query_embedding) as similarity,
    access_count
  FROM memory_semantic
  WHERE user_id = p_user_id
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

**Step 3: Create memory API**

```typescript
// app/api/memory/store/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MemoryManager } from '@/lib/memory/memory-manager'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    const memoryManager = new MemoryManager(user.id)

    switch (type) {
      case 'episodic':
        await memoryManager.storeEpisodicMemory(
          data.conversationId,
          data.messageId,
          data.summary,
          data.importanceScore
        )
        break

      case 'semantic':
        await memoryManager.storeSemanticMemory(
          data.fact,
          data.sourceConversationId,
          data.confidence
        )
        break

      case 'procedural':
        await memoryManager.updateProceduralMemory(data.preferences)
        break

      default:
        return Response.json({ error: 'Invalid memory type' }, { status: 400 })
    }

    return Response.json({ success: true })

  } catch (error: any) {
    console.error('Memory store error:', error)
    return Response.json(
      { error: 'Failed to store memory' },
      { status: 500 }
    )
  }
}
```

**Step 4: Commit**

```bash
git add lib/memory/memory-manager.ts app/api/memory/store/route.ts supabase/migrations/20260202_week3_rag_memory.sql
git commit -m "feat: add memory system implementation

- Memory manager for all memory types (episodic, semantic, procedural)
- Episodic memory: conversation history with embeddings
- Semantic memory: extracted facts with access tracking
- Procedural memory: user preferences and patterns
- Memory pruning for old/low-importance memories
- Context assembly from all memory types
- SQL functions for memory similarity search"
```

---

## Summary

This implementation plan has created the Week 3 RAG and memory infrastructure:

**Completed**:
1. ✅ Database schema for RAG (pgvector, documents, chunks, memory tables)
2. ✅ Document processing service (chunking, embeddings, extraction)
3. ✅ Vector search and retrieval (semantic, hybrid, upload API)
4. ✅ Memory system (episodic, semantic, procedural)

**Remaining Tasks** (for complete Week 3):
5. Week 3 concept content (4 MDX files)
6. Week 3 overview page
7. Lab UI for RAG exercises
8. Document Q&A interface
9. Memory visualization dashboard
10. Week 3 project page

**Next Steps**:
- Continue with Tasks 5-10 for full Week 3 functionality
- Or move to Week 4 implementation plan
- Or focus on content creation

**Execution Options**:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
