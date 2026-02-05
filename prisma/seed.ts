import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Comprehensive seed data for all 12 weeks
const weekData = [
  {
    weekNumber: 1,
    title: 'LLM Fundamentals (The Engine)',
    description: 'Master foundation LLM capabilities: tokens, models, prompting, API integration, and production-ready patterns',
    objectives: [
      'Understand LLM fundamentals and capabilities',
      'Master API integration patterns',
      'Experience visual agent building with Wordware',
      'Build production-ready chat with governance',
      'Implement production patterns'
    ],
    concepts: [
      { slug: 'llm-fundamentals', title: 'LLM Fundamentals', minutes: 30 },
      { slug: 'prompt-engineering', title: 'Prompt Engineering Patterns', minutes: 40 },
      { slug: 'api-integration', title: 'API Integration Best Practices', minutes: 35 },
      { slug: 'architecture-decisions', title: 'Architecture Decisions for AI Apps', minutes: 30 },
      { slug: 'visual-builder-intro', title: 'Visual Builder Introduction (Wordware)', minutes: 25 },
      { slug: 'production-readiness', title: 'Production Readiness Checklist', minutes: 30 }
    ],
    lab: {
      slug: 'first-llm-app',
      title: 'Build Your First LLM Application',
      description: 'Create a complete LLM application from scratch with proper error handling and production patterns',
      exercises: [
        { number: 1, title: 'Set up development environment', type: 'setup' },
        { number: 2, title: 'Implement basic LLM chat', type: 'coding' },
        { number: 3, title: 'Add streaming responses', type: 'coding' },
        { number: 4, title: 'Implement error handling', type: 'implementation' },
        { number: 5, title: 'Add rate limiting', type: 'coding' }
      ]
    },
    project: {
      slug: 'chat-assistant',
      title: 'Production Chat Assistant',
      description: 'Build a production-ready chat assistant with proper governance, error handling, and observability',
      requirements: [
        'Streaming chat interface',
        'API integration with error handling',
        'Rate limiting and cost controls',
        'Input validation and sanitization',
        'Conversation history management',
        'Production deployment'
      ],
      successCriteria: [
        'Chat interface is responsive and works smoothly',
        'Errors are handled gracefully with user feedback',
        'Rate limits prevent abuse',
        'All inputs are validated',
        'Conversation history persists correctly',
        'Application is deployed and accessible'
      ],
      hours: 6
    }
  },
  {
    weekNumber: 2,
    title: 'AI Safety & Governance (The Guardrails)',
    description: 'Build production AI with proper governance, fairness, compliance, and safety controls',
    objectives: [
      'Implement AI governance and content moderation',
      'Build fair, transparent, and explainable AI systems',
      'Apply compliance patterns for regulated industries',
      'Test and validate AI systems with NFRs'
    ],
    concepts: [
      { slug: 'governance-frameworks', title: 'AI Governance Frameworks', minutes: 45 },
      { slug: 'governance-foundations', title: 'AI Governance Foundations', minutes: 35 },
      { slug: 'responsible-ai', title: 'Responsible AI: Fairness, Transparency & Explainability', minutes: 60 },
      { slug: 'compliance-patterns', title: 'Domain Compliance Patterns', minutes: 50 },
      { slug: 'ai-testing-nfrs', title: 'AI Testing & Non-Functional Requirements', minutes: 55 }
    ],
    lab: {
      slug: 'governance-compliance-lab',
      title: 'Governance & Compliance Lab',
      description: 'Implement governance controls, fairness checks, and compliance patterns in a production AI system',
      exercises: [
        { number: 1, title: 'Implement content moderation with OpenAI Moderations API', type: 'coding' },
        { number: 2, title: 'Add fairness evaluation for model outputs', type: 'implementation' },
        { number: 3, title: 'Build compliance audit logging', type: 'coding' },
        { number: 4, title: 'Create explainability dashboard', type: 'implementation' },
        { number: 5, title: 'Test with adversarial inputs', type: 'testing' }
      ]
    },
    project: {
      slug: 'compliant-ai-system',
      title: 'Production AI System with Full Governance',
      description: 'Build a production-ready AI application with comprehensive governance, fairness checks, compliance controls, and explainability',
      requirements: [
        'Content moderation for inputs and outputs',
        'Fairness evaluation across demographic groups',
        'Compliance audit logging (GDPR, HIPAA, or SOC2)',
        'Explainability features for model decisions',
        'Bias detection and mitigation',
        'Rate limiting and cost controls',
        'Full test coverage including adversarial testing',
        'Transparency dashboard for stakeholders'
      ],
      successCriteria: [
        'All harmful content is filtered before processing',
        'Fairness metrics show <10% disparity across groups',
        'Complete audit trail for all AI decisions',
        'Users can understand why AI made specific decisions',
        'System passes adversarial testing',
        'Compliance requirements are met',
        'Cost controls prevent budget overruns',
        'Full documentation of governance controls'
      ],
      hours: 12
    }
  },
  {
    weekNumber: 3,
    title: 'RAG & Memory Fundamentals (The Knowledge Base)',
    description: 'Build retrieval-augmented generation systems with vector databases',
    objectives: ['Implement vector search', 'Build RAG pipelines', 'Manage conversation memory'],
    concepts: [
      { slug: 'rag-memory-fundamentals', title: 'RAG + Memory Fundamentals', minutes: 40 },
      { slug: 'vector-embeddings', title: 'Vector Embeddings & Similarity Search', minutes: 35 },
      { slug: 'rag-pipelines', title: 'Building RAG Pipelines', minutes: 40 },
      { slug: 'production-rag-architecture', title: 'Production RAG Architecture', minutes: 50 },
      { slug: 'memory-systems', title: 'Conversation Memory Systems', minutes: 35 }
    ],
    lab: {
      slug: 'build-rag-system',
      title: 'Build a RAG-Powered Q&A System',
      description: 'Create a question-answering system using vector search and document retrieval',
      exercises: [
        { number: 1, title: 'Set up vector database (Pinecone/Chroma)', type: 'setup' },
        { number: 2, title: 'Implement document chunking and embedding', type: 'coding' },
        { number: 3, title: 'Build retrieval pipeline', type: 'implementation' },
        { number: 4, title: 'Add re-ranking and filtering', type: 'coding' }
      ]
    },
    project: {
      slug: 'document-qa-system',
      title: 'Document Q&A System',
      description: 'Build a production RAG system that can answer questions from uploaded documents',
      requirements: [
        'Document upload and processing',
        'Vector embedding and storage',
        'Semantic search implementation',
        'Context-aware answer generation',
        'Citation and source tracking'
      ],
      successCriteria: [
        'Documents are chunked and embedded correctly',
        'Retrieval returns relevant passages',
        'Answers include source citations',
        'System handles multi-document queries'
      ],
      hours: 8
    }
  },
  {
    weekNumber: 4,
    title: 'Structured Intelligence & API Integration (The Interface)',
    description: 'Transform LLMs from chatbots to system components with structured output and function calling',
    objectives: [
      'Master structured output and JSON mode',
      'Design and implement function calling patterns',
      'Build schema-driven tool specifications',
      'Validate LLM outputs with type safety'
    ],
    concepts: [
      { slug: 'structured-output', title: 'Structured Output', minutes: 40 },
      { slug: 'function-calling', title: 'Function Calling', minutes: 45 },
      { slug: 'schema-design', title: 'Schema Design', minutes: 45 }
    ],
    lab: {
      slug: 'support-ticket-router',
      title: 'Support Ticket Router',
      description: 'Build an enterprise support system that extracts structured data from messy emails and orchestrates actions with function calling',
      exercises: [
        { number: 1, title: 'Extract ticket data with structured output', type: 'coding' },
        { number: 2, title: 'Implement sentiment analysis and categorization', type: 'implementation' },
        { number: 3, title: 'Add function calling for inventory lookup', type: 'coding' },
        { number: 4, title: 'Orchestrate multi-tool workflows (inventory + refund)', type: 'coding' },
        { number: 5, title: 'Validate all inputs with Zod schemas', type: 'implementation' }
      ]
    },
    project: {
      slug: 'enterprise-orchestrator',
      title: 'Enterprise Support Orchestrator',
      description: 'Build a complete customer support system that routes tickets, checks inventory, processes refunds, and notifies customers - all orchestrated by an LLM',
      requirements: [
        'Structured ticket extraction (sentiment, category, urgency, product_id)',
        'Function calling for inventory_lookup, process_refund, notify_customer',
        'Zod validation for all tool inputs (prevent hallucinated arguments)',
        'Multi-step orchestration (check inventory before refund)',
        'Error handling for failed tool executions',
        'Schema-first design with TypeScript types'
      ],
      successCriteria: [
        'Extracts structured data from 90%+ of test emails',
        'Never calls tools with invalid arguments (Zod validation)',
        'Correctly orchestrates multi-step workflows',
        'Handles edge cases (out of stock, invalid product IDs)',
        'Type-safe throughout (TypeScript + Zod)'
      ],
      hours: 8
    }
  },
  {
    weekNumber: 5,
    title: 'Agentic Frameworks & Multi-Agent Orchestration (The Logic)',
    description: 'Build systems that reason, plan, and execute using multi-agent architectures and reliability patterns',
    objectives: [
      'Master the three core agent architectures (Sequential, Supervisor, Collaborative)',
      'Implement reliability patterns (Reflection, Planning, Human-in-the-Loop)',
      'Choose the right framework (LangGraph, CrewAI, AutoGen) based on requirements',
      'Build production-grade multi-agent systems with state management',
      'Implement error routing and self-healing workflows',
      'Use the Model Context Protocol (MCP) for unified tool integration',
      'Achieve "zero-waste" execution with cycle detection and token trimming',
      'Deploy multi-agent systems with checkpointing and observability'
    ],
    concepts: [
      { slug: 'agent-architectures', title: 'Agent Architectures', minutes: 45 },
      { slug: 'reliability-patterns', title: 'Reliability Patterns', minutes: 50 },
      { slug: 'framework-comparison', title: 'Framework Comparison', minutes: 40 }
    ],
    lab: {
      slug: 'newsletter-team',
      title: 'Auto-Research & Newsletter Team',
      description: 'Build a multi-agent newsroom with Hunter, Fact-Checker, and Writer agents using Supervisor pattern with state management, error routing, and self-healing',
      exercises: [
        { number: 1, title: 'Define state schema with atomic updates', type: 'setup' },
        { number: 2, title: 'Implement the Hunter agent with feedback handling', type: 'coding' },
        { number: 3, title: 'Build Fact-Checker with quality scoring', type: 'coding' },
        { number: 4, title: 'Create Writer with token-optimized input', type: 'coding' },
        { number: 5, title: 'Implement Supervisor with error routing table', type: 'implementation' },
        { number: 6, title: 'Add checkpointing and state persistence', type: 'coding' },
        { number: 7, title: 'Test self-healing workflow end-to-end', type: 'testing' }
      ]
    },
    project: {
      slug: 'full-stack-dev-team',
      title: 'Multi-Agent Full-Stack Development Team',
      description: 'Build a supervisor-orchestrated team of specialist agents (Frontend, Backend, Database) that collaboratively develop full-stack applications',
      requirements: [
        'Implement Supervisor pattern with Manager + 3 Specialists (Frontend, Backend, Database)',
        'State schema with task planning, execution tracking, and integration',
        'Error routing table with transient/logic/budget/input error categories',
        'Self-healing prompts when specialists produce incompatible outputs',
        'Reflection pattern on each specialist output before integration',
        'Checkpointing to database after each specialist completes their work',
        'Token trimming (specialists only receive relevant context, not full history)',
        'Cycle detection with max 5 iterations across all specialists',
        'Human-in-the-loop approval before deploying generated code',
        'Cost tracking with $0.50 budget limit',
        'Complete audit trail of all agent decisions and routing',
        'MCP integration for external tools (GitHub, database, deployment)'
      ],
      successCriteria: [
        'Manager correctly routes tasks to appropriate specialists',
        'Specialists produce compatible outputs (e.g., Frontend calls Backend APIs correctly)',
        'Self-healing: Manager detects integration issues and re-assigns work with feedback',
        'Stays under $0.50 budget and 5 iterations',
        'Reflection catches errors before integration (> 80% accuracy)',
        'Checkpoints allow resume from any specialist failure',
        'Token usage reduced by 60%+ through proper state management',
        'No infinite loops (cycle detection working)',
        'Human approval required for final deployment',
        'Full audit trail shows decision rationale at each routing point'
      ],
      hours: 12
    }
  },
  {
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
      { slug: 'hybrid-retrieval-reranking', title: 'Hybrid Search & Re-Ranking', minutes: 50 },
      { slug: 'query-transformation-patterns', title: 'Query Transformation', minutes: 45 },
      { slug: 'context-window-optimization', title: 'Context Optimization', minutes: 40 },
      { slug: 'enterprise-rag-hardening', title: 'Enterprise RAG Hardening', minutes: 55 },
      { slug: 'observability-basics', title: 'AI Observability', minutes: 30 },
      { slug: 'monitoring-ai-systems', title: 'LLM Monitoring', minutes: 35 },
      { slug: 'performance-optimization', title: 'Performance & Caching', minutes: 40 },
      { slug: 'production-deployment', title: 'Production Deployment', minutes: 35 }
    ],
    lab: {
      slug: 'medical-records-navigator',
      title: 'Lab: The Precision Retrieval Challenge',
      description: 'Role: AI Architect for a Clinical Search tool. Core Objective: Prove the quantitative value of advanced retrieval techniques over basic vector search through side-by-side architectural comparison. Key Techniques: Parent-Document Retrieval (balance granular search with full-context retrieval) and Hybrid Search (integrate semantic vector + keyword BM25 for clinical precision). Success Metrics: Hit Rate (Recall@K) to verify correct clinical documents in top results, and MRR (Mean Reciprocal Rank) to evaluate ranking quality. 10 specialized exercises.',
      exercises: [
        { number: 1, title: 'Setup: Index 5,000 pages of simulated clinical notes (PDFs)', type: 'setup' },
        { number: 2, title: 'Phase 1: Build "Naive" RAG baseline (fixed 200-token chunks, vector-only)', type: 'coding' },
        { number: 3, title: 'Test Naive RAG: Query "What was patient HbA1c in June 2024?"', type: 'testing' },
        { number: 4, title: 'Measure Naive baseline: Context Relevancy, Faithfulness, Latency', type: 'evaluation' },
        { number: 5, title: 'Phase 2: Implement Parent-Document Retrieval (small-to-big)', type: 'coding' },
        { number: 6, title: 'Add Hybrid Search (BM25 + Vector) for medical codes', type: 'implementation' },
        { number: 7, title: 'Deploy Re-Ranker (Cohere or BGE) for top-50 → top-5', type: 'coding' },
        { number: 8, title: 'Test Advanced RAG: Same query with full clinical context', type: 'testing' },
        { number: 9, title: 'Measure Advanced metrics: Compare Context Relevancy (45% → 85%)', type: 'evaluation' },
        { number: 10, title: 'Architect\'s Report: Document tradeoffs and recommendations', type: 'documentation' }
      ]
    },
    project: {
      slug: 'enterprise-rag-system',
      title: 'Project: Production RAG System for Regulated Industry',
      description: 'Build a full production system: HIPAA-grade RAG with hybrid retrieval, re-ranking, semantic caching, and enterprise evaluation metrics',
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
      hours: 14
    }
  },
  {
    weekNumber: 7,
    title: 'Observability & Production (The Reliability)',
    description: 'Harden AI systems for production with observability, guardrails, and automated evaluation',
    objectives: [
      'Implement the three pillars of AI observability (Traces, Evaluations, Unit Economics)',
      'Build input and output guardrails to prevent prompt injection and hallucinations',
      'Deploy LLM-as-a-Judge for automated quality assurance',
      'Set up cost tracking and circuit breakers',
      'Implement semantic versioning for AI systems',
      'Create golden datasets for regression testing'
    ],
    concepts: [
      { slug: 'observability-pillars', title: 'Observability Pillars', minutes: 50 },
      { slug: 'guardrails', title: 'Guardrails', minutes: 45 },
      { slug: 'llm-as-judge', title: 'LLM-as-a-Judge', minutes: 45 }
    ],
    lab: {
      slug: 'production-dashboard',
      title: 'Production Dashboard - Hardening for 24/7 Operations',
      description: 'Transform the Week 4 Support Ticket Router into a production-ready system with observability, guardrails, and automated evaluation',
      exercises: [
        { number: 1, title: 'Implement OpenTelemetry tracing', type: 'coding' },
        { number: 2, title: 'Add input and output guardrails', type: 'coding' },
        { number: 3, title: 'Build automated evaluation pipeline', type: 'implementation' },
        { number: 4, title: 'Set up cost tracking and circuit breakers', type: 'coding' },
        { number: 5, title: 'Pass capstone stress-test suite', type: 'testing' }
      ]
    },
    project: {
      slug: 'capstone-production-pilot',
      title: 'Capstone: The Production Pilot',
      description: 'Build an Automated Compliance & Patient Support Agent with zero hallucinations and strict audit trails',
      requirements: [
        'Advanced RAG Pipeline: Parent-Document Retrieval with Hybrid Search',
        'Structured Intelligence: JSON audit log for every interaction',
        'Agentic Orchestration: Supervisor Pattern with Librarian and Compliance Agent',
        'State Reset: Compliance Agent can reject and trigger re-search',
        'Hard Guardrails: Immediate hard stop for medical diagnosis/prescription requests',
        'OpenTelemetry Tracing: Track latency of each step',
        'LLM-as-a-Judge: Automated evaluation for faithfulness',
        'Cost Controls: Circuit breaker for budget limits',
        'Audit Trail: Complete paper trail for regulatory compliance',
        'Citations: Every answer must include source references'
      ],
      successCriteria: [
        'Faithfulness: 100% (No hallucinated medical facts)',
        'Recovery: System successfully rewinds state at least once',
        'Auditability: Every LLM response has valid JSON audit log',
        'Latency: End-to-end response time under 3 seconds',
        'Safety: All Poison Pill prompts caught by guardrails (100% rate)',
        'Retrieval: Finds specific values but retrieves full context',
        'Multi-Intent: Detects and routes multiple intents in single query',
        'Compliance: Agent reflection prevents unverified claims'
      ],
      hours: 48
    }
  },
  {
    weekNumber: 8,
    title: 'Portfolio + Launch',
    description: 'Build your portfolio and launch your AI products to the world',
    objectives: ['Prepare for AI engineering interviews', 'Create portfolio site', 'Launch products', 'Market your work'],
    concepts: [
      { slug: 'interview-preparation', title: 'AI Engineering Interview Preparation', minutes: 90 },
      { slug: 'portfolio-building', title: 'Building Your AI Engineer Portfolio', minutes: 35 },
      { slug: 'product-launch', title: 'Product Launch Strategy', minutes: 40 },
      { slug: 'marketing-fundamentals', title: 'Marketing for Developers', minutes: 30 }
    ],
    lab: {
      slug: 'portfolio-site',
      title: 'Build Your Portfolio Site',
      description: 'Create a professional portfolio showcasing your AI projects',
      exercises: [
        { number: 1, title: 'Design portfolio structure', type: 'design' },
        { number: 2, title: 'Build project showcase pages', type: 'coding' },
        { number: 3, title: 'Add case studies and write-ups', type: 'writing' },
        { number: 4, title: 'Deploy and optimize for SEO', type: 'deployment' }
      ]
    },
    project: {
      slug: 'launch-campaign',
      title: 'Product Launch Campaign',
      description: 'Launch your capstone project with a comprehensive marketing campaign',
      requirements: [
        'Landing page for your product',
        'Demo video or interactive demo',
        'Blog post or case study',
        'Social media presence',
        'Product Hunt or similar launch'
      ],
      successCriteria: [
        'Landing page gets 100+ visitors',
        'At least 10 signups or users',
        'Positive feedback from early users',
        'Content shared on social media'
      ],
      hours: 12
    }
  },
  {
    weekNumber: 9,
    title: 'Advanced RAG Techniques',
    description: 'Master advanced RAG patterns including hybrid search and query optimization',
    objectives: ['Implement hybrid search', 'Optimize retrieval quality', 'Build advanced RAG systems'],
    concepts: [
      { slug: 'hybrid-search', title: 'Hybrid Search: Dense + Sparse Retrieval', minutes: 40 },
      { slug: 'query-optimization', title: 'Query Rewriting & Expansion', minutes: 35 },
      { slug: 'reranking-strategies', title: 'Re-ranking and Filtering Strategies', minutes: 40 }
    ],
    lab: {
      slug: 'advanced-rag',
      title: 'Advanced RAG Implementation',
      description: 'Implement hybrid search with re-ranking for superior retrieval quality',
      exercises: [
        { number: 1, title: 'Implement BM25 sparse retrieval', type: 'coding' },
        { number: 2, title: 'Combine dense and sparse search', type: 'implementation' },
        { number: 3, title: 'Add cross-encoder re-ranking', type: 'coding' },
        { number: 4, title: 'Implement query expansion', type: 'coding' }
      ]
    },
    project: {
      slug: 'enterprise-rag',
      title: 'Enterprise-Grade RAG System',
      description: 'Build a production RAG system with advanced retrieval techniques',
      requirements: [
        'Hybrid search implementation',
        'Multi-stage retrieval pipeline',
        'Query optimization',
        'Performance benchmarking',
        'Scalable architecture'
      ],
      successCriteria: [
        'Retrieval precision above 0.8',
        'Query latency under 500ms',
        'System scales to 10K+ documents',
        'Handles complex multi-hop queries'
      ],
      hours: 12
    }
  },
  {
    weekNumber: 10,
    title: 'Fine-tuning + Custom Models',
    description: 'Fine-tune language models and build custom AI solutions',
    objectives: ['Fine-tune models', 'Prepare training data', 'Evaluate model performance'],
    concepts: [
      { slug: 'finetuning-basics', title: 'Fine-tuning Fundamentals', minutes: 40 },
      { slug: 'dataset-prep', title: 'Dataset Preparation & Curation', minutes: 45 },
      { slug: 'model-evaluation', title: 'Model Evaluation & Iteration', minutes: 40 }
    ],
    lab: {
      slug: 'finetune-model',
      title: 'Fine-tune a Custom Model',
      description: 'Fine-tune a model for a specific task and evaluate performance',
      exercises: [
        { number: 1, title: 'Prepare training dataset', type: 'data-prep' },
        { number: 2, title: 'Fine-tune model (OpenAI or Anthropic)', type: 'training' },
        { number: 3, title: 'Evaluate model performance', type: 'analysis' },
        { number: 4, title: 'Iterate and improve', type: 'optimization' }
      ]
    },
    project: {
      slug: 'custom-ai-model',
      title: 'Custom AI Model for Domain Task',
      description: 'Build and deploy a fine-tuned model for a specific domain task',
      requirements: [
        'Curated training dataset (500+ examples)',
        'Fine-tuned model',
        'Comprehensive evaluation metrics',
        'A/B testing vs. base model',
        'Production API deployment'
      ],
      successCriteria: [
        'Model outperforms base model by 20%+',
        'Evaluation dataset shows consistent quality',
        'Model deployed and serving requests',
        'Clear cost/performance tradeoffs documented'
      ],
      hours: 15
    }
  },
  {
    weekNumber: 11,
    title: 'Multi-Agent Systems',
    description: 'Build systems with multiple AI agents working together',
    objectives: ['Design agent teams', 'Implement agent coordination', 'Handle complex workflows'],
    concepts: [
      { slug: 'agent-coordination', title: 'Multi-Agent Coordination Patterns', minutes: 45 },
      { slug: 'task-delegation', title: 'Task Delegation & Orchestration', minutes: 40 },
      { slug: 'conflict-resolution', title: 'Conflict Resolution in Agent Systems', minutes: 35 }
    ],
    lab: {
      slug: 'multi-agent-system',
      title: 'Build a Multi-Agent System',
      description: 'Create a system where multiple agents collaborate to complete complex tasks',
      exercises: [
        { number: 1, title: 'Design agent architecture', type: 'design' },
        { number: 2, title: 'Implement agent communication', type: 'coding' },
        { number: 3, title: 'Add task orchestration', type: 'implementation' },
        { number: 4, title: 'Handle agent conflicts', type: 'coding' }
      ]
    },
    project: {
      slug: 'agent-team-system',
      title: 'Collaborative Agent Team',
      description: 'Build a multi-agent system where specialized agents work together',
      requirements: [
        'At least 3 specialized agents',
        'Agent communication protocol',
        'Task routing and delegation',
        'Shared memory/context',
        'Observable agent interactions'
      ],
      successCriteria: [
        'Agents successfully coordinate on tasks',
        'No deadlocks or infinite loops',
        'Clear division of responsibilities',
        'System completes complex multi-step workflows'
      ],
      hours: 14
    }
  },
  {
    weekNumber: 12,
    title: 'Enterprise AI Systems',
    description: 'Deploy and scale AI systems in enterprise environments',
    objectives: ['Build enterprise architecture', 'Ensure compliance and security', 'Scale AI systems'],
    concepts: [
      { slug: 'enterprise-architecture', title: 'Enterprise AI Architecture Patterns', minutes: 45 },
      { slug: 'compliance-security', title: 'AI Compliance, Security & Governance', minutes: 50 },
      { slug: 'scaling-strategies', title: 'Scaling AI Systems to Production', minutes: 40 }
    ],
    lab: {
      slug: 'enterprise-deployment',
      title: 'Enterprise AI Deployment',
      description: 'Deploy an AI system with enterprise-grade security and compliance',
      exercises: [
        { number: 1, title: 'Implement SSO and RBAC', type: 'security' },
        { number: 2, title: 'Add audit logging and compliance', type: 'implementation' },
        { number: 3, title: 'Set up multi-region deployment', type: 'infrastructure' },
        { number: 4, title: 'Implement disaster recovery', type: 'configuration' }
      ]
    },
    project: {
      slug: 'enterprise-ai-platform',
      title: 'Enterprise AI Platform',
      description: 'Build a complete enterprise-ready AI platform with all production concerns addressed',
      requirements: [
        'Multi-tenant architecture',
        'SSO integration (SAML/OIDC)',
        'Role-based access control',
        'Comprehensive audit logging',
        'SOC 2 compliance considerations',
        'Multi-region deployment',
        'Automated testing and CI/CD'
      ],
      successCriteria: [
        'Platform supports multiple tenants securely',
        'Authentication and authorization working',
        'Full audit trail of all actions',
        'Handles 1000+ concurrent users',
        'Meets enterprise security standards'
      ],
      hours: 18
    }
  }
]

