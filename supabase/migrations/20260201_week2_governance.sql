-- Governance: LLM request logging
CREATE TABLE IF NOT EXISTS public.llm_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    endpoint VARCHAR(200) NOT NULL,
    model VARCHAR(100) NOT NULL,
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    cost DECIMAL(10, 6) NOT NULL,
    latency_ms INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL, -- success, error, rate_limited
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Governance: Content moderation logs
CREATE TABLE IF NOT EXISTS public.moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    content_type VARCHAR(50) NOT NULL, -- input, output
    content TEXT NOT NULL,
    flagged BOOLEAN DEFAULT false,
    categories JSONB, -- {hate: false, sexual: false, violence: false, ...}
    action_taken VARCHAR(50), -- allowed, blocked, warning
    created_at TIMESTAMP DEFAULT NOW()
);

-- Governance: User budgets and usage
CREATE TABLE IF NOT EXISTS public.user_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    monthly_budget DECIMAL(10, 2) DEFAULT 10.00,
    current_spend DECIMAL(10, 2) DEFAULT 0.00,
    budget_period_start TIMESTAMP DEFAULT NOW(),
    budget_exceeded BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Governance: Audit trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations (for Week 2 project)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    title VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages in conversations
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    tokens INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.llm_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own LLM requests" ON public.llm_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own moderation logs" ON public.moderation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own budget" ON public.user_budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own conversations" ON public.conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX idx_llm_requests_user_created ON public.llm_requests(user_id, created_at DESC);
CREATE INDEX idx_moderation_logs_user_created ON public.moderation_logs(user_id, created_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_audit_logs_user_created ON public.audit_logs(user_id, created_at DESC);
