import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const weekData = [
  {
    weekNumber: 3,
    title: 'RAG & Memory Fundamentals (The Knowledge Base)',
    description: 'Build retrieval-augmented generation systems with vector databases',
    objectives: ['Implement vector search', 'Build RAG pipelines', 'Manage conversation memory'],
    concepts: [
      { slug: 'vector-embeddings', title: 'Vector Embeddings & Similarity Search', minutes: 35 },
      { slug: 'rag-pipelines', title: 'Building RAG Pipelines', minutes: 40 },
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
      { slug: 'structured-output', title: 'Structured Output & JSON Mode', minutes: 40 },
      { slug: 'function-calling', title: 'Function Calling & Tool Use', minutes: 45 },
      { slug: 'schema-design', title: 'Schema Design & API Contracts', minutes: 45 }
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
    weekNumber: 7,
    title: 'Observability & Production (The Reliability)',
    description: 'Plan and build your capstone AI application from scratch',
    objectives: ['Design AI product', 'Implement end-to-end system', 'Deploy to production'],
    concepts: [
      { slug: 'project-planning', title: 'AI Product Planning & Design', minutes: 40 },
      { slug: 'architecture-design', title: 'System Architecture for AI Apps', minutes: 45 },
      { slug: 'implementation-strategy', title: 'Implementation & Deployment Strategy', minutes: 35 }
    ],
    lab: {
      slug: 'capstone-planning',
      title: 'Capstone Project Planning',
      description: 'Create a comprehensive plan for your capstone AI application',
      exercises: [
        { number: 1, title: 'Define problem and solution', type: 'planning' },
        { number: 2, title: 'Design system architecture', type: 'design' },
        { number: 3, title: 'Create implementation roadmap', type: 'planning' },
        { number: 4, title: 'Set success metrics', type: 'planning' }
      ]
    },
    project: {
      slug: 'capstone-mvp',
      title: 'Capstone MVP',
      description: 'Build and deploy a minimum viable product of your capstone project',
      requirements: [
        'Novel AI application solving real problem',
        'Production-ready deployment',
        'Monitoring and observability',
        'User authentication and data persistence',
        'Comprehensive documentation'
      ],
      successCriteria: [
        'Application deployed and accessible',
        'Core features working end-to-end',
        'At least 5 test users successfully use the app',
        'Documentation covers setup and usage'
      ],
      hours: 20
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
    console.log(`  ✓ Created project`)
  }

  console.log('\n✅ All weeks seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
