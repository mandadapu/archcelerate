-- Insert Week 3
INSERT INTO public.curriculum_weeks (week_number, title, description, objectives)
VALUES (
    3,
    'RAG Fundamentals + Memory Architecture',
    'Understand RAG architecture, master vector databases, and learn memory types in AI systems',
    '["Understand RAG architecture", "Master embedding models and vector databases", "Learn memory types (working, episodic, semantic, procedural)", "Build document ingestion and retrieval pipeline"]'::jsonb
);

-- Get week 3 ID
DO $$
DECLARE
    week3_id UUID;
BEGIN
    SELECT id INTO week3_id FROM public.curriculum_weeks WHERE week_number = 3;

    -- Insert Concepts
    INSERT INTO public.concepts (week_id, order_index, slug, title, content_path, estimated_minutes)
    VALUES
        (week3_id, 1, 'rag-fundamentals', 'RAG Fundamentals', 'content/week3/rag-fundamentals.mdx', 60),
        (week3_id, 2, 'vector-databases', 'Vector Databases & Indexing', 'content/week3/vector-databases.mdx', 60),
        (week3_id, 3, 'retrieval-optimization', 'Retrieval Optimization', 'content/week3/retrieval-optimization.mdx', 45),
        (week3_id, 4, 'memory-architecture', 'Memory Architecture Deep-Dive', 'content/week3/memory-architecture.mdx', 75);

    -- Insert Lab
    INSERT INTO public.labs (week_id, slug, title, description, exercises)
    VALUES (
        week3_id,
        'rag-pipeline',
        'RAG Pipeline Construction',
        'Build production-grade retrieval pipelines with optimal chunking and ranking',
        '[
            {"number": 1, "title": "Chunk documents with 3 strategies, compare", "type": "coding"},
            {"number": 2, "title": "Generate embeddings and store in pgvector", "type": "coding"},
            {"number": 3, "title": "Implement semantic search with ranking", "type": "coding"},
            {"number": 4, "title": "Build hybrid search (vector + keyword)", "type": "coding"},
            {"number": 5, "title": "Add metadata filtering", "type": "coding"},
            {"number": 6, "title": "Implement query transformation", "type": "coding"}
        ]'::jsonb
    );

    -- Insert Project
    INSERT INTO public.projects (week_id, slug, title, description, requirements, success_criteria, estimated_hours)
    VALUES (
        week3_id,
        'document-qa-foundation',
        'Document Q&A System (Foundation)',
        'Build document ingestion pipeline and basic retrieval system',
        '[
            "Document ingestion pipeline (upload PDFs, process, embed)",
            "Vector database integration (pgvector)",
            "Basic retrieval working",
            "Simple Q&A interface",
            "Initial deployment"
        ]'::jsonb,
        '[
            "3-5 documents successfully ingested",
            "Semantic search returns relevant chunks",
            "Basic Q&A working (no citations yet)",
            "Foundation ready for Week 4 enhancements"
        ]'::jsonb,
        4
    );
END $$;
