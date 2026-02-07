import { validateMDXOrExit } from './lib/validate-mdx'
import { validateContentSync } from './lib/validate-content-sync'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const weekData = [
  {
    weekNumber: 1,
    title: 'Foundations + Visual Builder Introduction',
    description: 'Understand LLM fundamentals, master API integration, and build production-ready systems',
    objectives: ['Understand LLM fundamentals', 'Master prompt engineering', 'Learn API integration patterns', 'Build production-ready chat assistant'],
    concepts: [
      { slug: 'llm-fundamentals', title: 'LLM Fundamentals', minutes: 45 },
      { slug: 'prompt-engineering', title: 'Prompt Engineering & Self-Healing JSON', minutes: 45 },
      { slug: 'api-integration', title: 'API Resilience & Integration', minutes: 45 },
      { slug: 'visual-builders', title: 'Rapid Prototyping with Visual Builders', minutes: 45 },
      { slug: 'architecture-decisions', title: 'Architectural ROI & Model Selection', minutes: 45 },
      { slug: 'production-readiness', title: 'Production Readiness Baseline', minutes: 45 },
      { slug: 'lab-multi-tier-triage', title: 'Lab: Multi-Tier Triage System', minutes: 90 }
    ],
    lab: {
      slug: 'visual-to-code',
      title: 'Visual Builder to Code Translation',
      description: 'Build a Q&A chatbot visually, then rebuild in code to understand abstraction layers',
      exercises: [
        { number: 1, title: 'Build Q&A chatbot in Flowise', type: 'visual' },
        { number: 2, title: 'Understand the flow', type: 'analysis' },
        { number: 3, title: 'Export to code', type: 'export' },
        { number: 4, title: 'Rebuild from scratch in code', type: 'coding' }
      ]
    },
    project: {
      slug: 'chat-assistant-dual',
      title: 'Chat Assistant (Dual Implementation)',
      description: 'Build a conversational chat assistant with both visual and code implementations',
      requirements: ['Build visual prototype', 'Build production code version', 'Implement conversation history', 'Add basic guardrails', 'Deploy application'],
      successCriteria: ['Multi-turn conversations work', 'Context window managed properly', 'Basic guardrails prevent misuse', 'Deployed and accessible'],
      hours: 5
    }
  },
  {
    weekNumber: 2,
    title: 'AI Safety, Governance & Testing',
    description: 'Master AI governance frameworks, compliance patterns, and testing strategies',
    objectives: ['Implement AI governance', 'Build compliance patterns', 'Design testing strategies', 'Master responsible AI'],
    concepts: [
      { slug: 'governance-foundations', title: 'AI Governance Foundations', minutes: 35 },
      { slug: 'governance-frameworks', title: 'AI Governance & Shielding Frameworks', minutes: 45 },
      { slug: 'responsible-ai', title: 'Responsible AI: Bias Detection & Self-Correction Patterns', minutes: 60 },
      { slug: 'compliance-patterns', title: 'Domain Compliance & Redaction', minutes: 50 },
      { slug: 'ai-testing-nfrs', title: 'Testing & Non-Functional Requirements', minutes: 55 },
      { slug: 'lab-hipaa-gateway', title: 'Lab: HIPAA-Compliant Gateway', minutes: 120 },
      { slug: 'lab-sovereign-governance', title: 'Lab: PII Redaction & Sovereign Governance', minutes: 180 },
      { slug: 'architecture-certification', title: 'Week 2 Architecture Certification Exam', minutes: 120 }
    ],
    lab: {
      slug: 'governance-lab',
      title: 'AI Governance Implementation',
      description: 'Implement governance frameworks, compliance patterns, and bias detection',
      exercises: [
        { number: 1, title: 'Implement PII redaction pipeline', type: 'coding' },
        { number: 2, title: 'Build bias detection system', type: 'implementation' },
        { number: 3, title: 'Add compliance audit logging', type: 'coding' },
        { number: 4, title: 'Create governance dashboard', type: 'integration' }
      ]
    },
    project: {
      slug: 'governance-framework',
      title: 'Enterprise Governance Framework',
      description: 'Build a complete AI governance framework with compliance and safety controls',
      requirements: ['PII detection and redaction', 'Bias monitoring', 'Compliance audit trail', 'Safety guardrails', 'Testing framework'],
      successCriteria: ['PII redaction works correctly', 'Bias detection identifies issues', 'Full audit trail available', 'All safety controls enforced'],
      hours: 8
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
      { slug: 'memory-systems', title: 'Conversation Memory Systems', minutes: 35 },
      { slug: 'hybrid-search-reranking', title: 'Hybrid Search & Re-ranking', minutes: 45 },
      { slug: 'certification-exam', title: 'Week 3 Certification: The Knowledge Architect', minutes: 90 }
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
      requirements: ['Document upload and processing', 'Vector embedding and storage', 'Semantic search', 'Context-aware generation', 'Citation tracking'],
      successCriteria: ['Documents chunked correctly', 'Retrieval returns relevant passages', 'Answers include citations', 'Handles multi-document queries'],
      hours: 8
    }
  },
  {
    weekNumber: 4,
    title: 'Structured Intelligence & API Integration (The Interface)',
    description: 'Transform LLMs from chatbots to system components with structured output and function calling',
    objectives: ['Master structured output and JSON mode', 'Design function calling patterns', 'Build schema-driven tool specs', 'Validate LLM outputs with type safety'],
    concepts: [
      { slug: 'structured-output', title: 'Structured Output & JSON Mode', minutes: 40 },
      { slug: 'function-calling', title: 'Function Calling & Tool Use', minutes: 45 },
      { slug: 'schema-design', title: 'Schema Design & API Contracts', minutes: 45 },
      { slug: 'lab-support-ticket-router', title: 'Lab: Support Ticket Router', minutes: 120 },
      { slug: 'certification-exam', title: 'Week 4 Certification: The Systems Architect', minutes: 90 }
    ],
    lab: {
      slug: 'support-ticket-router',
      title: 'Support Ticket Router',
      description: 'Build an enterprise support system with structured data extraction and function calling',
      exercises: [
        { number: 1, title: 'Extract ticket data with structured output', type: 'coding' },
        { number: 2, title: 'Implement sentiment analysis', type: 'implementation' },
        { number: 3, title: 'Add function calling for inventory lookup', type: 'coding' },
        { number: 4, title: 'Orchestrate multi-tool workflows', type: 'coding' },
        { number: 5, title: 'Validate all inputs with Zod schemas', type: 'implementation' }
      ]
    },
    project: {
      slug: 'enterprise-orchestrator',
      title: 'Enterprise Support Orchestrator',
      description: 'Build a complete customer support system orchestrated by an LLM',
      requirements: ['Structured ticket extraction', 'Function calling for tools', 'Zod validation', 'Multi-step orchestration', 'Error handling', 'Schema-first design'],
      successCriteria: ['Extracts structured data from 90%+ emails', 'No invalid tool arguments', 'Multi-step workflows work', 'Edge cases handled'],
      hours: 8
    }
  },
  {
    weekNumber: 5,
    title: 'AI Agents & Agentic Architectures',
    description: 'Build autonomous AI agents with tool use, planning, and multi-agent coordination',
    objectives: ['Understand agent architectures', 'Build tool-using agents', 'Implement reliability patterns', 'Master state checkpointing'],
    concepts: [
      { slug: 'agent-architectures', title: 'Agent Architectures', minutes: 45 },
      { slug: 'agentic-architectures', title: 'Agentic Architectures & Planning: ReAct and Task Decomposition', minutes: 45 },
      { slug: 'supervisor-patterns', title: 'Supervisor & Collaborative Patterns: Manager Agents and Swarms', minutes: 40 },
      { slug: 'reliability-patterns', title: 'Reliability Patterns: Self-Reflection and HITL', minutes: 50 },
      { slug: 'state-checkpointing', title: 'Persistence & State Checkpointing: Resumable Agent Threads', minutes: 45 },
      { slug: 'framework-comparison', title: 'Framework Face-Off: LangGraph vs CrewAI vs AutoGen', minutes: 40 },
      { slug: 'framework-selection', title: 'Framework Selection: LangGraph vs. CrewAI Performance', minutes: 35 },
      { slug: 'technical-standards', title: 'Archcelerate Technical Standards: The Director\'s Reference Guide', minutes: 45 },
      { slug: 'lab-newsletter-team', title: 'Lab: Auto-Research & Newsletter Team', minutes: 180 },
      { slug: 'lab-research-swarm', title: 'Lab: Autonomous Medical Research Swarm', minutes: 180 },
      { slug: 'certification-exam', title: 'Week 5 Certification: The Agentic Architect', minutes: 120 }
    ],
    lab: {
      slug: 'build-research-agent',
      title: 'Build a Research Agent',
      description: 'Create an autonomous agent that can research topics using web search and document analysis',
      exercises: [
        { number: 1, title: 'Implement web search tool', type: 'coding' },
        { number: 2, title: 'Build document summarization tool', type: 'coding' },
        { number: 3, title: 'Create ReAct agent loop', type: 'implementation' },
        { number: 4, title: 'Add error handling and retries', type: 'coding' }
      ]
    },
    project: {
      slug: 'autonomous-task-agent',
      title: 'Autonomous Task Completion Agent',
      description: 'Build an agent that can autonomously complete multi-step tasks using custom tools',
      requirements: ['ReAct agent architecture', 'At least 3 custom tools', 'Error handling', 'Agent memory', 'Observable traces', 'Safety controls'],
      successCriteria: ['Agent completes multi-step tasks', 'Tools called correctly', 'Errors handled gracefully', 'Within iteration limits'],
      hours: 10
    }
  },
  {
    weekNumber: 6,
    title: 'Advanced RAG & Production Observability',
    description: 'Master advanced RAG patterns, production deployment, and system observability',
    objectives: ['Build enterprise RAG systems', 'Implement production observability', 'Optimize performance and caching', 'Deploy production-ready systems'],
    concepts: [
      { slug: 'observability-basics', title: 'Request Tracing & Distributed Observability', minutes: 45 },
      { slug: 'monitoring-ai-systems', title: 'System Metrics & Predictive Operational Intelligence', minutes: 50 },
      { slug: 'performance-optimization', title: 'Performance Optimization & Caching', minutes: 40 },
      { slug: 'production-deployment', title: 'Production Deployment Best Practices', minutes: 35 },
      { slug: 'hybrid-retrieval-reranking', title: 'Hybrid Retrieval & Re-Ranking', minutes: 45 },
      { slug: 'query-transformation-patterns', title: 'Query Transformation Patterns', minutes: 40 },
      { slug: 'context-window-optimization', title: 'Context Window Management & Optimization', minutes: 40 },
      { slug: 'enterprise-rag-hardening', title: 'Enterprise RAG Hardening & Evaluation', minutes: 45 },
      { slug: 'lab-advanced-rag-system', title: 'Lab: Production-Grade Advanced RAG System', minutes: 180 },
      { slug: 'certification-exam', title: 'Week 6 Certification: The RAG Optimizer', minutes: 120 }
    ],
    lab: {
      slug: 'production-rag-lab',
      title: 'Production RAG System',
      description: 'Build a production-grade RAG system with observability and performance optimization',
      exercises: [
        { number: 1, title: 'Implement hybrid retrieval pipeline', type: 'coding' },
        { number: 2, title: 'Add distributed tracing', type: 'implementation' },
        { number: 3, title: 'Optimize query performance', type: 'optimization' },
        { number: 4, title: 'Deploy with monitoring', type: 'deployment' }
      ]
    },
    project: {
      slug: 'production-rag-system',
      title: 'Production RAG Platform',
      description: 'Build and deploy a fully observable production RAG system',
      requirements: ['Hybrid retrieval', 'Query transformation', 'Performance optimization', 'Production monitoring', 'Deployment pipeline'],
      successCriteria: ['Retrieval precision above 0.85', 'P95 latency under 500ms', 'Full observability dashboard', 'Zero-downtime deployment'],
      hours: 12
    }
  },
  {
    weekNumber: 7,
    title: 'Observability & Production (The Reliability)',
    description: 'Master AI observability, automated evaluation, and production guardrails',
    objectives: ['Implement AI observability pillars', 'Build automated evaluation pipelines', 'Design production guardrails', 'Create LLM-as-a-Judge systems'],
    concepts: [
      { slug: 'observability-pillars', title: 'The Three Pillars of AI Observability', minutes: 55 },
      { slug: 'automated-evaluation', title: 'LLM-as-a-Judge: Automated Evaluation Pipelines', minutes: 60 },
      { slug: 'guardrails', title: 'Production Guardrails: Defense-in-Depth Architecture', minutes: 70 },
      { slug: 'lab-llm-judge-pipeline', title: 'Lab: LLM-as-a-Judge for Financial Services Compliance', minutes: 150 },
      { slug: 'lab-production-dashboard', title: 'Lab: Production Dashboard - Hardening for 24/7 Operations', minutes: 180 },
      { slug: 'certification-exam', title: 'Week 7 Certification: The Production Lead', minutes: 120 }
    ],
    lab: {
      slug: 'llm-judge-pipeline',
      title: 'LLM-as-a-Judge Pipeline',
      description: 'Build an automated evaluation pipeline using LLM-as-a-Judge for production quality assurance',
      exercises: [
        { number: 1, title: 'Design evaluation criteria', type: 'design' },
        { number: 2, title: 'Implement judge prompts', type: 'coding' },
        { number: 3, title: 'Build scoring pipeline', type: 'implementation' },
        { number: 4, title: 'Add production monitoring', type: 'integration' }
      ]
    },
    project: {
      slug: 'production-observability',
      title: 'Production Observability Platform',
      description: 'Build a complete observability platform for AI systems in production',
      requirements: ['Three pillars of observability', 'Automated evaluation', 'Production guardrails', 'Real-time monitoring', 'Alerting system'],
      successCriteria: ['Full tracing coverage', 'Automated quality scoring', 'Guardrails catch 95%+ of violations', 'Real-time dashboard operational'],
      hours: 20
    }
  },
  {
    weekNumber: 8,
    title: 'Portfolio + Launch',
    description: 'Build your portfolio, prepare for interviews, and launch AI products',
    objectives: ['Prepare for AI engineering interviews', 'Create portfolio site', 'Launch products', 'Market your work'],
    concepts: [
      { slug: 'interview-preparation', title: 'AI Engineering Interview Preparation', minutes: 90 },
      { slug: 'portfolio-building', title: 'Building Your AI Engineer Portfolio', minutes: 35 },
      { slug: 'product-launch', title: 'Product Launch Strategy', minutes: 40 },
      { slug: 'marketing-fundamentals', title: 'Marketing for Developers', minutes: 30 },
      { slug: 'architectural-storytelling', title: 'Architectural Storytelling: System Design Documents', minutes: 35 },
      { slug: 'evaluation-suite', title: 'Engineering the Evaluation Suite: Golden Datasets', minutes: 55 },
      { slug: 'production-stress-test', title: 'The Production Stress-Test: Red-Team & Load Validation', minutes: 50 },
      { slug: 'vertical-ai-platforms', title: 'Architecting Vertical AI Platforms: Multi-Tenant Design', minutes: 45 }
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
      requirements: ['Landing page', 'Demo video', 'Blog post or case study', 'Social media presence', 'Product Hunt launch'],
      successCriteria: ['100+ visitors', '10+ signups', 'Positive feedback', 'Content shared on social media'],
      hours: 12
    }
  },
  {
    weekNumber: 9,
    title: 'Advanced RAG Techniques',
    description: 'Master advanced RAG patterns including hybrid search, GraphRAG, and query optimization',
    objectives: ['Implement hybrid search', 'Build knowledge graphs', 'Optimize retrieval quality', 'Master context fusion'],
    concepts: [
      { slug: 'hybrid-search', title: 'Hybrid Search: Dense + Sparse Retrieval', minutes: 45 },
      { slug: 'query-optimization', title: 'Query Optimization & Expansion', minutes: 45 },
      { slug: 'reranking-strategies', title: 'Re-ranking and Filtering Strategies', minutes: 40 },
      { slug: 'graphrag-fundamentals', title: 'GraphRAG Fundamentals', minutes: 50 },
      { slug: 'knowledge-graph-construction', title: 'Knowledge Graph Construction', minutes: 55 },
      { slug: 'context-fusion-strategies', title: 'Context Fusion Strategies', minutes: 50 },
      { slug: 'certification-exam', title: 'Week 9 Certification: The RAG Specialist', minutes: 120 }
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
      requirements: ['Hybrid search', 'Multi-stage retrieval', 'Query optimization', 'Performance benchmarking', 'Scalable architecture'],
      successCriteria: ['Precision above 0.8', 'Latency under 500ms', 'Scales to 10K+ docs', 'Handles multi-hop queries'],
      hours: 12
    }
  },
  {
    weekNumber: 10,
    title: 'Fine-tuning + Custom Models',
    description: 'Fine-tune language models, prepare datasets, and evaluate model performance',
    objectives: ['Fine-tune models', 'Prepare training data', 'Evaluate model performance', 'Master LoRA and PEFT', 'Deploy custom models'],
    concepts: [
      { slug: 'finetuning-basics', title: 'Fine-tuning Fundamentals', minutes: 40 },
      { slug: 'dataset-prep', title: 'Dataset Preparation & Curation', minutes: 45 },
      { slug: 'model-evaluation', title: 'Model Evaluation & Iteration', minutes: 40 },
      { slug: 'finetuning-decision-framework', title: 'Fine-Tuning Decision Framework', minutes: 50 },
      { slug: 'dataset-curation-pipeline', title: 'Dataset Curation Pipeline', minutes: 50 },
      { slug: 'lora-and-peft', title: 'LoRA and Parameter-Efficient Fine-Tuning', minutes: 55 },
      { slug: 'model-evaluation-frameworks', title: 'Model Evaluation Frameworks', minutes: 75 },
      { slug: 'model-deployment-strategies', title: 'Model Deployment Strategies', minutes: 50 },
      { slug: 'certification-exam', title: 'Week 10 Certification: The Model Scientist', minutes: 120 }
    ],
    lab: {
      slug: 'finetune-model',
      title: 'Fine-tune a Custom Model',
      description: 'Fine-tune a model for a specific task and evaluate performance',
      exercises: [
        { number: 1, title: 'Prepare training dataset', type: 'data-prep' },
        { number: 2, title: 'Fine-tune model', type: 'training' },
        { number: 3, title: 'Evaluate model performance', type: 'analysis' },
        { number: 4, title: 'Iterate and improve', type: 'optimization' }
      ]
    },
    project: {
      slug: 'custom-ai-model',
      title: 'Custom AI Model for Domain Task',
      description: 'Build and deploy a fine-tuned model for a specific domain task',
      requirements: ['Curated dataset (500+ examples)', 'Fine-tuned model', 'Evaluation metrics', 'A/B testing vs base', 'Production deployment'],
      successCriteria: ['Outperforms base by 20%+', 'Consistent quality', 'Deployed and serving', 'Cost tradeoffs documented'],
      hours: 15
    }
  },
  {
    weekNumber: 11,
    title: 'Multi-Agent Systems',
    description: 'Build systems with multiple AI agents working together on complex tasks',
    objectives: ['Design agent teams', 'Implement agent coordination', 'Handle complex workflows', 'Master conflict resolution'],
    concepts: [
      { slug: 'agent-coordination', title: 'Multi-Agent Coordination Patterns', minutes: 50 },
      { slug: 'task-delegation', title: 'Task Delegation & Orchestration: Resilient Execution Governance', minutes: 70 },
      { slug: 'conflict-resolution', title: 'Conflict Resolution in Agent Systems', minutes: 55 },
      { slug: 'hierarchical-agent-swarms', title: 'Hierarchical Agent Swarms', minutes: 60 },
      { slug: 'lab-multi-agent-product-launch', title: 'Lab: Multi-Agent Product Launch Swarm', minutes: 240 },
      { slug: 'certification-exam', title: 'Week 11 Certification: The Orchestrator', minutes: 120 }
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
      requirements: ['At least 3 specialized agents', 'Communication protocol', 'Task routing', 'Shared memory', 'Observable interactions'],
      successCriteria: ['Agents coordinate successfully', 'No deadlocks', 'Clear responsibilities', 'Completes multi-step workflows'],
      hours: 14
    }
  },
  {
    weekNumber: 12,
    title: 'Enterprise AI Systems',
    description: 'Deploy and scale AI systems in enterprise environments with compliance and security',
    objectives: ['Build enterprise architecture', 'Ensure compliance and security', 'Scale AI systems', 'Design global AI infrastructure'],
    concepts: [
      { slug: 'enterprise-architecture', title: 'Enterprise AI Architecture Patterns', minutes: 45 },
      { slug: 'compliance-security', title: 'AI Compliance, Security & Governance: Auditable Trust Architecture', minutes: 75 },
      { slug: 'scaling-strategies', title: 'Scaling AI Systems to Production', minutes: 40 },
      { slug: 'global-ai-gateway', title: 'Global AI Gateway: Enterprise AI Infrastructure', minutes: 60 },
      { slug: 'master-playbook', title: 'The Archcelerate Master Architectural Playbook', minutes: 15 },
      { slug: 'technical-impact-summary', title: 'Technical Impact Summary', minutes: 20 },
      { slug: 'lab-global-ai-gateway', title: 'Lab: Build a Global AI Gateway', minutes: 300 },
      { slug: 'certification-exam', title: 'Certification Exam: The Infrastructure Architect', minutes: 60 }
    ],
    lab: {
      slug: 'enterprise-deployment',
      title: 'Enterprise AI Deployment',
      description: 'Deploy an AI system with enterprise-grade security, compliance, and global infrastructure',
      exercises: [
        { number: 1, title: 'Implement SSO and RBAC', type: 'security' },
        { number: 2, title: 'Add audit logging and compliance', type: 'implementation' },
        { number: 3, title: 'Set up multi-region deployment', type: 'infrastructure' },
        { number: 4, title: 'Build global AI gateway', type: 'coding' }
      ]
    },
    project: {
      slug: 'enterprise-ai-platform',
      title: 'Enterprise AI Platform',
      description: 'Build a complete enterprise-ready AI platform with all production concerns addressed',
      requirements: ['Multi-tenant architecture', 'SSO integration', 'RBAC', 'Audit logging', 'Compliance', 'Multi-region deployment', 'CI/CD'],
      successCriteria: ['Multi-tenant support', 'Auth working', 'Full audit trail', '1000+ concurrent users', 'Enterprise security standards'],
      hours: 18
    }
  }
]

