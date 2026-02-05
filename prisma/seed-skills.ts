import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// The 7 Core Technical Domains
const skillDomains = [
  {
    name: 'Systematic Prompting',
    slug: 'systematic-prompting',
    description: 'Master deterministic prompt design, CoT patterns, token optimization, and cost prediction. The foundation of reliable AI systems.',
    orderIndex: 1,
    maxPoints: 100
  },
  {
    name: 'Sovereign Governance',
    slug: 'sovereign-governance',
    description: 'Implement jailbreak defense, PII redaction, compliance automation, and VPC-hosted inference for data sovereignty.',
    orderIndex: 2,
    maxPoints: 100
  },
  {
    name: 'Knowledge Architecture',
    slug: 'knowledge-architecture',
    description: 'Build RAG systems with vector search, chunking strategies, source grounding, and RAGAS-validated quality metrics.',
    orderIndex: 3,
    maxPoints: 100
  },
  {
    name: 'Interface Engineering',
    slug: 'interface-engineering',
    description: 'Design schema-driven interfaces with function calling, self-healing JSON, and type-safe LLM-to-system integration.',
    orderIndex: 4,
    maxPoints: 100
  },
  {
    name: 'Agentic Orchestration',
    slug: 'agentic-orchestration',
    description: 'Orchestrate multi-agent systems with state persistence, memory trimming, and resilient coordination patterns.',
    orderIndex: 5,
    maxPoints: 100
  },
  {
    name: 'Retrieval Optimization',
    slug: 'retrieval-optimization',
    description: 'Optimize RAG with hybrid search, neural reranking, model routing, and context engineering for 80% cost savings.',
    orderIndex: 6,
    maxPoints: 100
  },
  {
    name: 'Production Observability',
    slug: 'production-observability',
    description: 'Deploy observable systems with traces, evaluations, regression testing, and prompt version control.',
    orderIndex: 7,
    maxPoints: 100
  }
]

