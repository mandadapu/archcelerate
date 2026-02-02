import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Week 6 curriculum data...')

  // Check if Week 6 already exists
  let week6 = await prisma.curriculumWeek.findUnique({
    where: { weekNumber: 6 }
  })

  if (!week6) {
    // Create Week 6 if it doesn't exist
    week6 = await prisma.curriculumWeek.create({
      data: {
        weekNumber: 6,
        title: 'Observability + Production',
        description: 'Deploy AI systems with monitoring, caching, and reliability',
        objectives: [
          'Deploy production systems',
          'Implement monitoring',
          'Optimize performance'
        ],
        active: true,
      }
    })
    console.log('Created Week 6:', week6)
  } else {
    console.log('Week 6 already exists:', week6)
  }

  // Delete existing content for Week 6 (if any) to avoid duplicates
  await prisma.concept.deleteMany({
    where: { weekId: week6.id }
  })
  await prisma.lab.deleteMany({
    where: { weekId: week6.id }
  })
  await prisma.weekProject.deleteMany({
    where: { weekId: week6.id }
  })

  // Create Concepts
  const concepts = await Promise.all([
    prisma.concept.create({
      data: {
        weekId: week6.id,
        orderIndex: 1,
        slug: 'observability-basics',
        title: 'Observability Basics for AI Systems',
        contentPath: 'content/week6/observability-basics.mdx',
        estimatedMinutes: 30,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week6.id,
        orderIndex: 2,
        slug: 'monitoring-ai-systems',
        title: 'Monitoring LLM Applications',
        contentPath: 'content/week6/monitoring-ai-systems.mdx',
        estimatedMinutes: 35,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week6.id,
        orderIndex: 3,
        slug: 'performance-optimization',
        title: 'Performance Optimization & Caching',
        contentPath: 'content/week6/performance-optimization.mdx',
        estimatedMinutes: 40,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week6.id,
        orderIndex: 4,
        slug: 'production-deployment',
        title: 'Production Deployment Best Practices',
        contentPath: 'content/week6/production-deployment.mdx',
        estimatedMinutes: 35,
      }
    }),
  ])

  console.log('Created concepts:', concepts.length)

  // Create Lab
  const lab = await prisma.lab.create({
    data: {
      weekId: week6.id,
      slug: 'production-monitoring',
      title: 'Production Monitoring Implementation',
      description: 'Implement comprehensive monitoring and caching for your AI application',
      exercises: [
        { number: 1, title: 'Set up LangSmith or Helicone', type: 'setup' },
        { number: 2, title: 'Implement cost tracking', type: 'coding' },
        { number: 3, title: 'Add semantic caching', type: 'coding' },
        { number: 4, title: 'Create monitoring dashboard', type: 'implementation' },
        { number: 5, title: 'Set up cost alerts', type: 'configuration' },
      ]
    }
  })

  console.log('Created lab:', lab)

  // Create Project
  const project = await prisma.weekProject.create({
    data: {
      weekId: week6.id,
      slug: 'production-ready-deployment',
      title: 'Production-Ready AI Application',
      description: 'Deploy your AI application to production with monitoring, caching, and reliability features',
      requirements: [
        'Deploy to Vercel or Cloud Run',
        'Implement semantic caching with Redis',
        'Set up comprehensive monitoring (LangSmith/Helicone)',
        'Configure rate limiting and cost controls',
        'Create monitoring dashboard',
        'Implement error handling and retries',
        'Set up health checks',
        'Document deployment process',
      ],
      successCriteria: [
        'Application deployed and accessible via public URL',
        'Monitoring dashboard shows real-time metrics',
        'Cache hit rate above 50% for common queries',
        'Cost tracking accurately reports spending',
        'Rate limiting prevents API abuse',
        'Error handling gracefully manages LLM API failures',
        'Health check endpoint returns 200',
      ],
      estimatedHours: 6,
    }
  })

  console.log('Created project:', project)

  console.log('Week 6 seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