async function main() {
  // Validate and auto-fix all MDX content before seeding
  await validateMDXOrExit()

  console.log('Seeding all remaining weeks...')

  for (const week of weekData) {
    console.log(`\nProcessing Week ${week.weekNumber}: ${week.title}`)

    // Create or get week
    let curriculumWeek = await prisma.curriculumWeek.upsert({
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

    // Delete existing content
    await prisma.concept.deleteMany({ where: { weekId: curriculumWeek.id } })
    await prisma.lab.deleteMany({ where: { weekId: curriculumWeek.id } })
    await prisma.weekProject.deleteMany({ where: { weekId: curriculumWeek.id } })

    // Create concepts
    for (let i = 0; i < week.concepts.length; i++) {
      const concept = week.concepts[i]
      // Use week-prefixed slug for uniqueness, but keep original filename for contentPath
      const uniqueSlug = `w${week.weekNumber}-${concept.slug}`
      await prisma.concept.create({
        data: {
          weekId: curriculumWeek.id,
          orderIndex: i + 1,
          slug: uniqueSlug,
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
    console.log(`  ✓ Created project`)
  }

  console.log('\n✅ All weeks seeded successfully!')

  // Validate that all content files are in sync with database
  console.log('\n' + '='.repeat(50))
  await validateContentSync({ failOnMismatch: false })
  console.log('='.repeat(50) + '\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
