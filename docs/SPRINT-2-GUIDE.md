# Sprint 2: RAG System - Implementation Guide

## Overview

Sprint 2 teaches learners how to build Retrieval-Augmented Generation (RAG) systems. They'll learn vector embeddings, document chunking, similarity search, and citation tracking.

## Learning Path

### Concept 1: Vector Embeddings & Similarity Search (60 min)
- What are vector embeddings
- Similarity metrics (cosine, euclidean, dot product)
- Popular embedding models (OpenAI, Voyage, Cohere)
- Vector databases (Pinecone, pgvector)
- Building semantic search
- Common pitfalls and best practices

### Concept 2: Chunking Strategies & Document Processing (60 min)
- Why chunking matters
- Trade-offs (chunk size, overlap)
- 5 chunking strategies (fixed-size, sentence-aware, paragraph, semantic, markdown-aware)
- Metadata enrichment
- Document processing pipeline
- Text extraction and cleaning
- Advanced techniques (hierarchical, sliding window, parent-child)

### Concept 3: Retrieval Pipelines & Citation Tracking (90 min)
- Complete RAG pipeline architecture
- Query enhancement (expansion, HyDE)
- Vector search and hybrid search
- Reranking techniques
- Context assembly
- LLM generation with citations
- Citation formatting (inline, footnote, clickable)
- Advanced techniques (compression, multi-hop, confidence scoring)
- Production considerations (caching, rate limiting, cost monitoring)

## Lab Exercises

### Lab 1: Document Chunking (30 min)
Implement optimal document chunking with overlap.

**Skills**: Text processing, chunking algorithms, edge case handling

**Test Cases**:
- Basic chunking with overlap
- Text shorter than chunk size
- Long text creates multiple chunks

### Lab 2: Vector Embeddings (30 min)
Generate and batch process vector embeddings.

**Skills**: Embedding generation, vector normalization, deterministic hashing

**Test Cases**:
- Embedding has correct dimensions (1536)
- Same input produces same embedding (deterministic)
- Batch processing works correctly

### Lab 3: Similarity Search (45 min)
Implement cosine similarity and semantic search.

**Skills**: Vector mathematics, similarity scoring, ranking algorithms

**Test Cases**:
- Identical vectors have similarity 1
- Orthogonal vectors have similarity 0
- Returns most similar chunks correctly

### Lab 4: RAG Pipeline (60 min)
Build complete retrieval-augmented generation pipeline.

**Skills**: Pipeline orchestration, context assembly, multi-step workflows

**Test Cases**:
- Returns top-3 sources
- Answer relates to retrieved content
- Full pipeline integration works

## Project: Document Q&A System

### Requirements
- Upload 3-5 PDF documents
- Extract and chunk text automatically
- Generate embeddings and store in pgvector
- Answer questions with citations
- Display confidence scores
- Support follow-up questions

### Tech Stack
- **PostgreSQL + pgvector**: Vector storage
- **pdf-parse**: Text extraction from PDFs
- **OpenAI**: Embeddings (text-embedding-3-small)
- **Claude API**: Answer generation
- **Next.js**: Full-stack application

### Success Criteria
- 8/10 test questions answered correctly
- All answers include valid citations with page numbers
- <5 second response time
- Clean, functional UI
- Proper error handling

### Estimated Time
3-5 hours

### Estimated Cost
- **Development**: $0.60 (embeddings + testing)
- **Production**: ~$6/month (embeddings + LLM + DB)

### Test Questions
1. What are the key terms mentioned in document X?
2. On which page is [specific topic] discussed?
3. Compare the approaches in documents X and Y
4. What does the document say about [specific detail]?
5. Find the section about [topic] and summarize it
6. Who is mentioned as responsible for [task]?
7. What is the deadline mentioned in document X?
8. How many times is [term] mentioned across all documents?
9. What evidence supports [claim] in the documents?
10. Synthesize information from multiple documents about [topic]

## Infrastructure Added

### Database Changes
- Added `Document` model for tracking uploaded files
- Added `DocumentChunk` model with embedding support
- Created migration: `20260131022352_add_rag_models`
- Added indexes for efficient queries

**Models**:
```prisma
model Document {
  id          String   @id @default(cuid())
  userId      String
  title       String
  fileName    String
  fileSize    Int
  contentType String
  createdAt   DateTime @default(now())

  user   User            @relation(...)
  chunks DocumentChunk[]

  @@index([userId, createdAt])
}

model DocumentChunk {
  id            String   @id @default(cuid())
  documentId    String
  content       String   @db.Text
  embedding     Unsupported("vector(1536)")?
  chunkIndex    Int
  pageNumber    Int?
  metadata      Json?
  createdAt     DateTime @default(now())

  document Document @relation(...)

  @@index([documentId, chunkIndex])
}
```

