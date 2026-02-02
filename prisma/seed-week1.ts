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

  // Create or Update Concepts
  const concepts = await Promise.all([
    prisma.concept.upsert({
      where: { slug: 'llm-fundamentals' },
      update: {
        weekId: week1.id,
        orderIndex: 1,
        title: 'LLM Fundamentals',
        contentPath: 'content/week1/llm-fundamentals.mdx',
        estimatedMinutes: 45,
      },
      create: {
        weekId: week1.id,
        orderIndex: 1,
        slug: 'llm-fundamentals',
        title: 'LLM Fundamentals',
        contentPath: 'content/week1/llm-fundamentals.mdx',
        estimatedMinutes: 45,
      }
    }),
    prisma.concept.upsert({
      where: { slug: 'prompt-engineering' },
      update: {
        weekId: week1.id,
        orderIndex: 2,
        title: 'Prompt Engineering Mastery',
        contentPath: 'content/week1/prompt-engineering.mdx',
        estimatedMinutes: 60,
      },
      create: {
        weekId: week1.id,
        orderIndex: 2,
        slug: 'prompt-engineering',
        title: 'Prompt Engineering Mastery',
        contentPath: 'content/week1/prompt-engineering.mdx',
        estimatedMinutes: 60,
      }
    }),
    prisma.concept.upsert({
      where: { slug: 'api-integration' },
      update: {
        weekId: week1.id,
        orderIndex: 3,
        title: 'API Integration Patterns',
        contentPath: 'content/week1/api-integration.mdx',
        estimatedMinutes: 45,
      },
      create: {
        weekId: week1.id,
        orderIndex: 3,
        slug: 'api-integration',
        title: 'API Integration Patterns',
        contentPath: 'content/week1/api-integration.mdx',
        estimatedMinutes: 45,
      }
    }),
    prisma.concept.upsert({
      where: { slug: 'visual-builders' },
      update: {
        weekId: week1.id,
        orderIndex: 4,
        title: 'Visual Agent Builders',
        contentPath: 'content/week1/visual-builders.mdx',
        estimatedMinutes: 30,
      },
      create: {
        weekId: week1.id,
        orderIndex: 4,
        slug: 'visual-builders',
        title: 'Visual Agent Builders',
        contentPath: 'content/week1/visual-builders.mdx',
        estimatedMinutes: 30,
      }
    }),
    prisma.concept.upsert({
      where: { slug: 'architecture-decisions' },
      update: {
        weekId: week1.id,
        orderIndex: 5,
        title: 'AI Architecture & Design Patterns',
        contentPath: 'content/week1/architecture-decisions.mdx',
        estimatedMinutes: 50,
      },
      create: {
        weekId: week1.id,
        orderIndex: 5,
        slug: 'architecture-decisions',
        title: 'AI Architecture & Design Patterns',
        contentPath: 'content/week1/architecture-decisions.mdx',
        estimatedMinutes: 50,
      }
    }),
    prisma.concept.upsert({
      where: { slug: 'security-safety' },
      update: {
        weekId: week1.id,
        orderIndex: 6,
        title: 'Security & Safety in AI Systems',
        contentPath: 'content/week1/security-safety.mdx',
        estimatedMinutes: 40,
      },
      create: {
        weekId: week1.id,
        orderIndex: 6,
        slug: 'security-safety',
        title: 'Security & Safety in AI Systems',
        contentPath: 'content/week1/security-safety.mdx',
        estimatedMinutes: 40,
      }
    }),
    prisma.concept.upsert({
      where: { slug: 'production-deployment' },
      update: {
        weekId: week1.id,
        orderIndex: 7,
        title: 'Production Deployment & Operations',
        contentPath: 'content/week1/production-deployment.mdx',
        estimatedMinutes: 55,
      },
      create: {
        weekId: week1.id,
        orderIndex: 7,
        slug: 'production-deployment',
        title: 'Production Deployment & Operations',
        contentPath: 'content/week1/production-deployment.mdx',
        estimatedMinutes: 55,
      }
    }),
    prisma.concept.upsert({
      where: { slug: 'cost-performance' },
      update: {
        weekId: week1.id,
        orderIndex: 8,
        title: 'Cost Optimization & Performance',
        contentPath: 'content/week1/cost-performance.mdx',
        estimatedMinutes: 45,
      },
      create: {
        weekId: week1.id,
        orderIndex: 8,
        slug: 'cost-performance',
        title: 'Cost Optimization & Performance',
        contentPath: 'content/week1/cost-performance.mdx',
        estimatedMinutes: 45,
      }
    }),
  ])

  console.log('Created concepts:', concepts.length)

  // Create or Update Lab
  const lab = await prisma.lab.upsert({
    where: { slug: 'visual-to-code' },
    update: {
      weekId: week1.id,
      title: 'Visual Builder → Code Translation',
      description: 'Build a Q&A chatbot visually, then rebuild in code to understand abstraction layers',
      exercises: [
        { number: 1, title: 'Build Q&A chatbot in Flowise', type: 'visual' },
        { number: 2, title: 'Understand the flow', type: 'analysis' },
        { number: 3, title: 'Export to code', type: 'export' },
        { number: 4, title: 'Rebuild from scratch in code', type: 'coding' },
        { number: 5, title: 'Compare approaches', type: 'reflection' },
      ]
    },
    create: {
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

  // Create or Update Second Lab - Cost & Performance Analysis
  const lab2 = await prisma.lab.upsert({
    where: { slug: 'cost-performance-lab' },
    update: {
      weekId: week1.id,
      title: 'Cost & Performance Analysis',
      description: 'Master token counting, cost estimation, and model comparison through hands-on exercises',
      exercises: [
        {
          number: 1,
          title: 'Token Counting Exercise',
          type: 'coding',
          guidance: 'Use the Anthropic API tokenizer to count tokens in different text types. Compare: short chat messages (10-50 tokens), technical documentation (500-1000 tokens), and long-form content (2000+ tokens). Learn how different content types affect token counts.',
          steps: [
            'Install the Anthropic SDK: npm install @anthropic-ai/sdk',
            'Use the count_tokens API to analyze sample texts',
            'Create a comparison table: text type, character count, token count, ratio',
            'Test edge cases: code snippets, markdown, special characters',
            'Document patterns: which content is most token-efficient?'
          ]
        },
        {
          number: 2,
          title: 'Cost Calculation Exercise',
          type: 'analysis',
          guidance: 'Estimate real-world costs for a customer support chatbot handling 10,000 conversations/month. Use Claude Sonnet pricing: $3/million input tokens, $15/million output tokens.',
          steps: [
            'Define conversation profile: average 5 turns, 100 tokens input/turn, 150 tokens output/turn',
            'Calculate monthly tokens: 10k conversations × 5 turns × 250 tokens = 12.5M tokens',
            'Split input/output: 5M input ($15), 7.5M output ($112.50) = $127.50/month',
            'Add 20% buffer for system prompts and context = ~$150/month',
            'Create cost breakdown spreadsheet with different volume scenarios',
            'Identify cost optimization opportunities (caching, prompt compression)'
          ]
        },
        {
          number: 3,
          title: 'Model Comparison Exercise',
          type: 'coding',
          guidance: 'Send the same prompt to Claude Haiku, Sonnet, and Opus. Measure quality, speed, and cost trade-offs to make informed model selection decisions.',
          steps: [
            'Create test prompt: "Explain quantum computing to a 10-year-old in 3 paragraphs"',
            'Build comparison script that calls all 3 models with same prompt',
            'Measure: response time (latency), token count, cost per request',
            'Evaluate quality: accuracy, clarity, completeness (subjective 1-10 rating)',
            'Create comparison matrix: Model | Speed | Cost | Quality | Use Case',
            'Document decision framework: when to use each model tier'
          ]
        },
        {
          number: 4,
          title: 'Prompt Optimization for Cost',
          type: 'coding',
          guidance: 'Take a verbose prompt and optimize it to reduce tokens by 30% without sacrificing output quality.',
          steps: [
            'Start with verbose prompt (200+ tokens)',
            'Apply optimization techniques: remove redundancy, use abbreviations, compress instructions',
            'Test both versions with same inputs, compare outputs',
            'Measure token savings and quality delta',
            'Calculate monthly cost savings at scale (10k requests/month)',
            'Document optimization patterns that maintain quality'
          ]
        }
      ]
    },
    create: {
      weekId: week1.id,
      slug: 'cost-performance-lab',
      title: 'Cost & Performance Analysis',
      description: 'Master token counting, cost estimation, and model comparison through hands-on exercises',
      exercises: [
        {
          number: 1,
          title: 'Token Counting Exercise',
          type: 'coding',
          guidance: 'Use the Anthropic API tokenizer to count tokens in different text types. Compare: short chat messages (10-50 tokens), technical documentation (500-1000 tokens), and long-form content (2000+ tokens). Learn how different content types affect token counts.',
          steps: [
            'Install the Anthropic SDK: npm install @anthropic-ai/sdk',
            'Use the count_tokens API to analyze sample texts',
            'Create a comparison table: text type, character count, token count, ratio',
            'Test edge cases: code snippets, markdown, special characters',
            'Document patterns: which content is most token-efficient?'
          ]
        },
        {
          number: 2,
          title: 'Cost Calculation Exercise',
          type: 'analysis',
          guidance: 'Estimate real-world costs for a customer support chatbot handling 10,000 conversations/month. Use Claude Sonnet pricing: $3/million input tokens, $15/million output tokens.',
          steps: [
            'Define conversation profile: average 5 turns, 100 tokens input/turn, 150 tokens output/turn',
            'Calculate monthly tokens: 10k conversations × 5 turns × 250 tokens = 12.5M tokens',
            'Split input/output: 5M input ($15), 7.5M output ($112.50) = $127.50/month',
            'Add 20% buffer for system prompts and context = ~$150/month',
            'Create cost breakdown spreadsheet with different volume scenarios',
            'Identify cost optimization opportunities (caching, prompt compression)'
          ]
        },
        {
          number: 3,
          title: 'Model Comparison Exercise',
          type: 'coding',
          guidance: 'Send the same prompt to Claude Haiku, Sonnet, and Opus. Measure quality, speed, and cost trade-offs to make informed model selection decisions.',
          steps: [
            'Create test prompt: "Explain quantum computing to a 10-year-old in 3 paragraphs"',
            'Build comparison script that calls all 3 models with same prompt',
            'Measure: response time (latency), token count, cost per request',
            'Evaluate quality: accuracy, clarity, completeness (subjective 1-10 rating)',
            'Create comparison matrix: Model | Speed | Cost | Quality | Use Case',
            'Document decision framework: when to use each model tier'
          ]
        },
        {
          number: 4,
          title: 'Prompt Optimization for Cost',
          type: 'coding',
          guidance: 'Take a verbose prompt and optimize it to reduce tokens by 30% without sacrificing output quality.',
          steps: [
            'Start with verbose prompt (200+ tokens)',
            'Apply optimization techniques: remove redundancy, use abbreviations, compress instructions',
            'Test both versions with same inputs, compare outputs',
            'Measure token savings and quality delta',
            'Calculate monthly cost savings at scale (10k requests/month)',
            'Document optimization patterns that maintain quality'
          ]
        }
      ]
    }
  })

  console.log('Created second lab:', lab2)

  // Create or Update Project
  const project = await prisma.weekProject.upsert({
    where: { slug: 'chat-assistant-dual' },
    update: {
      weekId: week1.id,
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
    },
    create: {
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
