import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Week 5 curriculum data...')

  // Check if Week 5 already exists
  let week5 = await prisma.curriculumWeek.findUnique({
    where: { weekNumber: 5 }
  })

  if (!week5) {
    // Create Week 5 if it doesn't exist
    week5 = await prisma.curriculumWeek.create({
      data: {
        weekNumber: 5,
        title: 'AI Agents',
        description: 'Build autonomous AI agents that can use tools and complete complex tasks',
        objectives: [
          'Understand agent architectures',
          'Build tool-using agents',
          'Debug and optimize agents'
        ],
        active: true,
      }
    })
    console.log('Created Week 5:', week5)
  } else {
    console.log('Week 5 already exists:', week5)
  }

  // Delete existing content for Week 5 (if any) to avoid duplicates
  await prisma.concept.deleteMany({
    where: { weekId: week5.id }
  })
  await prisma.lab.deleteMany({
    where: { weekId: week5.id }
  })
  await prisma.weekProject.deleteMany({
    where: { weekId: week5.id }
  })

  // Create Concepts
  const concepts = await Promise.all([
    prisma.concept.create({
      data: {
        weekId: week5.id,
        orderIndex: 1,
        slug: 'agent-fundamentals',
        title: 'Agent Fundamentals',
        contentPath: 'content/week5/agent-fundamentals.mdx',
        estimatedMinutes: 35,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week5.id,
        orderIndex: 2,
        slug: 'building-tools',
        title: 'Building Tools for Agents',
        contentPath: 'content/week5/building-tools.mdx',
        estimatedMinutes: 40,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week5.id,
        orderIndex: 3,
        slug: 'agent-debugging',
        title: 'Agent Debugging & Optimization',
        contentPath: 'content/week5/agent-debugging.mdx',
        estimatedMinutes: 45,
      }
    }),
  ])

  console.log('Created concepts:', concepts.length)

  // Create Lab
  const lab = await prisma.lab.create({
    data: {
      weekId: week5.id,
      slug: 'build-research-agent',
      title: 'Build a Research Agent',
      description: 'Create an autonomous agent that can research topics using web search and document analysis',
      exercises: [
        { number: 1, title: 'Implement web search tool', type: 'coding' },
        { number: 2, title: 'Build document summarization tool', type: 'coding' },
        { number: 3, title: 'Create ReAct agent loop', type: 'implementation' },
        { number: 4, title: 'Add error handling and retries', type: 'coding' },
        { number: 5, title: 'Optimize token usage', type: 'optimization' },
      ]
    }
  })

  console.log('Created lab:', lab)

  // Create Project
  const project = await prisma.weekProject.create({
    data: {
      weekId: week5.id,
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
        'Write comprehensive tests for agent loops',
      ],
      successCriteria: [
        'Agent can successfully complete multi-step tasks',
        'Tools are called correctly with proper parameters',
        'Agent handles tool errors gracefully',
        'Agent stays within iteration and cost limits',
        'Full trace of agent reasoning is available',
        'UI clearly shows agent\'s thinking process',
        'Agent does not loop infinitely',
        'Test coverage above 80% for agent logic',
      ],
      estimatedHours: 10,
    }
  })

  console.log('Created project:', project)

  console.log('Week 5 seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
