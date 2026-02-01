-- Skill Diagnosis Results
CREATE TABLE public.skill_diagnosis (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_answers JSONB NOT NULL,
    skill_scores JSONB NOT NULL,
    recommended_path VARCHAR(50) NOT NULL,
    completed_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.skill_diagnosis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own diagnosis"
ON public.skill_diagnosis
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnosis"
ON public.skill_diagnosis
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnosis"
ON public.skill_diagnosis
FOR UPDATE
USING (auth.uid() = user_id);