// Activity definitions with domain mappings
// Based on SKILL_MAPPING_COMPLETE.md
const activities = [
  // Week 1
  {
    weekNumber: 1,
    activityType: 'lab',
    slug: 'w1-first-llm-app-lab',
    title: 'Build Your First LLM Application',
    description: 'Hands-on introduction to LLM APIs, streaming, and error handling',
    maxTotalPoints: 50,
    domainMappings: [
      {
        domainSlug: 'systematic-prompting',
        maxPoints: 30,
        isPrimary: true,
        description: 'Basic prompt construction and API integration patterns'
      },
      {
        domainSlug: 'interface-engineering',
        maxPoints: 15,
        isPrimary: false,
        description: 'JSON mode and basic structured output'
      },
      {
        domainSlug: 'production-observability',
        maxPoints: 5,
        isPrimary: false,
        description: 'Basic error handling and logging'
      }
    ]
  },
  {
    weekNumber: 1,
    activityType: 'project',
    slug: 'w1-chat-assistant-project',
    title: 'Production Chat Assistant',
    description: 'Build a production-ready chat assistant with streaming, rate limiting, and cost controls',
    maxTotalPoints: 100,
    domainMappings: [
      {
        domainSlug: 'systematic-prompting',
        maxPoints: 50,
        isPrimary: true,
        description: 'Deterministic prompting, token optimization, streaming implementation'
      },
      {
        domainSlug: 'sovereign-governance',
        maxPoints: 25,
        isPrimary: false,
        description: 'Input validation, rate limiting, basic safety controls'
      },
      {
        domainSlug: 'production-observability',
        maxPoints: 15,
        isPrimary: false,
        description: 'Error handling, logging, cost tracking'
      },
      {
        domainSlug: 'interface-engineering',
        maxPoints: 10,
        isPrimary: false,
        description: 'API design and response handling'
      }
    ]
  },
  // Week 2
  {
    weekNumber: 2,
    activityType: 'lab',
    slug: 'w2-governance-compliance-lab',
    title: 'Governance & Compliance Lab',
    description: 'Implement content moderation, fairness checks, and compliance controls',
    maxTotalPoints: 50,
    domainMappings: [
      {
        domainSlug: 'sovereign-governance',
        maxPoints: 40,
        isPrimary: true,
        description: 'Content moderation, fairness evaluation, audit logging'
      },
      {
        domainSlug: 'production-observability',
        maxPoints: 10,
        isPrimary: false,
        description: 'Audit trails and compliance monitoring'
      }
    ]
  },
  {
    weekNumber: 2,
    activityType: 'project',
    slug: 'w2-compliant-ai-system-project',
    title: 'Production AI System with Full Governance',
    description: 'Build GDPR/HIPAA-compliant AI with comprehensive governance and explainability',
    maxTotalPoints: 120,
    domainMappings: [
      {
        domainSlug: 'sovereign-governance',
        maxPoints: 80,
        isPrimary: true,
        description: 'Full governance stack: moderation, fairness, compliance, PII redaction'
      },
      {
        domainSlug: 'production-observability',
        maxPoints: 25,
        isPrimary: false,
        description: 'Audit logging, transparency dashboard, adversarial testing'
      },
      {
        domainSlug: 'systematic-prompting',
        maxPoints: 15,
        isPrimary: false,
        description: 'Bias detection in prompts and outputs'
      }
    ]
  },
  // Week 3
  {
    weekNumber: 3,
    activityType: 'lab',
    slug: 'w3-build-rag-system-lab',
    title: 'Build a RAG-Powered Q&A System',
    description: 'Implement vector search with document retrieval and source grounding',
    maxTotalPoints: 50,
    domainMappings: [
      {
        domainSlug: 'knowledge-architecture',
        maxPoints: 45,
        isPrimary: true,
        description: 'Vector embeddings, chunking, retrieval pipeline, source citations'
      },
      {
        domainSlug: 'retrieval-optimization',
        maxPoints: 5,
        isPrimary: false,
        description: 'Basic re-ranking and filtering'
      }
    ]
  },
  {
    weekNumber: 3,
    activityType: 'project',
    slug: 'w3-document-qa-system-project',
    title: 'Document Q&A System',
    description: 'Production RAG with RAGAS evaluation and multi-document querying',
    maxTotalPoints: 110,
    domainMappings: [
      {
        domainSlug: 'knowledge-architecture',
        maxPoints: 85,
        isPrimary: true,
        description: 'Complete RAG pipeline with RAGAS metrics and source grounding'
      },
      {
        domainSlug: 'retrieval-optimization',
        maxPoints: 15,
        isPrimary: false,
        description: 'Query optimization and retrieval quality'
      },
      {
        domainSlug: 'production-observability',
        maxPoints: 10,
        isPrimary: false,
        description: 'Quality metrics tracking and evaluation'
      }
    ]
  },
  // Week 4
  {
    weekNumber: 4,
    activityType: 'lab',
    slug: 'w4-support-ticket-router-lab',
    title: 'Support Ticket Router',
    description: 'Extract structured data and implement function calling for ticket routing',
    maxTotalPoints: 50,
    domainMappings: [
      {
        domainSlug: 'interface-engineering',
        maxPoints: 45,
        isPrimary: true,
        description: 'Structured output, function calling, schema validation with Zod'
      },
      {
        domainSlug: 'systematic-prompting',
        maxPoints: 15,
        isPrimary: false,
        description: 'Intent extraction and categorization prompts'
      },
      {
        domainSlug: 'agentic-orchestration',
        maxPoints: 10,
        isPrimary: false,
        description: 'Tool selection and multi-step orchestration'
      }
    ]
  },
  {
    weekNumber: 4,
    activityType: 'project',
    slug: 'w4-enterprise-orchestrator-project',
    title: 'Enterprise Support Orchestrator',
    description: 'Multi-tool workflow with inventory lookup, refund processing, and customer notification',
    maxTotalPoints: 120,
    domainMappings: [
      {
        domainSlug: 'interface-engineering',
        maxPoints: 90,
        isPrimary: true,
        description: 'Complex function calling, self-healing JSON, type-safe workflows'
      },
      {
        domainSlug: 'systematic-prompting',
        maxPoints: 15,
        isPrimary: false,
        description: 'Multi-intent parsing and routing logic'
      },
      {
        domainSlug: 'agentic-orchestration',
        maxPoints: 15,
        isPrimary: false,
        description: 'Multi-step orchestration with error routing'
      }
    ]
  },
  // Week 5
  {
    weekNumber: 5,
    activityType: 'lab',
    slug: 'w5-newsletter-team-lab',
    title: 'Auto-Research & Newsletter Team',
    description: 'Build multi-agent newsroom with Hunter, Fact-Checker, and Writer using Supervisor pattern',
    maxTotalPoints: 60,
    domainMappings: [
      {
        domainSlug: 'agentic-orchestration',
        maxPoints: 55,
        isPrimary: true,
        description: 'Supervisor pattern, state management, error routing, checkpointing'
      },
      {
        domainSlug: 'production-observability',
        maxPoints: 5,
        isPrimary: false,
        description: 'Agent coordination monitoring and debugging'
      }
    ]
  },
  {
    weekNumber: 5,
    activityType: 'project',
    slug: 'w5-full-stack-dev-team-project',
    title: 'Multi-Agent Full-Stack Development Team',
    description: 'Supervisor-orchestrated team with Frontend, Backend, and Database specialists',
    maxTotalPoints: 130,
    domainMappings: [
      {
        domainSlug: 'agentic-orchestration',
        maxPoints: 110,
        isPrimary: true,
        description: 'Complex multi-agent coordination, reflection, self-healing, cycle detection'
      },
      {
        domainSlug: 'interface-engineering',
        maxPoints: 10,
        isPrimary: false,
        description: 'MCP integration for external tools'
      },
      {
        domainSlug: 'production-observability',
        maxPoints: 10,
        isPrimary: false,
        description: 'Cost tracking, audit trails, token optimization'
      }
    ]
  },
  // Week 6
  {
    weekNumber: 6,
    activityType: 'lab',
    slug: 'w6-medical-records-navigator-lab',
    title: 'The Precision Retrieval Challenge',
    description: 'Build clinical search with hybrid retrieval and quantitative benchmarking',
    maxTotalPoints: 60,
    domainMappings: [
      {
        domainSlug: 'retrieval-optimization',
        maxPoints: 50,
        isPrimary: true,
        description: 'Hybrid search, parent-document retrieval, re-ranking, benchmarking'
      },
      {
        domainSlug: 'knowledge-architecture',
        maxPoints: 10,
        isPrimary: false,
        description: 'Advanced chunking and embedding strategies'
      }
    ]
  },
  {
    weekNumber: 6,
    activityType: 'project',
    slug: 'w6-enterprise-rag-system-project',
    title: 'Production RAG for Regulated Industry',
    description: 'HIPAA-compliant RAG with hybrid search, semantic caching, and <200ms latency',
    maxTotalPoints: 140,
    domainMappings: [
      {
        domainSlug: 'retrieval-optimization',
        maxPoints: 100,
        isPrimary: true,
        description: 'Hybrid search fusion, neural reranking, query transformation, caching'
      },
      {
        domainSlug: 'knowledge-architecture',
        maxPoints: 20,
        isPrimary: false,
        description: 'Advanced RAG architecture and evaluation'
      },
      {
        domainSlug: 'production-observability',
        maxPoints: 15,
        isPrimary: false,
        description: 'Performance metrics, load testing, audit logging'
      },
      {
        domainSlug: 'sovereign-governance',
        maxPoints: 5,
        isPrimary: false,
        description: 'HIPAA compliance and tenant isolation'
      }
    ]
  },
  // Week 7
  {
    weekNumber: 7,
    activityType: 'lab',
    slug: 'w7-production-dashboard-lab',
    title: 'Production Dashboard - Hardening for 24/7 Operations',
    description: 'Add observability, guardrails, and automated evaluation to Week 4 system',
    maxTotalPoints: 60,
    domainMappings: [
      {
        domainSlug: 'production-observability',
        maxPoints: 50,
        isPrimary: true,
        description: 'OpenTelemetry tracing, guardrails, automated evaluation, cost controls'
      },
      {
        domainSlug: 'sovereign-governance',
        maxPoints: 10,
        isPrimary: false,
        description: 'Input/output validation and safety guardrails'
      }
    ]
  },
  {
    weekNumber: 7,
    activityType: 'project',
    slug: 'w7-capstone-production-pilot-project',
    title: 'Capstone: The Production Pilot',
    description: 'Automated Compliance & Patient Support Agent with zero hallucinations',
    maxTotalPoints: 150,
    domainMappings: [
      {
        domainSlug: 'production-observability',
        maxPoints: 65,
        isPrimary: true,
        description: 'Full observability stack: traces, evaluations, LLM-as-a-Judge, circuit breakers'
      },
      {
        domainSlug: 'sovereign-governance',
        maxPoints: 30,
        isPrimary: false,
        description: 'Hard guardrails, audit trails, compliance verification'
      },
      {
        domainSlug: 'knowledge-architecture',
        maxPoints: 25,
        isPrimary: false,
        description: 'Advanced RAG with parent-document retrieval'
      },
      {
        domainSlug: 'agentic-orchestration',
        maxPoints: 20,
        isPrimary: false,
        description: 'Supervisor pattern with state reset and reflection'
      },
      {
        domainSlug: 'interface-engineering',
        maxPoints: 10,
        isPrimary: false,
        description: 'Structured audit logs with JSON schemas'
      }
    ]
  },
  // Week 8
  {
    weekNumber: 8,
    activityType: 'lab',
    slug: 'w8-portfolio-site-lab',
    title: 'Build Your Portfolio Site',
    description: 'Create professional portfolio showcasing all projects with case studies',
    maxTotalPoints: 50,
    domainMappings: [
      {
        domainSlug: 'systematic-prompting',
        maxPoints: 10,
        isPrimary: false,
        description: 'Technical writing and documentation'
      },
      {
        domainSlug: 'production-observability',
        maxPoints: 15,
        isPrimary: false,
        description: 'Performance metrics and analytics'
      },
      {
        domainSlug: 'knowledge-architecture',
        maxPoints: 10,
        isPrimary: false,
        description: 'Content organization and searchability'
      },
      {
        domainSlug: 'interface-engineering',
        maxPoints: 15,
        isPrimary: false,
        description: 'UI/UX design and responsive implementation'
      }
    ]
  },
  {
    weekNumber: 8,
    activityType: 'project',
    slug: 'w8-capstone-platform-project',
    title: 'The Capstone: Vertical AI Platform',
    description: 'Production-ready multi-tenant platform synthesizing all 7 domains',
    maxTotalPoints: 500,
    domainMappings: [
      {
        domainSlug: 'systematic-prompting',
        maxPoints: 60,
        isPrimary: true,
        description: 'Advanced prompt engineering and model routing decisions'
      },
      {
        domainSlug: 'sovereign-governance',
        maxPoints: 70,
        isPrimary: true,
        description: 'Full compliance stack with multi-tenant isolation'
      },
      {
        domainSlug: 'knowledge-architecture',
        maxPoints: 75,
        isPrimary: true,
        description: 'Production RAG architecture with RAGAS 1.0 faithfulness'
      },
      {
        domainSlug: 'interface-engineering',
        maxPoints: 65,
        isPrimary: true,
        description: 'Complex orchestration with type-safe tool integration'
      },
      {
        domainSlug: 'agentic-orchestration',
        maxPoints: 80,
        isPrimary: true,
        description: 'Multi-agent coordination with state persistence'
      },
      {
        domainSlug: 'retrieval-optimization',
        maxPoints: 75,
        isPrimary: true,
        description: 'Hybrid search with neural reranking and caching'
      },
      {
        domainSlug: 'production-observability',
        maxPoints: 75,
        isPrimary: true,
        description: 'Full observability, regression testing, golden datasets'
      }
    ]
  }
]

