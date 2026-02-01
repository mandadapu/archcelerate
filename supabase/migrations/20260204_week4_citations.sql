-- Citations tracking for RAG responses
CREATE TABLE IF NOT EXISTS public.rag_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID NOT NULL REFERENCES public.rag_queries(id) ON DELETE CASCADE,
    chunk_id UUID NOT NULL REFERENCES public.document_chunks(id),
    document_id UUID NOT NULL REFERENCES public.documents(id),
    page_number INTEGER,
    relevance_score DECIMAL(4, 3) NOT NULL,
    used_in_response BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_relevance_score CHECK (relevance_score >= 0 AND relevance_score <= 1)
);

-- Enable RLS
ALTER TABLE public.rag_citations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read citations for their queries" ON public.rag_citations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rag_queries
            WHERE rag_queries.id = rag_citations.query_id
            AND rag_queries.user_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX idx_citations_query ON public.rag_citations(query_id);
CREATE INDEX idx_citations_document ON public.rag_citations(document_id);
CREATE INDEX idx_citations_relevance ON public.rag_citations(relevance_score DESC);
