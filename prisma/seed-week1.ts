import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Week 1 curriculum data...')

  // Create Week 1
  const week1 = await prisma.curriculumWeek.create({
    data: {
      weekNumber: 1,
      title: 'Foundations + Visual Builder Introduction',
      description: 'Understand LLM fundamentals, master API integration, experience visual agent building, and build production-ready chat assistant',
      objectives: [
        'Understand LLM fundamentals and prompt engineering',
        'Master API integration patterns',
        'Experience visual agent building before coding',
        'Build production-ready chat assistant'
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
