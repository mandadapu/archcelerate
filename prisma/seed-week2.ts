import { PrismaClient } from '@prisma/client'
import { validateContentSync } from './lib/validate-content-sync'

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
        title: 'AI Governance & Responsible AI',
        description: 'Build production AI with proper governance, fairness, compliance, and safety controls',
        objectives: [
          'Implement AI governance and content moderation',
          'Build fair, transparent, and explainable AI systems',
          'Apply compliance patterns for regulated industries',
          'Test and validate AI systems with NFRs'
        ],
        active: true,
      }
    })
    console.log('Created Week 2:', week2)
  } else {
    // Update existing Week 2 with new structure
    week2 = await prisma.curriculumWeek.update({
      where: { weekNumber: 2 },
      data: {
        title: 'AI Governance & Responsible AI',
        description: 'Build production AI with proper governance, fairness, compliance, and safety controls',
        objectives: [
          'Implement AI governance and content moderation',
          'Build fair, transparent, and explainable AI systems',
          'Apply compliance patterns for regulated industries',
          'Test and validate AI systems with NFRs'
        ],
        active: true,
      }
    })
    console.log('Updated Week 2:', week2)
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
        slug: 'governance-frameworks',
        title: 'AI Governance & Shielding Frameworks',
        contentPath: 'content/week2/governance-frameworks.mdx',
        estimatedMinutes: 45,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week2.id,
        orderIndex: 2,
        slug: 'governance-foundations',
        title: 'AI Governance Foundations',
        contentPath: 'content/week2/governance-foundations.mdx',
        estimatedMinutes: 35,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week2.id,
        orderIndex: 3,
        slug: 'responsible-ai',
        title: 'Responsible AI: Bias Detection & Self-Correction Patterns',
        contentPath: 'content/week2/responsible-ai.mdx',
        estimatedMinutes: 60,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week2.id,
        orderIndex: 4,
        slug: 'compliance-patterns',
        title: 'Domain Compliance & Redaction',
        contentPath: 'content/week2/compliance-patterns.mdx',
        estimatedMinutes: 50,
      }
    }),
    prisma.concept.create({
      data: {
        weekId: week2.id,
        orderIndex: 5,
        slug: 'ai-testing-nfrs',
        title: 'Testing & Non-Functional Requirements',
        contentPath: 'content/week2/ai-testing-nfrs.mdx',
        estimatedMinutes: 55,
      }
    }),
  ])

  console.log('Created concepts:', concepts.length)

  // Create Lab
  const lab = await prisma.lab.create({
    data: {
      weekId: week2.id,
      slug: 'governance-compliance-lab',
      title: 'Governance & Compliance Lab',
      description: 'Implement governance controls, fairness checks, and compliance patterns in a production AI system',
      exercises: [
        { number: 1, title: 'Implement content moderation with OpenAI Moderations API', type: 'coding' },
        { number: 2, title: 'Add fairness evaluation for model outputs', type: 'implementation' },
        { number: 3, title: 'Build compliance audit logging', type: 'coding' },
        { number: 4, title: 'Create explainability dashboard', type: 'implementation' },
        { number: 5, title: 'Test with adversarial inputs', type: 'testing' },
      ]
    }
  })

  console.log('Created lab:', lab)

  // Create Project
  const project = await prisma.weekProject.create({
    data: {
      weekId: week2.id,
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
        'Transparency dashboard for stakeholders',
      ],
      successCriteria: [
        'All harmful content is filtered before processing',
        'Fairness metrics show <10% disparity across groups',
        'Complete audit trail for all AI decisions',
        'Users can understand why AI made specific decisions',
        'System passes adversarial testing',
        'Compliance requirements are met',
        'Cost controls prevent budget overruns',
        'Full documentation of governance controls',
      ],
      estimatedHours: 12,
    }
  })

  console.log('Created project:', project)

  console.log('Week 2 seeding completed!')

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
