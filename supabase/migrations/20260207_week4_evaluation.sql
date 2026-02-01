-- Evaluation datasets (ground truth Q&A pairs)
CREATE TABLE IF NOT EXISTS public.rag_eval_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Evaluation questions with ground truth answers
CREATE TABLE IF NOT EXISTS public.rag_eval_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID NOT NULL REFERENCES public.rag_eval_datasets(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    ground_truth_answer TEXT NOT NULL,
    relevant_document_ids UUID[], -- Expected source documents
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT question_not_empty CHECK (LENGTH(TRIM(question)) > 0),
    CONSTRAINT answer_not_empty CHECK (LENGTH(TRIM(ground_truth_answer)) > 0)
);

-- Evaluation results
CREATE TABLE IF NOT EXISTS public.rag_eval_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID NOT NULL REFERENCES public.rag_eval_datasets(id),
    question_id UUID NOT NULL REFERENCES public.rag_eval_questions(id),
    generated_answer TEXT NOT NULL,
    retrieved_chunks JSONB,
    metrics JSONB NOT NULL, -- {faithfulness: 0.9, relevance: 0.8, coverage: 0.7}
    passed BOOLEAN NOT NULL,
    evaluated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rag_eval_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_eval_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_eval_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their eval datasets" ON public.rag_eval_datasets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage questions in their datasets" ON public.rag_eval_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rag_eval_datasets
            WHERE rag_eval_datasets.id = rag_eval_questions.dataset_id
            AND rag_eval_datasets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can read results for their datasets" ON public.rag_eval_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rag_eval_datasets
            WHERE rag_eval_datasets.id = rag_eval_results.dataset_id
            AND rag_eval_datasets.user_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX idx_eval_questions_dataset ON public.rag_eval_questions(dataset_id);
CREATE INDEX idx_eval_results_dataset ON public.rag_eval_results(dataset_id);
CREATE INDEX idx_eval_results_passed ON public.rag_eval_results(passed);
CREATE INDEX idx_eval_results_evaluated_at ON public.rag_eval_results(evaluated_at DESC);
