import { validateMDXOrExit } from './lib/validate-mdx'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Comprehensive seed data for all 12 weeks
const weekData = [
  {
    weekNumber: 1,
    title: 'LLM Fundamentals (The Engine)',
    description: 'Master the physics of the Transformer to build deterministic and cost-effective AI systems',
    objectives: [
      'Architect deterministic systems with reusable prompt templates that minimize output variance',
      'Engineer API connectors with built-in retry logic and structured error handling for 99.9% reliability',
      'Quantify unit economics to justify model selection using cost-performance benchmarks',
      'Establish production readiness baseline with safety proxies and content filters',
      'Build rapid prototypes using visual builders to validate system flows before custom code'
    ],
    concepts: [
      { slug: 'how-llms-work', title: 'How LLMs Actually Work: From Next-Token Prediction to Training Pipelines', minutes: 45 },
      { slug: 'llm-fundamentals', title: 'The LLM Blueprint: Tokenization Physics & Context Constraints', minutes: 30 },
      { slug: 'prompt-engineering', title: 'Deterministic Logic Patterns: Few-Shot Calibration & Thought Traces', minutes: 40 },
      { slug: 'api-integration', title: 'API Resilience & Integration: Fault Tolerance & Model Cascade', minutes: 35 },
      { slug: 'architecture-decisions', title: 'Architectural ROI: Unit Economics & Model Selection Matrix', minutes: 30 },
      { slug: 'visual-builders', title: 'Rapid Prototyping with Wordware: System Flow Mapping', minutes: 25 },
      { slug: 'production-readiness', title: 'Production Readiness Baseline: Safety Proxy & Pre-Deployment Checks', minutes: 30 }
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
    description: 'Building the "Hardened Shell" around your engine to ensure enterprise compliance and adversarial resilience',
    objectives: [
      'Engineer the Safety Proxy pattern for input/output sanitization and jailbreak detection',
      'Implement immutable system prompts as technical policy with semantic tracing for auditability',
      'Build bias detection pipelines and self-correction mechanisms for responsible AI',
      'Deploy high-speed PII/PHI redaction with data residency patterns for domain compliance',
      'Establish production telemetry with SLA circuit breakers for non-functional requirement validation'
    ],
    concepts: [
      { slug: 'governance-frameworks', title: 'AI Governance & Shielding Frameworks: Safety Proxy Implementation', minutes: 45 },
      { slug: 'governance-foundations', title: 'AI Governance Foundations: System Prompts as Policy', minutes: 35 },
      { slug: 'responsible-ai', title: 'Responsible AI: Bias Detection, XAI & Self-Correction', minutes: 60 },
      { slug: 'compliance-patterns', title: 'Domain Compliance & Redaction: PII/PHI Protection', minutes: 50 },
      { slug: 'ai-testing-nfrs', title: 'Testing & Non-Functional Requirements: Production Telemetry', minutes: 55 }
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
      { slug: 'how-llms-work', title: 'The Frontier: RAG, Agents & Beyond', minutes: 35 },
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
      { slug: 'structured-output', title: 'Structured Output', description: 'JSON mode and type-safe responses.', minutes: 40 },
      { slug: 'function-calling', title: 'Function Calling', description: 'Tool integration and external system connections.', minutes: 45 },
      { slug: 'schema-design', title: 'Schema Design', description: 'Type systems and validation patterns.', minutes: 45 }
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
    description: 'Designing systems that reason, plan, and execute using multi-agent architectures and stateful reliability patterns',
    objectives: [
      'Engineer task decomposition with Planner agents that break complex intents into executable sub-tasks',
      'Implement stateful orchestration with LangGraph to manage shared state across agent hand-offs',
      'Deploy Supervisor pattern with Manager agents that delegate, validate, and orchestrate specialist workers',
      'Build collaborative swarms using Blackboard architecture for parallel problem-solving',
      'Architect self-reflection loops where agents critique their own work before submission',
      'Design Human-in-the-Loop interrupt points for high-stakes actions requiring human approval',
      'Implement database-backed state checkpointing for resumable agent threads across crashes',
      'Build time-travel debugging capability to rewind agent state and diagnose reasoning failures'
    ],
    concepts: [
      { slug: 'agentic-architectures', title: 'Agentic Architectures & Planning: ReAct and Task Decomposition', minutes: 45 },
      { slug: 'supervisor-patterns', title: 'Supervisor & Collaborative Patterns: Manager Agents and Swarms', minutes: 40 },
      { slug: 'reliability-patterns', title: 'Reliability Patterns: Self-Reflection and HITL', minutes: 50 },
      { slug: 'state-checkpointing', title: 'Persistence & State Checkpointing: Resumable Agent Threads', minutes: 45 },
      { slug: 'framework-selection', title: 'Framework Selection: LangGraph vs. CrewAI Performance', minutes: 35 }
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
      'Architect Hybrid Retrieval: Master the fusion of semantic (vector) and keyword (BM25) search to eliminate "vector blur" in production environments',
      'Deploy Neural Re-rankers: Implement cross-encoders to optimize Top-K precision and evaluate the critical "accuracy vs. latency" trade-off',
      'Advanced Query Engineering: Apply Multi-Query, HyDE, and Decomposition patterns to translate complex user intent into actionable search paths',
      'Context Window Optimization: Engineer context strategies to mitigate "Lost in the Middle" degradation and maximize LLM reasoning efficiency',
      'Production Hardening & Scale: Build HIPAA-grade RAG systems featuring sub-200ms latency, semantic caching, and rigorous audit trails'
    ],
    concepts: [
      { slug: 'hybrid-retrieval-reranking', title: 'Hybrid Search & Re-Ranking', description: 'Combining vector and keyword precision.', minutes: 50 },
      { slug: 'query-transformation-patterns', title: 'Query Transformation', description: 'Patterns like HyDE and Multi-Query decomposition.', minutes: 45 },
      { slug: 'context-window-optimization', title: 'Context Engineering', description: 'Chunking strategies and mitigating lost-in-the-middle.', minutes: 40 },
      { slug: 'enterprise-rag-hardening', title: 'Evaluation & Security', description: 'RAGAS metrics, PII masking, and safety guardrails.', minutes: 55 },
      { slug: 'observability-basics', title: 'Request Tracing', description: 'Single-request debugging with spans and traces.', minutes: 30 },
      { slug: 'monitoring-ai-systems', title: 'System Metrics', description: 'Aggregated monitoring for drift, cost, and health.', minutes: 35 },
      { slug: 'performance-optimization', title: 'Performance & Caching', description: 'Low-latency engineering with semantic caching.', minutes: 40 },
      { slug: 'production-deployment', title: 'Production Deployment', description: 'Scaling and infrastructure best practices.', minutes: 35 }
    ],
    lab: {
      slug: 'medical-records-navigator',
      title: 'Lab: The Precision Retrieval Challenge',
      description: 'Build a clinical search platform and prove advanced RAG techniques through quantitative benchmarking. Compare baseline vector search vs. parent-document vs. hybrid retrieval across 10 specialized exercises. Measure success with Hit Rate (Recall@K) and MRR to validate architectural decisions with data.',
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
      title: 'Project: Production RAG for Regulated Industry',
      description: 'Build a production-grade HIPAA-compliant RAG system with real-world enterprise constraints. Integrate hybrid retrieval, re-ranking, semantic caching, evaluation metrics, and audit trails across 11 architectural requirements.',
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
      'Architecting Observability: Implement the three pillars of AI observability—Traces, Evaluations, and Unit Economics—to monitor system health',
      'Security & Guardrails: Build rigorous input and output validation layers to prevent prompt injections, data leakage, and medical hallucinations',
      'Automated Quality Assurance: Deploy LLM-as-a-Judge pipelines to replace manual testing with scalable, automated evaluation logic',
      'Production Reliability: Implement semantic versioning for AI assets and set up cost-tracking "circuit breakers" for commercial viability',
      'Regression Testing: Create and maintain "Golden Datasets" to ensure new model deployments do not degrade existing system performance'
    ],
    concepts: [
      { slug: 'observability-pillars', title: 'Observability Pillars', description: 'Traces, evaluations, and cost tracking.', minutes: 50 },
      { slug: 'guardrails', title: 'Production Guardrails', description: 'Input/output validation and safety checks.', minutes: 45 },
      { slug: 'automated-evaluation', title: 'Automated Evaluation', description: 'LLM-as-a-Judge for continuous quality assurance.', minutes: 45 }
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
    title: 'Portfolio + Launch (The Synthesis)',
    description: 'Consolidating 7 weeks of engineering into a production-ready pilot and a high-impact architectural portfolio',
    objectives: [
      'Design multi-tenant vertical AI platforms with strict data isolation for industry-specific workflows',
      'Stress-test production systems with red-team adversarial attacks and 10x load spike simulations',
      'Engineer automated evaluation suites with golden datasets and regression prevention leaderboards',
      'Author System Design Documents justifying tech stack decisions against enterprise constraints'
    ],
    concepts: [
      { slug: 'vertical-ai-platforms', title: 'Architecting Vertical AI Platforms: Multi-Tenant Design', minutes: 45 },
      { slug: 'production-stress-test', title: 'The Production Stress-Test: Red-Team & Load Validation', minutes: 50 },
      { slug: 'evaluation-suite', title: 'Engineering the Evaluation Suite: Golden Datasets', minutes: 40 },
      { slug: 'architectural-storytelling', title: 'Architectural Storytelling: System Design Documents', minutes: 35 }
    ],
    lab: {
      slug: 'stress-test-suite',
      title: 'Production Stress-Test Suite',
      description: 'Subject your capstone project to adversarial attacks, load spikes, and automated evaluation to prove production-readiness',
      exercises: [
        { number: 1, title: 'Implement red-team adversarial test suite (prompt injections, recursive loops)', type: 'testing' },
        { number: 2, title: 'Build load testing harness with 10x concurrent user spike simulation', type: 'coding' },
        { number: 3, title: 'Create golden dataset with 100+ edge case queries', type: 'implementation' },
        { number: 4, title: 'Deploy automated evaluation leaderboard tracking regressions', type: 'coding' },
        { number: 5, title: 'Generate production telemetry report with sustained throughput metrics', type: 'testing' }
      ]
    },
    project: {
      slug: 'architectural-portfolio',
      title: 'Architectural Portfolio & System Design Document',
      description: 'Package 7 weeks of engineering into a production-ready pilot with comprehensive System Design Document proving architectural authority',
      requirements: [
        'Multi-tenant architecture document with data isolation design',
        'Red-team test results report (100% adversarial attack prevention)',
        'Load test report with sustained throughput under 10x spike',
        'Evaluation leaderboard with 100+ edge cases and regression tracking',
        'System Design Document (SDD) justifying vector DB, agent orchestration, and model selection',
        'Skill Diagnosis Brief showing verified mastery across 7 domains',
        'Architectural Decision Records (ADRs) for major tech stack choices',
        'Cost-benefit analysis for production deployment',
        'Security audit report with mitigation strategies',
        'Portfolio site showcasing technical depth with code samples'
      ],
      successCriteria: [
        'System survives all red-team attacks without failures',
        'Maintains <3s latency under 10x load spike',
        'Evaluation leaderboard shows >90% accuracy on edge cases',
        'SDD clearly justifies every major architectural decision',
        'Skill Diagnosis verifies 85%+ competency across all 7 domains',
        'Portfolio demonstrates production-grade thinking (not just toy projects)',
        'Cost projections show commercial viability (<$0.10 per request)',
        'Security vulnerabilities identified and mitigated'
      ],
      hours: 16
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
  // Validate and auto-fix all MDX content before seeding
  await validateMDXOrExit()

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
          ...('description' in concept ? { description: concept.description } : {}),
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
