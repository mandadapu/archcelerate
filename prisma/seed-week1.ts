import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Week 1 curriculum data...')

  // Create or Update Week 1
  const week1 = await prisma.curriculumWeek.upsert({
    where: { weekNumber: 1 },
    update: {
      title: 'Foundations + Visual Builder Introduction',
      description: 'Understand LLM fundamentals, master API integration, experience visual agent building, and build production-ready chat assistant',
      objectives: [
        // Core Technical Understanding
        'Understand LLM fundamentals: tokenization, context windows, and model capabilities',
        'Master prompt engineering patterns: zero-shot, few-shot, chain-of-thought reasoning',
        'Learn API integration patterns: streaming responses, error handling, retry logic',
        'Experience visual agent building before coding to understand abstraction layers',

        // Architectural Decisions
        'Evaluate architecture choices: serverless vs long-running, synchronous vs streaming',
        'Design conversation state management: in-memory, database, or distributed cache',
        'Choose appropriate model tiers based on latency, cost, and quality trade-offs',
        'Implement rate limiting strategies to prevent abuse and control costs',

        // Security & Safety
        'Implement input validation and sanitization to prevent prompt injection attacks',
        'Add content filtering and guardrails to detect harmful or inappropriate outputs',
        'Secure API keys using environment variables and secret management',
        'Implement proper authentication and authorization for production deployments',

        // Production Considerations
        'Handle token limits and implement context window management strategies',
        'Implement error handling for API failures, rate limits, and timeouts',
        'Add comprehensive logging and monitoring for debugging and analytics',
        'Design graceful degradation when AI services are unavailable',

        // Cost & Performance
        'Understand pricing models: per-token costs, caching strategies, batch processing',
        'Optimize prompt design to reduce token usage without sacrificing quality',
        'Implement response caching for frequently asked questions',
        'Monitor and set budget alerts to prevent unexpected costs',

        // Domain-Specific Use Cases
        'Customer Support: Context-aware responses with conversation history',
        'Technical Documentation: Code generation and explanation capabilities',
        'Content Creation: SEO-friendly copy with brand voice consistency',
        'Data Analysis: Natural language queries to structured data insights',

        // Implementation Implications
        'Understand latency implications: real-time chat vs batch processing',
        'Consider compliance requirements: data retention, GDPR, user privacy',
        'Plan for scaling: connection pooling, load balancing, distributed systems',
        'Build production-ready chat assistant with all best practices integrated'
      ],
      active: true,
    },
    create: {
      weekNumber: 1,
      title: 'Foundations + Visual Builder Introduction',
      description: 'Understand LLM fundamentals, master API integration, experience visual agent building, and build production-ready chat assistant',
      objectives: [
        // Core Technical Understanding
        'Understand LLM fundamentals: tokenization, context windows, and model capabilities',
        'Master prompt engineering patterns: zero-shot, few-shot, chain-of-thought reasoning',
        'Learn API integration patterns: streaming responses, error handling, retry logic',
        'Experience visual agent building before coding to understand abstraction layers',

        // Architectural Decisions
        'Evaluate architecture choices: serverless vs long-running, synchronous vs streaming',
        'Design conversation state management: in-memory, database, or distributed cache',
        'Choose appropriate model tiers based on latency, cost, and quality trade-offs',
        'Implement rate limiting strategies to prevent abuse and control costs',

        // Security & Safety
        'Implement input validation and sanitization to prevent prompt injection attacks',
        'Add content filtering and guardrails to detect harmful or inappropriate outputs',
        'Secure API keys using environment variables and secret management',
        'Implement proper authentication and authorization for production deployments',

        // Production Considerations
        'Handle token limits and implement context window management strategies',
        'Implement error handling for API failures, rate limits, and timeouts',
        'Add comprehensive logging and monitoring for debugging and analytics',
        'Design graceful degradation when AI services are unavailable',

        // Cost & Performance
        'Understand pricing models: per-token costs, caching strategies, batch processing',
        'Optimize prompt design to reduce token usage without sacrificing quality',
        'Implement response caching for frequently asked questions',
        'Monitor and set budget alerts to prevent unexpected costs',

        // Domain-Specific Use Cases
        'Customer Support: Context-aware responses with conversation history',
        'Technical Documentation: Code generation and explanation capabilities',
        'Content Creation: SEO-friendly copy with brand voice consistency',
        'Data Analysis: Natural language queries to structured data insights',

        // Implementation Implications
        'Understand latency implications: real-time chat vs batch processing',
        'Consider compliance requirements: data retention, GDPR, user privacy',
        'Plan for scaling: connection pooling, load balancing, distributed systems',
        'Build production-ready chat assistant with all best practices integrated'
      ],
      active: true,
    }
  })

  console.log('Created Week 1:', week1)

  // Create Concepts
  const concepts = await Promise.all([
    prisma.concept.create({
      data: {
        weekId: week1.id,
        orderIndex: 1,
        slug: 'llm-fundamentals',
        title: 'LLM Fundamentals',
        contentPath: 'content/week1/llm-fundamentals.mdx',
        estimatedMinutes: 45,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week1.id,
        orderIndex: 2,
        slug: 'prompt-engineering',
        title: 'Prompt Engineering Mastery',
        contentPath: 'content/week1/prompt-engineering.mdx',
        estimatedMinutes: 60,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week1.id,
        orderIndex: 3,
        slug: 'api-integration',
        title: 'API Integration Patterns',
        contentPath: 'content/week1/api-integration.mdx',
        estimatedMinutes: 45,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week1.id,
        orderIndex: 4,
        slug: 'visual-builders',
        title: 'Visual Agent Builders',
        contentPath: 'content/week1/visual-builders.mdx',
        estimatedMinutes: 30,
      }
    }),
  ])

  console.log('Created concepts:', concepts.length)

  // Create Lab
  const lab = await prisma.lab.create({
    data: {
      weekId: week1.id,
      slug: 'visual-to-code',
      title: 'Visual Builder → Code Translation',
      description: 'Build a Q&A chatbot visually, then rebuild in code to understand abstraction layers',
      exercises: [
        { number: 1, title: 'Build Q&A chatbot in Flowise', type: 'visual' },
        { number: 2, title: 'Understand the flow', type: 'analysis' },
        { number: 3, title: 'Export to code', type: 'export' },
        { number: 4, title: 'Rebuild from scratch in code', type: 'coding' },
        { number: 5, title: 'Compare approaches', type: 'reflection' },
      ]
    }
  })

  console.log('Created lab:', lab)

  // Create Project
  const project = await prisma.weekProject.create({
    data: {
      weekId: week1.id,
      slug: 'chat-assistant-dual',
      title: 'Chat Assistant (Dual Implementation)',
      description: 'Build a conversational chat assistant with both visual and code implementations',
      requirements: [
        'Build visual prototype in Flowise/LangFlow',
        'Build production code version in TypeScript/Python',
        'Implement conversation history management',
        'Add basic guardrails (input validation, content filtering)',
        'Basic logging of all LLM calls',
        'Write comparison writeup',
        'Deploy application with UI',
      ],
      successCriteria: [
        'Multi-turn conversations work',
        'Context window managed properly',
        'Basic guardrails prevent misuse',
        'Both versions functionally equivalent',
        'Deployed and accessible',
      ],
      estimatedHours: 5,
    }
  })

  console.log('Created project:', project)

  console.log('✅ Week 1 seed complete!')
}

main()
  .catch((e) => {
    console.error('Error seeding Week 1:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
