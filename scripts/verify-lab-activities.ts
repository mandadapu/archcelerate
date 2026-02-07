import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n📊 Verifying Lab Activities for Industry Scenarios\n')
  console.log('━'.repeat(80))

  // Check lab activities for weeks 1, 2, 4, 5, 6, 7
  const labs = await prisma.activity.findMany({
    where: {
      activityType: 'lab',
      weekNumber: { in: [1, 2, 4, 5, 6, 7] }
    },
    include: {
      domainMappings: {
        include: {
          domain: true
        },
        orderBy: [
          { isPrimary: 'desc' },
          { maxPoints: 'desc' }
        ]
      }
    },
    orderBy: { weekNumber: 'asc' }
  })

  console.log(`\n✅ Found ${labs.length} lab activities\n`)

  let totalMappings = 0
  let errorCount = 0

  for (const lab of labs) {
    console.log(`📌 Week ${lab.weekNumber}: ${lab.title}`)
    console.log(`   Slug: ${lab.slug}`)
    console.log(`   Max Points: ${lab.maxTotalPoints}`)

    if (lab.domainMappings.length > 0) {
      console.log(`   Domain Mappings (${lab.domainMappings.length}):`)
      for (const mapping of lab.domainMappings) {
        const badge = mapping.isPrimary ? '🎯 PRIMARY' : '🔹 Secondary'
        console.log(`     ${badge} ${mapping.domain.name}: +${mapping.maxPoints} pts`)
        totalMappings++
      }
    } else {
      console.log(`   ⚠️  No domain mappings found`)
      errorCount++
    }
    console.log()
  }

  console.log('━'.repeat(80))
  console.log(`\n📈 Summary:`)
  console.log(`   Total Labs: ${labs.length}`)
  console.log(`   Total Domain Mappings: ${totalMappings}`)
  console.log(`   Labs without Mappings: ${errorCount}`)

  if (errorCount === 0 && labs.length === 6) {
    console.log(`\n✅ All industry scenario labs verified successfully!\n`)
  } else {
    console.log(`\n⚠️  Some labs are missing or have no mappings\n`)
  }

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
