-- Insert Week 2
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
