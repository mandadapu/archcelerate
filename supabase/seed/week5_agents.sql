-- Week 5 Seed Data: AI Agents with ReAct Architecture

-- Insert Week 5
INSERT INTO public.curriculum_weeks (week_number, title, description, objectives)
VALUES (
    5,
    'AI Agents: ReAct Architecture & Tool Calling',
    'Build autonomous AI agents using ReAct pattern with tool/function calling',
    '["Understand ReAct (Reasoning + Acting) architecture", "Implement tool/function calling", "Build multi-step agent workflows", "Debug agent behavior and failures", "Handle errors and edge cases in agent loops"]'::jsonb
);

-- Get week 5 ID
DO $$
DECLARE
    week5_id UUID;
BEGIN
    SELECT id INTO week5_id FROM public.curriculum_weeks WHERE week_number = 5;

    -- Insert Concepts
    INSERT INTO public.concepts (week_id, order_index, slug, title, content_path, estimated_minutes)
    VALUES
        (week5_id, 1, 'agent-fundamentals', 'Agent Fundamentals & ReAct Pattern', 'content/week5/agent-fundamentals.mdx', 60),
        (week5_id, 2, 'building-tools', 'Building Tools & Function Calling', 'content/week5/building-tools.mdx', 75),
        (week5_id, 3, 'agent-debugging', 'Debugging Agents & Error Handling', 'content/week5/agent-debugging.mdx', 45);

    -- Insert Lab
    INSERT INTO public.labs (week_id, slug, title, description, exercises)
    VALUES (
        week5_id,
        'agent-patterns-1-3',
        'Agent Patterns & Implementation',
        'Implement ReAct loop, build custom tools, handle errors, and create multi-tool agents',
        '[
            {"number": 1, "title": "Implement basic ReAct loop with thought-action-observation", "type": "coding"},
            {"number": 2, "title": "Build calculator and search tools", "type": "coding"},
            {"number": 3, "title": "Create weather API tool with error handling", "type": "coding"},
            {"number": 4, "title": "Implement multi-tool agent (calculator + search + weather)", "type": "coding"},
            {"number": 5, "title": "Debug agent loops and infinite iterations", "type": "debugging"},
            {"number": 6, "title": "Build agent execution visualizer", "type": "coding"}
        ]'::jsonb
    );

    -- Insert Project
    INSERT INTO public.projects (week_id, slug, title, description, requirements, success_criteria, estimated_hours)
    VALUES (
        week5_id,
        'agent-development',
        'Build Production-Ready AI Agent',
        'Create a fully-functional AI agent with custom tools, error handling, and execution tracking',
        '[
            "Implement ReAct loop with configurable max iterations",
            "Build at least 3 custom tools (e.g., web search, calculator, API calls)",
            "Tool call logging and execution tracking",
            "Error handling for failed tools and API timeouts",
            "Agent execution visualizer showing thought-action-observation cycles",
            "Cost tracking per agent run",
            "Conversation persistence for multi-turn agent interactions",
            "Unit tests for agent logic and tool execution"
        ]'::jsonb,
        '[
            "Agent successfully completes multi-step tasks requiring multiple tools",
            "Gracefully handles tool failures without crashing",
            "Execution visualizer shows complete thought process",
            "Agent stops before hitting max iterations on simple tasks",
            "All tools have >90% success rate with proper inputs"
        ]'::jsonb,
        6
    );
END $$;

-- Insert Agent Definitions (Example Templates)

-- Research Agent
INSERT INTO public.agent_definitions (name, description, system_prompt, available_tools, config)
VALUES (
    'Research Agent',
    'Autonomous research agent that can search the web, analyze content, and synthesize findings',
    'You are a research assistant. When given a research question:
1. Break it down into searchable sub-questions
2. Use the web_search tool to find relevant information
3. Analyze and synthesize the findings
4. Provide a comprehensive answer with sources

Always think step-by-step and explain your reasoning.',
    '[
        {
            "name": "web_search",
            "description": "Search the web for information",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                    "num_results": {"type": "integer", "description": "Number of results to return", "default": 5}
                },
                "required": ["query"]
            }
        },
        {
            "name": "extract_content",
            "description": "Extract main content from a URL",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "URL to extract content from"}
                },
                "required": ["url"]
            }
        }
    ]'::jsonb,
    '{"max_iterations": 10, "temperature": 0.7, "model": "claude-sonnet-4-20250514"}'::jsonb
);

-- Code Review Agent
INSERT INTO public.agent_definitions (name, description, system_prompt, available_tools, config)
VALUES (
    'Code Review Agent',
    'Reviews code for bugs, security issues, and best practices',
    'You are a senior code reviewer. When given code:
1. Analyze for bugs and logic errors
2. Check for security vulnerabilities
3. Assess code quality and best practices
4. Run static analysis tools if needed
5. Provide actionable feedback

Be thorough but constructive.',
    '[
        {
            "name": "run_linter",
            "description": "Run linter on code",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {"type": "string", "description": "Code to lint"},
                    "language": {"type": "string", "description": "Programming language"}
                },
                "required": ["code", "language"]
            }
        },
        {
            "name": "check_security",
            "description": "Check code for common security vulnerabilities",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {"type": "string", "description": "Code to check"}
                },
                "required": ["code"]
            }
        }
    ]'::jsonb,
    '{"max_iterations": 5, "temperature": 0.3, "model": "claude-sonnet-4-20250514"}'::jsonb
);

-- Customer Support Agent
INSERT INTO public.agent_definitions (name, description, system_prompt, available_tools, config)
VALUES (
    'Customer Support Agent',
    'Handles customer inquiries with access to knowledge base and order systems',
    'You are a helpful customer support agent. When helping customers:
1. Search the knowledge base for relevant information
2. Check order status if needed
3. Escalate to human if issue is complex or sensitive
4. Always be empathetic and professional

Prioritize customer satisfaction.',
    '[
        {
            "name": "search_kb",
            "description": "Search knowledge base",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"}
                },
                "required": ["query"]
            }
        },
        {
            "name": "get_order_status",
            "description": "Get order status by ID",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string", "description": "Order ID"}
                },
                "required": ["order_id"]
            }
        },
        {
            "name": "escalate_to_human",
            "description": "Escalate issue to human agent",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {"type": "string", "description": "Reason for escalation"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high"], "description": "Priority level"}
                },
                "required": ["reason", "priority"]
            }
        }
    ]'::jsonb,
    '{"max_iterations": 8, "temperature": 0.5, "model": "claude-sonnet-4-20250514"}'::jsonb
);
