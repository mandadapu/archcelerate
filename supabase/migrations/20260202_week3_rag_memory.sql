-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents uploaded by users
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
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
    embedding vector(1536), -- Voyage AI voyage-large-2 produces 1536-dimensional vectors
    token_count INTEGER,
    metadata JSONB, -- {page: 1, section: "Introduction", ...}
    created_at TIMESTAMP DEFAULT NOW()
);

-- Memory: Episodic (conversation history with embeddings for retrieval)
CREATE TABLE IF NOT EXISTS public.memory_episodic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
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
    user_id UUID REFERENCES auth.users(id),
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
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    preferences JSONB, -- {responseStyle: "concise", codeLanguage: "typescript", ...}
    patterns JSONB, -- {typicalQuestionTypes: [...], commonTopics: [...], ...}
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- RAG queries (for analytics and improvement)
CREATE TABLE IF NOT EXISTS public.rag_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
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
