import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  console.log('🔍 Verifying Industry-Specific Labs in GCloud\n')
  console.log('━'.repeat(60))

  const industryLabSlugs = [
    'w1-multi-tier-triage-lab',
    'w2-hipaa-gateway-lab',
    'w4-support-ticket-router-lab',
    'w5-research-swarm-lab',
    'w6-clinical-rag-lab',
    'w7-llm-judge-lab'
  ]

  const labs = await prisma.activity.findMany({
    where: {
      slug: { in: industryLabSlugs },
      activityType: 'lab'
    },
    include: {
      domainMappings: {
        include: { domain: true },
        orderBy: [
          { isPrimary: 'desc' },
          { maxPoints: 'desc' }
        ]
      }
    },
    orderBy: { weekNumber: 'asc' }
  })

  console.log(`\n✅ Found ${labs.length}/${industryLabSlugs.length} industry labs\n`)

  for (const lab of labs) {
    console.log(`📌 Week ${lab.weekNumber}: ${lab.title}`)
    console.log(`   Slug: ${lab.slug}`)
    console.log(`   Max Points: ${lab.maxTotalPoints}`)

    if (lab.domainMappings.length > 0) {
      console.log(`   Domain Mappings (${lab.domainMappings.length}):`)
      for (const mapping of lab.domainMappings) {
        const badge = mapping.isPrimary ? '🎯 PRIMARY' : '🔹 Secondary'
        console.log(`     ${badge} ${mapping.domain.name}: +${mapping.maxPoints} pts`)
      }
    } else {
      console.log(`   ⚠️  No domain mappings`)
    }
    console.log()
  }

  // Check which labs are missing
  const foundSlugs = labs.map(l => l.slug)
  const missingSlugs = industryLabSlugs.filter(slug => !foundSlugs.includes(slug))

  if (missingSlugs.length > 0) {
    console.log('⚠️  Missing labs:')
    missingSlugs.forEach(slug => console.log(`   - ${slug}`))
    console.log()
  }

  console.log('━'.repeat(60))

  if (labs.length === 6) {
    console.log('✅ All 6 industry-specific labs verified in GCloud!\n')
    process.exit(0)
  } else {
    console.log(`⚠️  Only ${labs.length}/6 labs found\n`)
    process.exit(1)
  }
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