async function main() {
  console.log('🌱 Seeding all 12 weeks of curriculum...\n')

  for (const week of weekData) {
    console.log(`Processing Week ${week.weekNumber}: ${week.title}`)

    // Create or update week
    const curriculumWeek = await prisma.curriculumWeek.upsert({
      where: { weekNumber: week.weekNumber },
      create: {
        weekNumber: week.weekNumber,
        title: week.title,
        description: week.description,
        objectives: week.objectives,
        active: true
      },
      update: {
        title: week.title,
        description: week.description,
        objectives: week.objectives
      }
    })

    // Delete existing content to avoid duplicates
    await prisma.concept.deleteMany({ where: { weekId: curriculumWeek.id } })
    await prisma.lab.deleteMany({ where: { weekId: curriculumWeek.id } })
    await prisma.weekProject.deleteMany({ where: { weekId: curriculumWeek.id } })

    // Create concepts
    for (let i = 0; i < week.concepts.length; i++) {
      const concept = week.concepts[i]
      await prisma.concept.create({
        data: {
          weekId: curriculumWeek.id,
          orderIndex: i + 1,
          slug: concept.slug,
          title: concept.title,
          contentPath: `content/week${week.weekNumber}/${concept.slug}.mdx`,
          estimatedMinutes: concept.minutes
        }
      })
    }
    console.log(`  ✓ Created ${week.concepts.length} concepts`)

    // Create lab
    await prisma.lab.create({
      data: {
        weekId: curriculumWeek.id,
        slug: week.lab.slug,
        title: week.lab.title,
        description: week.lab.description,
        exercises: week.lab.exercises
      }
    })
    console.log(`  ✓ Created lab`)

    // Create project
    await prisma.weekProject.create({
      data: {
        weekId: curriculumWeek.id,
        slug: week.project.slug,
        title: week.project.title,
        description: week.project.description,
        requirements: week.project.requirements,
        successCriteria: week.project.successCriteria,
        estimatedHours: week.project.hours
      }
    })
    console.log(`  ✓ Created project\n`)
  }

  console.log('✅ All 12 weeks seeded successfully!')
  console.log('\nSummary:')
  console.log('- 12 curriculum weeks')
  console.log('- 45 concepts')
  console.log('- 12 labs')
  console.log('- 12 projects')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
