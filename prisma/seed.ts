import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Comprehensive seed data for all 12 weeks
const weekData = [
  {
    weekNumber: 1,
    title: 'Foundations + Visual Builder Introduction',
    description: 'Understand LLM fundamentals, master API integration, experience visual agent building, and build production-ready chat assistant',
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
    title: 'AI Governance & Responsible AI',
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
    title: 'RAG + Memory',
    description: 'Build retrieval-augmented generation systems with vector databases',
    objectives: ['Implement vector search', 'Build RAG pipelines', 'Manage conversation memory'],
    concepts: [
      { slug: 'rag-memory-fundamentals', title: 'RAG + Memory Fundamentals', minutes: 40 },
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
    title: 'Code Review Assistant',
    description: 'Build an AI-powered code review and analysis system',
    objectives: ['Analyze code with AI', 'Automate code reviews', 'Integrate with development workflow'],
    concepts: [
      { slug: 'code-analysis', title: 'AI-Powered Code Analysis', minutes: 35 },
      { slug: 'review-automation', title: 'Automated Code Review Patterns', minutes: 40 },
      { slug: 'dev-integration', title: 'Development Workflow Integration', minutes: 30 }
    ],
    lab: {
      slug: 'code-reviewer',
      title: 'Build a Code Review Agent',
      description: 'Create an agent that can analyze code and provide constructive feedback',
      exercises: [
        { number: 1, title: 'Parse and analyze code structure', type: 'coding' },
        { number: 2, title: 'Implement review prompt engineering', type: 'implementation' },
        { number: 3, title: 'Add multi-file analysis', type: 'coding' },
        { number: 4, title: 'Generate actionable feedback', type: 'coding' }
      ]
    },
    project: {
      slug: 'ai-code-reviewer',
      title: 'AI Code Review System',
      description: 'Build a complete code review system with GitHub integration',
      requirements: [
        'GitHub webhook integration',
        'Pull request analysis',
        'Automated review comments',
        'Code quality scoring',
        'Learning from feedback'
      ],
      successCriteria: [
        'System integrates with GitHub PRs',
        'Reviews are contextual and helpful',
        'False positive rate below 20%',
        'Review turnaround under 2 minutes'
      ],
      hours: 10
    }
  },
  {
    weekNumber: 5,
    title: 'AI Agents',
    description: 'Build autonomous AI agents that can use tools and complete complex tasks',
    objectives: [
      'Understand agent architectures',
      'Build tool-using agents',
      'Debug and optimize agents'
    ],
    concepts: [
      { slug: 'agent-fundamentals', title: 'Agent Fundamentals', minutes: 35 },
      { slug: 'building-tools', title: 'Building Tools for Agents', minutes: 40 },
      { slug: 'agent-debugging', title: 'Agent Debugging & Optimization', minutes: 45 }
    ],
    lab: {
      slug: 'build-research-agent',
      title: 'Build a Research Agent',
      description: 'Create an autonomous agent that can research topics using web search and document analysis',
      exercises: [
        { number: 1, title: 'Implement web search tool', type: 'coding' },
        { number: 2, title: 'Build document summarization tool', type: 'coding' },
        { number: 3, title: 'Create ReAct agent loop', type: 'implementation' },
        { number: 4, title: 'Add error handling and retries', type: 'coding' },
        { number: 5, title: 'Optimize token usage', type: 'optimization' }
      ]
    },
    project: {
      slug: 'autonomous-task-agent',
      title: 'Autonomous Task Completion Agent',
      description: 'Build an agent that can autonomously complete multi-step tasks using custom tools',
      requirements: [
        'Implement ReAct agent architecture',
        'Build at least 3 custom tools (web search, calculator, file operations)',
        'Add tool error handling and validation',
        'Implement agent memory and context management',
        'Create observable agent traces',
        'Add safety controls (max iterations, cost limits)',
        'Build a simple UI to interact with the agent',
        'Write comprehensive tests for agent loops'
      ],
      successCriteria: [
        'Agent can successfully complete multi-step tasks',
        'Tools are called correctly with proper parameters',
        'Agent handles tool errors gracefully',
        'Agent stays within iteration and cost limits',
        'Full trace of agent reasoning is available',
        'UI clearly shows agent\'s thinking process',
        'Agent does not loop infinitely',
        'Test coverage above 80% for agent logic'
      ],
      hours: 10
    }
  },
  {
    weekNumber: 6,
    title: 'Observability + Production',
    description: 'Deploy AI systems with monitoring, caching, and reliability',
    objectives: [
      'Deploy production systems',
      'Implement monitoring',
      'Optimize performance'
    ],
    concepts: [
      { slug: 'observability-basics', title: 'Observability Basics for AI Systems', minutes: 30 },
      { slug: 'monitoring-ai-systems', title: 'Monitoring LLM Applications', minutes: 35 },
      { slug: 'performance-optimization', title: 'Performance Optimization & Caching', minutes: 40 },
      { slug: 'production-deployment', title: 'Production Deployment Best Practices', minutes: 35 }
    ],
    lab: {
      slug: 'production-monitoring',
      title: 'Production Monitoring Implementation',
      description: 'Implement comprehensive monitoring and caching for your AI application',
      exercises: [
        { number: 1, title: 'Set up LangSmith or Helicone', type: 'setup' },
        { number: 2, title: 'Implement cost tracking', type: 'coding' },
        { number: 3, title: 'Add semantic caching', type: 'coding' },
        { number: 4, title: 'Build alerting system', type: 'implementation' },
        { number: 5, title: 'Deploy to Vercel/Railway', type: 'deployment' }
      ]
    },
    project: {
      slug: 'production-ai-app',
      title: 'Production-Ready AI Application',
      description: 'Deploy a fully monitored, optimized AI application with caching and observability',
      requirements: [
        'LLM observability integration (LangSmith/Helicone)',
        'Cost tracking and budget alerts',
        'Semantic caching for common queries',
        'Performance monitoring dashboards',
        'Error tracking and alerting',
        'Production deployment (Vercel/Railway)',
        'Load testing and optimization',
        'Full documentation'
      ],
      successCriteria: [
        'Application deployed and publicly accessible',
        'All LLM calls are traced and monitored',
        'Caching reduces costs by 30%+',
        'Alerts trigger for errors and budget overruns',
        'Response time p95 < 2 seconds',
        'Application handles 100+ concurrent users',
        'Documentation includes runbooks'
      ],
      hours: 10
    }
  },
  {
    weekNumber: 7,
    title: 'Capstone Project',
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
  console.log('- 41 concepts')
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
