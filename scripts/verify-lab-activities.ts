import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const labSlugs = [
    'w1-multi-tier-triage-lab',
    'w2-hipaa-gateway-lab',
    'w4-support-ticket-router-lab',
    'w5-research-swarm-lab',
    'w6-clinical-rag-lab',
    'w7-llm-judge-lab'
  ]

  console.log('🔍 Verifying lab activities in database...\n')

  for (const slug of labSlugs) {
    const activity = await prisma.activity.findFirst({
      where: { slug },
      include: {
        domainMappings: {
          include: {
            domain: true
          }
        }
      }
    })

    if (activity) {
      console.log(`✅ ${slug}`)
      console.log(`   Title: ${activity.title}`)
      console.log(`   Week: ${activity.weekNumber}`)
      console.log(`   Max Points: ${activity.maxTotalPoints}`)
      console.log(`   Domain Mappings: ${activity.domainMappings.length}`)
      activity.domainMappings.forEach(dm => {
        console.log(`     - ${dm.domain.name}: ${dm.maxPoints} pts (${dm.isPrimary ? 'PRIMARY' : 'secondary'})`)
      })
      console.log()
    } else {
      console.log(`❌ ${slug} - NOT FOUND\n`)
    }
  }

  await prisma.$disconnect()
}

main().catch(console.error)
