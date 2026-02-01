-- Agent System Tables (Foundation for Week 6+)

-- Agent Definitions: Reusable agent templates
CREATE TABLE IF NOT EXISTS public.agent_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    max_iterations INTEGER DEFAULT 10,
    config JSONB,
    slug VARCHAR(100) UNIQUE,
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Note: Columns already defined in CREATE TABLE above

-- Rename available_tools to tools for consistency (if not already renamed)
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns
            WHERE table_name='agent_definitions' AND column_name='available_tools') THEN
    ALTER TABLE public.agent_definitions RENAME COLUMN available_tools TO tools;
  END IF;
END $$;

-- Generate slugs for existing records
UPDATE public.agent_definitions
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Ensure slug is unique
-- Note: constraint already in CREATE TABLE, this is safety check
DO $$
BEGIN
  -- Check if unique constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'agent_definitions_slug_key'
    AND contype = 'u'
  ) THEN
    -- If not, add it
    ALTER TABLE public.agent_definitions
    ADD CONSTRAINT agent_definitions_slug_key UNIQUE (slug);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Constraint already exists, ignore
END $$;

CREATE INDEX IF NOT EXISTS idx_agent_definitions_slug ON public.agent_definitions(slug);
CREATE INDEX IF NOT EXISTS idx_agent_definitions_category ON public.agent_definitions(category);

-- Agent Executions: Records of agent runs
CREATE TABLE IF NOT EXISTS public.agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    agent_definition_id UUID REFERENCES public.agent_definitions(id),
    input TEXT NOT NULL,
    output TEXT,
    status VARCHAR(50) DEFAULT 'running', -- running, completed, failed, timeout
    iterations INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_agent_executions_user ON public.agent_executions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON public.agent_executions(status);
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent ON public.agent_executions(agent_definition_id);

-- Agent Steps: Individual thought-action-observation cycles
CREATE TABLE IF NOT EXISTS public.agent_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES public.agent_executions(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    thought TEXT,
    action VARCHAR(200) NOT NULL,
    action_input JSONB,
    observation TEXT,
    tokens_used INTEGER DEFAULT 0,
    latency_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_steps_execution ON public.agent_steps(execution_id, step_number);

-- Short-term memory: Context within a single execution
CREATE TABLE IF NOT EXISTS public.agent_short_term_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES public.agent_executions(id) ON DELETE CASCADE,
    key VARCHAR(200) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_short_term_execution ON public.agent_short_term_memory(execution_id);

-- Long-term memory: Consolidated knowledge across executions
CREATE TABLE IF NOT EXISTS public.agent_long_term_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    agent_definition_id UUID REFERENCES public.agent_definitions(id),
    summary TEXT NOT NULL,
    embedding vector(1536),
    importance_score DECIMAL(3, 2) DEFAULT 0.5, -- 0.0 to 1.0
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_agent_long_term_user_agent ON public.agent_long_term_memory(user_id, agent_definition_id);
CREATE INDEX IF NOT EXISTS idx_agent_long_term_embedding ON public.agent_long_term_memory USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Enable RLS
ALTER TABLE public.agent_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_short_term_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_long_term_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can read public agent definitions" ON public.agent_definitions;
CREATE POLICY "Anyone can read public agent definitions" ON public.agent_definitions
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can create their own agent definitions" ON public.agent_definitions;
DROP POLICY IF EXISTS "Users can read their own agent definitions" ON public.agent_definitions;

DROP POLICY IF EXISTS "Users can manage their own executions" ON public.agent_executions;
CREATE POLICY "Users can manage their own executions" ON public.agent_executions
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read steps from their executions" ON public.agent_steps;
CREATE POLICY "Users can read steps from their executions" ON public.agent_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agent_executions
            WHERE agent_executions.id = agent_steps.execution_id
            AND agent_executions.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage their short-term memory" ON public.agent_short_term_memory;
CREATE POLICY "Users can manage their short-term memory" ON public.agent_short_term_memory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.agent_executions
            WHERE agent_executions.id = agent_short_term_memory.execution_id
            AND agent_executions.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage their long-term memory" ON public.agent_long_term_memory;
CREATE POLICY "Users can manage their long-term memory" ON public.agent_long_term_memory
    FOR ALL USING (auth.uid() = user_id);

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
