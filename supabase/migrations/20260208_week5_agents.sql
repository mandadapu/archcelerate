-- Week 5: Agent Infrastructure and Tool Calling
-- Note: Core agent tables created in Week 6 migration (20260205_week6_agent_memory.sql)
-- This migration adds tool_calls table and Week 5 curriculum

-- Tool call logs (detailed execution tracking)
CREATE TABLE IF NOT EXISTS public.tool_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES public.agent_executions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES public.agent_steps(id) ON DELETE CASCADE,
    tool_name VARCHAR(200) NOT NULL,
    input JSONB NOT NULL,
    output TEXT,
    success BOOLEAN DEFAULT true,
    error TEXT,
    latency_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_calls_execution ON public.tool_calls(execution_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tool_calls_step ON public.tool_calls(step_id);
CREATE INDEX IF NOT EXISTS idx_tool_calls_tool_name ON public.tool_calls(tool_name);

-- Enable RLS
ALTER TABLE public.tool_calls ENABLE ROW LEVEL SECURITY;

-- RLS Policy for tool_calls
DROP POLICY IF EXISTS "Users can read tool calls for their executions" ON public.tool_calls;
CREATE POLICY "Users can read tool calls for their executions" ON public.tool_calls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agent_executions
            WHERE agent_executions.id = tool_calls.execution_id
            AND agent_executions.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert tool calls for their executions" ON public.tool_calls;
CREATE POLICY "Users can insert tool calls for their executions" ON public.tool_calls
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agent_executions
            WHERE agent_executions.id = tool_calls.execution_id
            AND agent_executions.user_id = auth.uid()
        )
    );

-- Insert Week 5 curriculum
INSERT INTO public.curriculum_weeks (week_number, title, description, objectives)
VALUES (
    5,
    'AI Agents + Agent Pattern Library (Part 1)',
    'Understand agent architectures, master tool/function calling, and build first 3 agent patterns',
    '["Understand agent architectures and reasoning patterns", "Master tool/function calling", "Build first 3 agent patterns", "Learn agent debugging and observability"]'::jsonb
)
ON CONFLICT (week_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    objectives = EXCLUDED.objectives;

-- Get week 5 ID and insert concepts, lab, project
DO $$
DECLARE
    week5_id UUID;
BEGIN
    SELECT id INTO week5_id FROM public.curriculum_weeks WHERE week_number = 5;

    -- Insert Concepts
    INSERT INTO public.concepts (week_id, order_index, slug, title, content_path, estimated_minutes)
    VALUES
        (week5_id, 1, 'agent-fundamentals', 'Agent Fundamentals', 'content/week5/agent-fundamentals.mdx', 60),
        (week5_id, 2, 'building-tools', 'Building Tools for Agents', 'content/week5/building-tools.mdx', 60),
        (week5_id, 3, 'agent-debugging', 'Agent Debugging & Observability', 'content/week5/agent-debugging.mdx', 45)
    ON CONFLICT (week_id, slug) DO UPDATE SET
        order_index = EXCLUDED.order_index,
        title = EXCLUDED.title,
        content_path = EXCLUDED.content_path,
        estimated_minutes = EXCLUDED.estimated_minutes;

    -- Insert Lab
    INSERT INTO public.labs (week_id, slug, title, description, exercises)
    VALUES (
        week5_id,
        'agent-patterns-1-3',
        'Build Agent Patterns 1-3',
        'Hands-on implementation of Research Agent, Code Review Agent, and Customer Support Agent',
        '[
            {"number": 1, "title": "Research Agent: Implement web search tool", "type": "coding"},
            {"number": 2, "title": "Research Agent: Build synthesis loop", "type": "coding"},
            {"number": 3, "title": "Code Review Agent: Build AST parser tool", "type": "coding"},
            {"number": 4, "title": "Code Review Agent: Implement severity scoring", "type": "coding"},
            {"number": 5, "title": "Support Agent: Build KB search tool", "type": "coding"},
            {"number": 6, "title": "Support Agent: Add escalation logic", "type": "coding"}
        ]'::jsonb
    )
    ON CONFLICT (week_id, slug) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        exercises = EXCLUDED.exercises;

    -- Insert Project
    INSERT INTO public.projects (week_id, slug, title, description, requirements, success_criteria, estimated_hours)
    VALUES (
        week5_id,
        'agent-development',
        'Agent Development (Checkpoint)',
        'Build 3 complete agent patterns with proper tools and error handling',
        '[
            "Research Agent: web search, synthesis, report generation",
            "Code Review Agent: AST parsing, security checks, feedback generation",
            "Customer Support Agent: intent classification, KB search, escalation"
        ]'::jsonb,
        '[
            "All 3 patterns built and functional",
            "Research Agent produces coherent reports",
            "Code Review Agent provides categorized feedback",
            "Support Agent escalates correctly"
        ]'::jsonb,
        4
    )
    ON CONFLICT (week_id, slug) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        requirements = EXCLUDED.requirements,
        success_criteria = EXCLUDED.success_criteria,
        estimated_hours = EXCLUDED.estimated_hours;

    -- Insert agent definitions
    INSERT INTO public.agent_definitions (name, slug, description, system_prompt, tools, max_iterations, config, is_public, category)
    VALUES
    (
        'Research Agent',
        'research-agent',
        'Searches web, synthesizes findings, produces reports',
        'You are a research assistant. Your job is to search the web, read relevant sources, and produce a comprehensive report with citations.',
        '["web_search", "url_fetch", "note_taking"]'::jsonb,
        10,
        '{"min_sources": 5, "max_sources": 10}'::jsonb,
        true,
        'research'
    ),
    (
        'Code Review Agent',
        'code-review-agent',
        'Analyzes code for bugs, security issues, and best practices',
        'You are an expert code reviewer. Analyze code for bugs, security vulnerabilities, performance issues, and adherence to best practices. Provide specific, actionable feedback.',
        '["file_read", "ast_parse", "security_scan"]'::jsonb,
        5,
        '{"languages": ["javascript", "typescript", "python"]}'::jsonb,
        true,
        'development'
    ),
    (
        'Customer Support Agent',
        'support-agent',
        'Classifies intents, searches knowledge base, responds or escalates',
        'You are a customer support agent. Classify user intent, search the knowledge base for relevant information, and either provide a helpful response or escalate to a human if confidence is low.',
        '["kb_search", "ticket_create", "human_escalate"]'::jsonb,
        3,
        '{"escalation_threshold": 0.7}'::jsonb,
        true,
        'support'
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        system_prompt = EXCLUDED.system_prompt,
        tools = EXCLUDED.tools,
        max_iterations = EXCLUDED.max_iterations,
        config = EXCLUDED.config,
        is_public = EXCLUDED.is_public,
        category = EXCLUDED.category;
END $$;
