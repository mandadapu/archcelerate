-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    experience_years INT,
    target_role VARCHAR(100),
    onboarded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own data"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Learning Events table
CREATE TABLE public.learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    occurred_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own events"
ON public.learning_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
ON public.learning_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_events_user_time ON public.learning_events(user_id, occurred_at DESC);
CREATE INDEX idx_events_type ON public.learning_events(event_type, occurred_at DESC);
