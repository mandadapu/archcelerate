-- Week 1 content structure
CREATE TABLE IF NOT EXISTS public.curriculum_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INTEGER NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    objectives JSONB NOT NULL, -- array of learning objectives
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Concepts within weeks
CREATE TABLE IF NOT EXISTS public.concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID REFERENCES public.curriculum_weeks(id),
    order_index INTEGER NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    content_path VARCHAR(500) NOT NULL, -- path to MDX file
    estimated_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(week_id, order_index)
);

-- Labs
CREATE TABLE IF NOT EXISTS public.labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID REFERENCES public.curriculum_weeks(id),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    exercises JSONB NOT NULL, -- array of exercise descriptions
    created_at TIMESTAMP DEFAULT NOW()
);

-- Labs submissions
CREATE TABLE IF NOT EXISTS public.lab_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    lab_id UUID REFERENCES public.labs(id),
    exercise_number INTEGER NOT NULL,
    submission_data JSONB NOT NULL, -- varies by exercise type
    completed BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lab_id, exercise_number)
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID REFERENCES public.curriculum_weeks(id),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    requirements JSONB NOT NULL, -- array of requirements
    success_criteria JSONB NOT NULL,
    estimated_hours INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project submissions
CREATE TABLE IF NOT EXISTS public.project_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    project_id UUID REFERENCES public.projects(id),
    github_url VARCHAR(500),
    deployed_url VARCHAR(500),
    writeup_content TEXT, -- for comparison writeup
    status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, reviewed
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User progress tracking for Week 1
CREATE TABLE IF NOT EXISTS public.user_week_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    week_id UUID REFERENCES public.curriculum_weeks(id),
    concepts_completed INTEGER DEFAULT 0,
    concepts_total INTEGER NOT NULL,
    lab_completed BOOLEAN DEFAULT false,
    project_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE(user_id, week_id)
);

-- Enable RLS
ALTER TABLE public.curriculum_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_week_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for curriculum, user-owned for submissions)
CREATE POLICY "Anyone can read curriculum weeks" ON public.curriculum_weeks
    FOR SELECT USING (active = true);

CREATE POLICY "Anyone can read concepts" ON public.concepts
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read labs" ON public.labs
    FOR SELECT USING (true);

CREATE POLICY "Users can read their own lab submissions" ON public.lab_submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lab submissions" ON public.lab_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab submissions" ON public.lab_submissions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read projects" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "Users can read their own project submissions" ON public.project_submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project submissions" ON public.project_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project submissions" ON public.project_submissions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own week progress" ON public.user_week_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own week progress" ON public.user_week_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own week progress" ON public.user_week_progress
    FOR UPDATE USING (auth.uid() = user_id);
