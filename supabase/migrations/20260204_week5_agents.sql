-- Week 5: AI Agents Infrastructure Schema
-- Implements agent executions, thought-action-observation cycles, and tool calling

-- Agent Definitions: Reusable agent templates
CREATE TABLE IF NOT EXISTS public.agent_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    system_prompt TEXT NOT NULL,
    available_tools JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of tool definitions
    config JSONB DEFAULT '{}'::jsonb, -- max_iterations, temperature, etc.
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent Executions: Individual agent run instances
CREATE TABLE IF NOT EXISTS public.agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    agent_definition_id UUID REFERENCES public.agent_definitions(id),
    task_description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'running', -- running, completed, failed, timeout
    iterations INTEGER DEFAULT 0,
    max_iterations INTEGER DEFAULT 10,
    final_answer TEXT,
    error_message TEXT,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agent Steps: Thought-Action-Observation cycles (ReAct pattern)
CREATE TABLE IF NOT EXISTS public.agent_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES public.agent_executions(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    thought TEXT, -- agent's reasoning
    action VARCHAR(200), -- tool name or "Final Answer"
    action_input JSONB, -- tool parameters
    observation TEXT, -- tool output or result
    tokens_used INTEGER DEFAULT 0,
    latency_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(execution_id, step_number)
);

-- Tool Calls: Detailed tool execution logs
CREATE TABLE IF NOT EXISTS public.tool_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES public.agent_executions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES public.agent_steps(id) ON DELETE CASCADE,
    tool_name VARCHAR(200) NOT NULL,
    input JSONB NOT NULL,
    output JSONB,
    success BOOLEAN DEFAULT false,
    error TEXT,
    latency_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.agent_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_calls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_definitions
CREATE POLICY "Anyone can read agent definitions" ON public.agent_definitions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create agent definitions" ON public.agent_definitions
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own agent definitions" ON public.agent_definitions
    FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for agent_executions
CREATE POLICY "Users can read their own agent executions" ON public.agent_executions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent executions" ON public.agent_executions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent executions" ON public.agent_executions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for agent_steps
CREATE POLICY "Users can read their own agent steps" ON public.agent_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agent_executions
            WHERE id = agent_steps.execution_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert agent steps for their executions" ON public.agent_steps
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agent_executions
            WHERE id = agent_steps.execution_id
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for tool_calls
CREATE POLICY "Users can read their own tool calls" ON public.tool_calls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agent_executions
            WHERE id = tool_calls.execution_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert tool calls for their executions" ON public.tool_calls
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agent_executions
            WHERE id = tool_calls.execution_id
            AND user_id = auth.uid()
        )
    );

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_executions_user ON public.agent_executions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_steps_execution ON public.agent_steps(execution_id, step_number);
CREATE INDEX IF NOT EXISTS idx_tool_calls_execution ON public.tool_calls(execution_id, created_at);
