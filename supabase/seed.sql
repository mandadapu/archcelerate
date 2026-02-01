-- Week 1 Seed Data
INSERT INTO public.curriculum_weeks (week_number, title, description, objectives)
VALUES (
    1,
    'Foundations + Visual Builder Introduction',
    'Understand LLM fundamentals, master API integration, experience visual agent building, and build production-ready chat assistant',
    '["Understand LLM fundamentals and prompt engineering", "Master API integration patterns", "Experience visual agent building before coding", "Build production-ready chat assistant"]'::jsonb
);

-- Get week 1 ID for foreign keys
DO $$
DECLARE
    week1_id UUID;
    lab1_id UUID;
    project1_id UUID;
BEGIN
    SELECT id INTO week1_id FROM public.curriculum_weeks WHERE week_number = 1;

    -- Insert Concepts
    INSERT INTO public.concepts (week_id, order_index, slug, title, content_path, estimated_minutes)
    VALUES
        (week1_id, 1, 'llm-fundamentals', 'LLM Fundamentals', 'content/week1/llm-fundamentals.mdx', 45),
        (week1_id, 2, 'prompt-engineering', 'Prompt Engineering Mastery', 'content/week1/prompt-engineering.mdx', 60),
        (week1_id, 3, 'api-integration', 'API Integration Patterns', 'content/week1/api-integration.mdx', 45),
        (week1_id, 4, 'visual-builders', 'Visual Agent Builders', 'content/week1/visual-builders.mdx', 30);

    -- Insert Lab
    INSERT INTO public.labs (week_id, slug, title, description, exercises)
    VALUES (
        week1_id,
        'visual-to-code',
        'Visual Builder → Code Translation',
        'Build a Q&A chatbot visually, then rebuild in code to understand abstraction layers',
        '[
            {"number": 1, "title": "Build Q&A chatbot in Flowise", "type": "visual"},
            {"number": 2, "title": "Understand the flow", "type": "analysis"},
            {"number": 3, "title": "Export to code", "type": "export"},
            {"number": 4, "title": "Rebuild from scratch in code", "type": "coding"},
            {"number": 5, "title": "Compare approaches", "type": "reflection"}
        ]'::jsonb
    ) RETURNING id INTO lab1_id;

    -- Insert Project
    INSERT INTO public.projects (week_id, slug, title, description, requirements, success_criteria, estimated_hours)
    VALUES (
        week1_id,
        'chat-assistant-dual',
        'Chat Assistant (Dual Implementation)',
        'Build a conversational chat assistant with both visual and code implementations',
        '[
            "Build visual prototype in Flowise/LangFlow",
            "Build production code version in TypeScript/Python",
            "Implement conversation history management",
            "Add basic guardrails (input validation, content filtering)",
            "Basic logging of all LLM calls",
            "Write comparison writeup",
            "Deploy application with UI"
        ]'::jsonb,
        '[
            "Multi-turn conversations work",
            "Context window managed properly",
            "Basic guardrails prevent misuse",
            "Both versions functionally equivalent",
            "Deployed and accessible"
        ]'::jsonb,
        5
    ) RETURNING id INTO project1_id;
END $$;

-- Week 2 Seed Data
INSERT INTO public.curriculum_weeks (week_number, title, description, objectives)
VALUES (
    2,
    'Chat Assistant Production + Governance Foundations',
    'Build production-ready chat application with advanced features and implement governance from day one',
    '["Build production-ready chat application", "Implement governance (guardrails, observability)", "Deploy to production", "Understand why governance matters"]'::jsonb
);

-- Get week 2 ID
DO $$
DECLARE
    week2_id UUID;
BEGIN
    SELECT id INTO week2_id FROM public.curriculum_weeks WHERE week_number = 2;

    -- Insert Concepts
    INSERT INTO public.concepts (week_id, order_index, slug, title, content_path, estimated_minutes)
    VALUES
        (week2_id, 1, 'advanced-chat-architecture', 'Advanced Chat Architecture', 'content/week2/advanced-chat-architecture.mdx', 45),
        (week2_id, 2, 'production-chat-features', 'Production Chat Features', 'content/week2/production-chat-features.mdx', 60),
        (week2_id, 3, 'governance-foundations', 'Governance Foundations', 'content/week2/governance-foundations.mdx', 90);

    -- Insert Lab
    INSERT INTO public.labs (week_id, slug, title, description, exercises)
    VALUES (
        week2_id,
        'governance-implementation',
        'Governance Implementation',
        'Implement input validation, content filtering, logging, rate limiting, and cost tracking',
        '[
            {"number": 1, "title": "Implement input validation with edge cases", "type": "coding"},
            {"number": 2, "title": "Add content filtering with Anthropic moderation", "type": "coding"},
            {"number": 3, "title": "Build request logging system", "type": "coding"},
            {"number": 4, "title": "Create rate limiting middleware", "type": "coding"},
            {"number": 5, "title": "Build cost tracking dashboard", "type": "coding"}
        ]'::jsonb
    );

    -- Insert Project
    INSERT INTO public.projects (week_id, slug, title, description, requirements, success_criteria, estimated_hours)
    VALUES (
        week2_id,
        'production-chat-assistant',
        'Production Chat Assistant (Enhanced)',
        'Build production-ready chat application with full governance implementation',
        '[
            "Conversation persistence across sessions",
            "User authentication and authorization",
            "Input/output validation",
            "Content filtering",
            "Comprehensive logging",
            "Rate limiting (10 messages/minute)",
            "Cost tracking per user",
            "Deployed to cloud with monitoring",
            "Error handling and graceful degradation"
        ]'::jsonb,
        '[
            "Production-deployed with authentication",
            "Governance dashboard shows all interactions",
            "Rate limiting prevents abuse",
            "Graceful error handling when API fails",
            "<2s response time for 90% of requests"
        ]'::jsonb,
        5
    );
END $$;