### New Utilities

**lib/vector-db.ts**: Vector operations
- `generateEmbedding(text)`: Create embeddings (stub for now)
- `searchSimilarChunks(query, limit)`: Semantic search
- `storeDocumentChunks(documentId, chunks)`: Store with embeddings
- `chunkText(text, chunkSize, overlap)`: Text chunking utility

## Testing Sprint 2

### Manual Testing Checklist
- [ ] Navigate to /learn/sprint-2
- [ ] Read all 3 concept pages
- [ ] Verify MDX rendering and code examples
- [ ] Check mermaid diagrams display
- [ ] Complete all 4 lab exercises
- [ ] Verify Monaco editor loads
- [ ] Test lab test cases
- [ ] Review project requirements

### Lab Testing
- [ ] Lab 1: Implement chunking, pass all test cases
- [ ] Lab 2: Generate embeddings, verify dimensions
- [ ] Lab 3: Calculate similarity, rank results
- [ ] Lab 4: Build full RAG pipeline, verify sources

### Content Quality
- [ ] All code examples are syntactically correct
- [ ] Concepts flow logically
- [ ] No broken links or references
- [ ] Consistent formatting throughout

## Common Issues

### pgvector Not Enabled
**Error**: `type "vector" does not exist`

**Solution**:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Run this in your PostgreSQL database or enable via Supabase/Neon dashboard.

**Workaround**: The current implementation stores embeddings as text. This works for development but should be migrated to proper vector type for production.

### Embedding API Costs
For production, cache embeddings aggressively:
- Store document embeddings in database
- Don't re-embed unchanged documents
- Use smaller embedding models for development
- Monitor API usage with logging

### Vector Search Performance
For >100k chunks, consider:
- Index the vector column: `CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops)`
- Use approximate search with HNSW indexes
- Upgrade to dedicated vector DB (Pinecone/Weaviate)
- Implement caching for frequent queries

### TypeScript Type Issues
If you encounter type errors with the `embedding` field:
- The field is defined as `Unsupported("vector(1536)")` in Prisma
- Use type casting: `data as any` when creating chunks
- Or omit the embedding field until pgvector is fully configured

## Deployment Notes

### Environment Variables
Required for Sprint 2 features:
```env
# Embeddings (choose one)
OPENAI_API_KEY="sk-..."           # OpenAI embeddings
VOYAGE_API_KEY="pa-..."           # Voyage AI embeddings

# Already configured
ANTHROPIC_API_KEY="..."           # Claude for generation
DATABASE_URL="postgresql://..."   # PostgreSQL with pgvector
```

### Database Setup
1. **Enable pgvector extension**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify installation**:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

### Performance Optimization
- **Embeddings**: Cache in database, batch API calls
- **Vector Search**: Add indexes for >10k chunks
- **Rate Limiting**: 10 queries/minute per user
- **Cost Monitoring**: Track API usage per user

## Extension Ideas

For advanced learners who complete the project:

1. **Multi-format Support**: DOCX, TXT files in addition to PDFs
2. **Hybrid Search**: Combine vector + keyword search
3. **Reranking**: Add separate reranking model
4. **Conversation Memory**: Multi-turn Q&A with context
5. **Document Comparison**: Side-by-side analysis
6. **Semantic Highlighting**: Show exact chunk that answers question
7. **PDF Export**: Generate report of Q&A session
8. **Admin Dashboard**: Monitor usage, costs, and quality

## Resources

### Documentation
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [LangChain RAG Tutorial](https://js.langchain.com/docs/use_cases/question_answering/)
- [Anthropic Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)

### Libraries
- [pdf-parse](https://www.npmjs.com/package/pdf-parse): PDF text extraction
- [mammoth](https://www.npmjs.com/package/mammoth): DOCX text extraction
- [openai](https://www.npmjs.com/package/openai): OpenAI API client
- [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk): Claude API

### Tools
- [Pinecone](https://www.pinecone.io/): Managed vector database
- [Weaviate](https://weaviate.io/): Open-source vector DB
- [Voyage AI](https://www.voyageai.com/): High-quality embeddings
- [Braintrust](https://www.braintrust.dev/): AI evaluation platform

## Next Steps

After completing Sprint 2, learners will be ready for:
- **Sprint 3**: AI Agents (multi-step task automation)
- **Sprint 4**: Multimodal AI (vision and beyond)
- **Sprint 5**: Production Deployment (scale and reliability)

Sprint 2 provides the foundation for building production RAG systems that power document Q&A, semantic search, and knowledge management applications.
