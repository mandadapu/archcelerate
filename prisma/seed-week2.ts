import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Week 2 curriculum data...')

  // Check if Week 2 already exists
  let week2 = await prisma.curriculumWeek.findUnique({
    where: { weekNumber: 2 }
  })

  if (!week2) {
    // Create Week 2 if it doesn't exist
    week2 = await prisma.curriculumWeek.create({
      data: {
        weekNumber: 2,
        title: 'Chat + Governance',
        description: 'Build production chat applications with proper governance and safety controls',
        objectives: [
          'Build scalable chat architecture',
          'Implement governance and safety',
          'Add production features'
        ],
        active: true,
      }
    })
    console.log('Created Week 2:', week2)
  } else {
    console.log('Week 2 already exists:', week2)
  }

  // Delete existing content for Week 2 (if any) to avoid duplicates
  await prisma.concept.deleteMany({
    where: { weekId: week2.id }
  })
  await prisma.lab.deleteMany({
    where: { weekId: week2.id }
  })
  await prisma.weekProject.deleteMany({
    where: { weekId: week2.id }
  })

  // Create Concepts
  const concepts = await Promise.all([
    prisma.concept.create({
      data: {
        weekId: week2.id,
        orderIndex: 1,
        slug: 'advanced-chat-architecture',
        title: 'Advanced Chat Architecture',
        contentPath: 'content/week2/advanced-chat-architecture.mdx',
        estimatedMinutes: 35,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week2.id,
        orderIndex: 2,
        slug: 'governance-foundations',
        title: 'Governance Foundations',
        contentPath: 'content/week2/governance-foundations.mdx',
        estimatedMinutes: 40,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week2.id,
        orderIndex: 3,
        slug: 'production-chat-features',
        title: 'Production Chat Features',
        contentPath: 'content/week2/production-chat-features.mdx',
        estimatedMinutes: 35,
      }
    }),
  ])

  console.log('Created concepts:', concepts.length)

  // Create Lab
  const lab = await prisma.lab.create({
    data: {
      weekId: week2.id,
      slug: 'chat-governance',
      title: 'Chat Application with Governance',
      description: 'Build a production chat application with proper governance controls',
      exercises: [
        { number: 1, title: 'Implement conversation persistence', type: 'coding' },
        { number: 2, title: 'Add content moderation', type: 'integration' },
        { number: 3, title: 'Implement rate limiting', type: 'coding' },
        { number: 4, title: 'Add cost tracking', type: 'implementation' },
        { number: 5, title: 'Create audit logging', type: 'coding' },
      ]
    }
  })

  console.log('Created lab:', lab)

  // Create Project
  const project = await prisma.weekProject.create({
    data: {
      weekId: week2.id,
      slug: 'production-chat-app',
      title: 'Production-Ready Chat Application',
      description: 'Build a fully-featured chat application with authentication, persistence, and governance',
      requirements: [
        'User authentication with next-auth',
        'Conversation persistence in database',
        'Real-time streaming responses',
        'Content moderation (OpenAI Moderations API)',
        'Rate limiting per user',
        'Cost tracking and budget alerts',
        'Conversation history UI',
        'Message export functionality',
      ],
      successCriteria: [
        'Users can create accounts and log in',
        'Conversations persist across sessions',
        'Streaming responses work smoothly',
        'Inappropriate content is blocked',
        'Users cannot exceed rate limits',
        'Cost per conversation is tracked',
        'Users can view and search conversation history',
        'Full test coverage for critical paths',
      ],
      estimatedHours: 8,
    }
  })

  console.log('Created project:', project)

  console.log('Week 2 seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
