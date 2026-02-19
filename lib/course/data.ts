export interface Lesson {
  slug: string
  title: string
  videoUrl: string | null
  description: string
}

export interface CourseModule {
  title: string
  lessons: Lesson[]
}

export const COURSE_MODULES: CourseModule[] = [
  {
    title: 'Getting Started',
    lessons: [
      {
        slug: 'course-overview',
        title: 'Course Overview',
        videoUrl: null,
        description:
          'Welcome to the AI Architect Accelerator. Learn what to expect over the next 12 weeks and how to get the most out of this program.',
      },
      {
        slug: 'setting-expectations',
        title: 'Setting Expectations',
        videoUrl: null,
        description:
          'What it means to be an AI Architect, the skills you will develop, and how this course maps to real-world production AI systems.',
      },
      {
        slug: 'your-learning-path',
        title: 'Your Learning Path',
        videoUrl: null,
        description:
          'How the curriculum is structured — from fundamentals through production deployment — and how to track your progress.',
      },
    ],
  },
  {
    title: 'Fundamentals',
    lessons: [
      {
        slug: 'llm-architecture',
        title: 'LLM Architecture',
        videoUrl: null,
        description:
          'How large language models work under the hood — transformer architecture, attention mechanisms, and why token prediction enables emergent capabilities.',
      },
      {
        slug: 'prompt-engineering-basics',
        title: 'Prompt Engineering Basics',
        videoUrl: null,
        description:
          'Core prompting techniques: zero-shot, few-shot, chain-of-thought, and system prompts. Learn to reliably steer model behavior.',
      },
      {
        slug: 'tokenization-context-windows',
        title: 'Tokenization & Context Windows',
        videoUrl: null,
        description:
          'How text becomes tokens, why context window size matters for cost and performance, and strategies for managing long inputs.',
      },
      {
        slug: 'api-integration',
        title: 'API Integration',
        videoUrl: null,
        description:
          'Connecting to LLM APIs (Claude, OpenAI), handling streaming responses, error handling, and building resilient API clients.',
      },
    ],
  },
  {
    title: 'RAG & Retrieval',
    lessons: [
      {
        slug: 'vector-embeddings',
        title: 'Vector Embeddings',
        videoUrl: null,
        description:
          'What embeddings are, how they encode semantic meaning, choosing embedding models, and measuring similarity with cosine distance.',
      },
      {
        slug: 'chunking-strategies',
        title: 'Chunking Strategies',
        videoUrl: null,
        description:
          'Breaking documents into retrievable chunks — fixed-size, semantic, recursive, and parent-child chunking approaches with trade-offs.',
      },
      {
        slug: 'rag-pipelines',
        title: 'RAG Pipelines',
        videoUrl: null,
        description:
          'End-to-end retrieval-augmented generation: ingestion, indexing, retrieval, reranking, and generation. Building pipelines that actually work.',
      },
      {
        slug: 'hybrid-search',
        title: 'Hybrid Search',
        videoUrl: null,
        description:
          'Combining keyword search (BM25) with vector search for better retrieval. Reciprocal rank fusion and when hybrid outperforms pure vector.',
      },
    ],
  },
  {
    title: 'Agents & Orchestration',
    lessons: [
      {
        slug: 'agent-architectures',
        title: 'Agent Architectures',
        videoUrl: null,
        description:
          'ReAct loops, tool use, planning strategies, and the spectrum from simple chains to autonomous agents. When to use each pattern.',
      },
      {
        slug: 'multi-agent-systems',
        title: 'Multi-Agent Systems',
        videoUrl: null,
        description:
          'Coordinating multiple specialized agents — supervisor patterns, delegation, conflict resolution, and shared memory architectures.',
      },
      {
        slug: 'tool-use',
        title: 'Tool Use & Function Calling',
        videoUrl: null,
        description:
          'Giving LLMs access to tools: API calls, database queries, code execution. Schema design, validation, and error recovery.',
      },
      {
        slug: 'reliability-patterns',
        title: 'Reliability Patterns',
        videoUrl: null,
        description:
          'Making agents production-ready: retries, fallbacks, circuit breakers, state checkpointing, and graceful degradation.',
      },
    ],
  },
  {
    title: 'Production & Launch',
    lessons: [
      {
        slug: 'monitoring-observability',
        title: 'Monitoring & Observability',
        videoUrl: null,
        description:
          'Tracing LLM calls, measuring latency and cost, detecting drift, and building dashboards that surface real problems.',
      },
      {
        slug: 'guardrails',
        title: 'Guardrails & Safety',
        videoUrl: null,
        description:
          'Input validation, output filtering, content moderation, PII detection, and building defense-in-depth for AI systems.',
      },
      {
        slug: 'evaluation',
        title: 'Evaluation & Testing',
        videoUrl: null,
        description:
          'LLM-as-judge evaluation, automated test suites, regression testing, and building evaluation frameworks that catch real failures.',
      },
      {
        slug: 'portfolio-building',
        title: 'Portfolio Building',
        videoUrl: null,
        description:
          'Turning your projects into a compelling portfolio. Architectural storytelling, technical writing, and presenting AI work to stakeholders.',
      },
    ],
  },
]

// Flatten all lessons for sequential navigation
export function getAllLessons(): Lesson[] {
  return COURSE_MODULES.flatMap((m) => m.lessons)
}

// Find a lesson by slug
export function getLessonBySlug(slug: string): Lesson | undefined {
  return getAllLessons().find((l) => l.slug === slug)
}

// Get lesson index (0-based) and total count
export function getLessonPosition(slug: string): {
  index: number
  total: number
} {
  const all = getAllLessons()
  const index = all.findIndex((l) => l.slug === slug)
  return { index, total: all.length }
}

// Get previous and next lesson slugs
export function getAdjacentLessons(slug: string): {
  prev: string | null
  next: string | null
} {
  const all = getAllLessons()
  const index = all.findIndex((l) => l.slug === slug)
  return {
    prev: index > 0 ? all[index - 1].slug : null,
    next: index < all.length - 1 ? all[index + 1].slug : null,
  }
}
