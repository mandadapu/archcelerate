import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Week 6: Advanced RAG at Enterprise Scale
 * Optimizing the "Knowledge Loop" for Precision and Speed
 *
 * Focus: Moving from "it works on my machine" to "it works for 10,000 users
 * with enterprise-grade precision" - critical for regulated industries and
 * real-time analytics.
 */

const week6Data = {
  weekNumber: 6,
  title: 'Advanced RAG (The Optimizer)',
  description: 'Master enterprise-grade retrieval systems with hybrid search, re-ranking, and query optimization for high-precision, low-latency RAG at scale',
  objectives: [
    'Implement hybrid retrieval combining semantic and keyword search for precision',
    'Deploy re-ranking models to improve top-K accuracy by 20%+',
    'Apply query transformation patterns (Multi-Query, HyDE, Decomposition)',
    'Optimize context windows and prevent "Lost in the Middle" degradation',
    'Build production RAG with sub-200ms latency and enterprise hardening'
  ],
  concepts: [
    {
      slug: 'hybrid-retrieval-reranking',
      title: 'Hybrid Retrieval & Re-Ranking',
      minutes: 50,
      description: 'Combine semantic (vector) and keyword (BM25) search with cross-encoder re-ranking for enterprise precision'
    },
    {
      slug: 'query-transformation-patterns',
      title: 'Query Transformation Patterns',
      minutes: 45,
      description: 'Multi-Query expansion, Decomposition, and HyDE (Hypothetical Document Embeddings) for robust retrieval'
    },
    {
      slug: 'context-window-optimization',
      title: 'Context Window Management & Optimization',
      minutes: 40,
      description: 'Long-context vs RAG tradeoffs, context pruning, and preventing "Lost in the Middle" degradation'
    },
    {
      slug: 'enterprise-rag-hardening',
      title: 'Enterprise RAG Hardening & Evaluation',
      minutes: 55,
      description: 'Production metrics (Recall@10, MRR, TTFT, QPS), semantic caching, and HNSW indexing for scale'
    },
    {
      slug: 'rag-production-failures',
      title: 'RAG Production Failure Patterns',
      minutes: 45,
      description: 'Real-world case study: diagnosing and fixing context poisoning, stale retrieval, and latency spikes in production RAG systems'
    }
  ],
  lab: {
    slug: 'medical-records-navigator',
    title: 'The Precision Retrieval Challenge',
    description: 'Act as AI Architect for a Clinical Search tool - prove the value of Parent-Document Retrieval and Hybrid Search through side-by-side comparison',
    exercises: [
      {
        number: 1,
        title: 'Setup: Index 5,000 pages of simulated clinical notes (PDFs)',
        type: 'setup',
        estimatedMinutes: 30,
        details: 'Download dataset, extract text, prepare for chunking'
      },
      {
        number: 2,
        title: 'Phase 1: Build "Naive" RAG baseline (fixed 200-token chunks, vector-only)',
        type: 'coding',
        estimatedMinutes: 40,
        details: 'Chunk documents, embed, store in pgvector, implement basic retrieval'
      },
      {
        number: 3,
        title: 'Test Naive RAG: Query "What was patient HbA1c in June 2024?"',
        type: 'testing',
        estimatedMinutes: 20,
        details: 'Observe failure: LLM gets HbA1c value but misses date (different chunk)'
      },
      {
        number: 4,
        title: 'Measure Naive baseline: Context Relevancy, Faithfulness, Latency',
        type: 'evaluation',
        estimatedMinutes: 25,
        details: 'Run 10 test queries, fill comparison table'
      },
      {
        number: 5,
        title: 'Phase 2: Implement Parent-Document Retrieval (small-to-big)',
        type: 'coding',
        estimatedMinutes: 50,
        details: 'Store parent_id in child metadata, fetch full notes from Redis'
      },
      {
        number: 6,
        title: 'Add Hybrid Search (BM25 + Vector) for medical codes',
        type: 'implementation',
        estimatedMinutes: 45,
        details: 'Combine pg_trgm (keyword) with pgvector (semantic), tune weights'
      },
      {
        number: 7,
        title: 'Deploy Re-Ranker (Cohere or BGE) for top-50 → top-5',
        type: 'coding',
        estimatedMinutes: 40,
        details: 'Add cross-encoder re-ranking, measure MRR improvement'
      },
      {
        number: 8,
        title: 'Test Advanced RAG: Same query with full clinical context',
        type: 'testing',
        estimatedMinutes: 20,
        details: 'Verify LLM now has date, doctor, and clinical context from parent'
      },
      {
        number: 9,
        title: 'Measure Advanced metrics: Compare Context Relevancy (45% → 85%)',
        type: 'evaluation',
        estimatedMinutes: 30,
        details: 'Complete comparison table, calculate "context tax" (cost vs precision)'
      },
      {
        number: 10,
        title: 'Architect\'s Report: Document tradeoffs and recommendations',
        type: 'documentation',
        estimatedMinutes: 25,
        details: 'Write runbook explaining when to use each retrieval strategy'
      }
    ]
  },
  project: {
    slug: 'enterprise-rag-system',
    title: 'Production RAG System for Regulated Industry',
    description: 'Build a HIPAA-grade RAG system with hybrid retrieval, re-ranking, semantic caching, and enterprise evaluation metrics',
    requirements: [
      'Hybrid Search: Combine pgvector (semantic) + pg_trgm or ElasticSearch (BM25)',
      'Re-Ranking: Cohere Rerank API or BGE-Reranker model for top-50 → top-5',
      'Query Transformation: Implement Multi-Query, Decomposition, and HyDE',
      'Parent-Document Retrieval: Retrieve small chunks, return surrounding context',
      'Context Pruning: Remove redundant information before LLM call',
      'Semantic Caching: Redis/GPTCache with cosine similarity threshold 0.95',
      'HNSW Indexing: Configure for <100ms vector search at 10K QPS',
      'Evaluation Suite: Measure Recall@10, MRR, Precision@5, TTFT, QPS',
      'Audit Logging: Track all retrievals for compliance (GDPR/HIPAA)',
      'Load Testing: 1,000 concurrent users with <200ms p95 latency',
      'Documentation: Runbook for re-indexing, cache invalidation, monitoring'
    ],
    successCriteria: [
      'Hybrid search improves Recall@10 by 15%+ vs vector-only',
      'Re-ranking improves MRR (Mean Reciprocal Rank) by 20%+',
      'Semantic caching reduces TTFT by 80% for repeated queries',
      'Query transformation handles complex multi-part questions correctly',
      'Parent-document retrieval maintains clinical context accuracy',
      'System handles 10K QPS with <100ms vector search latency',
      'p95 latency stays under 200ms for hybrid search + re-rank',
      'Cache hit rate >40% after 1 week of production traffic',
      'Evaluation metrics tracked in dashboard (Grafana/DataDog)',
      'Zero data leaks: Audit logs show proper tenant isolation',
      'Passes load test: 1K concurrent users without degradation'
    ],
    estimatedHours: 14
  }
}