async function seedSkillDiagnosis() {
  console.log('🎯 Seeding Skill Diagnosis System...\n')

  // 1. Seed Skill Domains
  console.log('Creating 7 Skill Domains...')
  const createdDomains = new Map()

  for (const domain of skillDomains) {
    const created = await prisma.skillDomain.upsert({
      where: { slug: domain.slug },
      create: domain,
      update: {
        name: domain.name,
        description: domain.description,
        orderIndex: domain.orderIndex,
        maxPoints: domain.maxPoints
      }
    })
    createdDomains.set(domain.slug, created)
    console.log(`  ✓ ${created.name} (${created.slug})`)
  }

  console.log(`\n✅ Created ${skillDomains.length} skill domains\n`)

  // 2. Seed Activities and Domain Mappings
  console.log('Creating Activities and Domain Mappings...')
  let activityCount = 0
  let mappingCount = 0

  for (const activity of activities) {
    console.log(`\nWeek ${activity.weekNumber} - ${activity.activityType.toUpperCase()}: ${activity.title}`)

    // Create or update activity
    const createdActivity = await prisma.activity.upsert({
      where: { slug: activity.slug },
      create: {
        weekNumber: activity.weekNumber,
        activityType: activity.activityType,
        slug: activity.slug,
        title: activity.title,
        description: activity.description,
        maxTotalPoints: activity.maxTotalPoints
      },
      update: {
        title: activity.title,
        description: activity.description,
        maxTotalPoints: activity.maxTotalPoints
      }
    })
    activityCount++

    // Delete existing mappings for this activity
    await prisma.activityDomainMapping.deleteMany({
      where: { activityId: createdActivity.id }
    })

    // Create domain mappings
    for (const mapping of activity.domainMappings) {
      const domain = createdDomains.get(mapping.domainSlug)
      if (!domain) {
        console.error(`  ❌ Domain not found: ${mapping.domainSlug}`)
        continue
      }

      await prisma.activityDomainMapping.create({
        data: {
          activityId: createdActivity.id,
          domainId: domain.id,
          maxPoints: mapping.maxPoints,
          isPrimary: mapping.isPrimary,
          description: mapping.description
        }
      })
      mappingCount++

      const primaryLabel = mapping.isPrimary ? 'PRIMARY' : 'secondary'
      console.log(`  ✓ ${domain.name}: ${mapping.maxPoints} pts (${primaryLabel})`)
    }
  }

  console.log(`\n✅ Created ${activityCount} activities`)
  console.log(`✅ Created ${mappingCount} domain mappings`)

  // 3. Display Summary
  console.log('\n📊 Skill Diagnosis System Summary:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  for (const domain of skillDomains) {
    const mappings = await prisma.activityDomainMapping.count({
      where: { domain: { slug: domain.slug } }
    })
    const totalPoints = await prisma.activityDomainMapping.aggregate({
      where: { domain: { slug: domain.slug } },
      _sum: { maxPoints: true }
    })

    console.log(`\n${domain.name}:`)
    console.log(`  - Activities: ${mappings}`)
    console.log(`  - Total Points Available: ${totalPoints._sum.maxPoints || 0}`)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Skill Diagnosis System seeded successfully!')
}

async function main() {
  try {
    await seedSkillDiagnosis()
  } catch (error) {
    console.error('❌ Error seeding skill diagnosis:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