async function main() {
  console.log('🌱 Seeding Week 6: Advanced RAG (The Optimizer)')

  // Upsert curriculum week
  const curriculumWeek = await prisma.curriculumWeek.upsert({
    where: { weekNumber: week6Data.weekNumber },
    create: {
      weekNumber: week6Data.weekNumber,
      title: week6Data.title,
      description: week6Data.description,
      objectives: week6Data.objectives,
      active: true
    },
    update: {
      title: week6Data.title,
      description: week6Data.description,
      objectives: week6Data.objectives
    }
  })

  // Delete existing content
  await prisma.concept.deleteMany({ where: { weekId: curriculumWeek.id } })
  await prisma.lab.deleteMany({ where: { weekId: curriculumWeek.id } })
  await prisma.weekProject.deleteMany({ where: { weekId: curriculumWeek.id } })

  // Create concepts
  for (let i = 0; i < week6Data.concepts.length; i++) {
    const concept = week6Data.concepts[i]
    await prisma.concept.create({
      data: {
        weekId: curriculumWeek.id,
        orderIndex: i + 1,
        slug: concept.slug,
        title: concept.title,
        contentPath: `content/week${week6Data.weekNumber}/${concept.slug}.mdx`,
        estimatedMinutes: concept.minutes
      }
    })
  }
  console.log(`  ✓ Created ${week6Data.concepts.length} concepts`)

  // Create lab
  await prisma.lab.create({
    data: {
      weekId: curriculumWeek.id,
      slug: week6Data.lab.slug,
      title: week6Data.lab.title,
      description: week6Data.lab.description,
      exercises: week6Data.lab.exercises
    }
  })
  console.log(`  ✓ Created lab`)

  // Create project
  await prisma.weekProject.create({
    data: {
      weekId: curriculumWeek.id,
      slug: week6Data.project.slug,
      title: week6Data.project.title,
      description: week6Data.project.description,
      requirements: week6Data.project.requirements,
      successCriteria: week6Data.project.successCriteria,
      estimatedHours: week6Data.project.estimatedHours
    }
  })
  console.log(`  ✓ Created project`)

  console.log('✅ Week 6 seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding Week 6:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
