import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  try {
    const [weeks, concepts, labs, projects, domains, activities, mappings] = await Promise.all([
      prisma.curriculumWeek.count(),
      prisma.concept.count(),
      prisma.lab.count(),
      prisma.weekProject.count(),
      prisma.skillDomain.count(),
      prisma.activity.count(),
      prisma.activityDomainMapping.count()
    ])

    console.log('\n📊 Google Cloud Database Verification\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`✓ Curriculum Weeks:        ${weeks}`)
    console.log(`✓ Concepts:                ${concepts}`)
    console.log(`✓ Labs:                    ${labs}`)
    console.log(`✓ Projects:                ${projects}`)
    console.log(`✓ Skill Domains:           ${domains}`)
    console.log(`✓ Activities:              ${activities}`)
    console.log(`✓ Domain Mappings:         ${mappings}`)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Verify the 6 industry-specific labs
    const industryLabs = await prisma.activity.findMany({
      where: {
        activityType: 'lab',
        slug: {
          in: [
            'w1-multi-tier-triage-lab',
            'w2-hipaa-gateway-lab',
            'w4-support-router-lab',
            'w5-research-swarm-lab',
            'w6-clinical-rag-lab',
            'w7-llm-judge-lab'
          ]
        }
      },
      select: {
        weekNumber: true,
        slug: true,
        title: true
      },
      orderBy: { weekNumber: 'asc' }
    })

    console.log('🎯 Industry-Specific Labs:\n')
    if (industryLabs.length > 0) {
      industryLabs.forEach(lab => {
        console.log(`  Week ${lab.weekNumber}: ${lab.title}`)
      })
      console.log(`\n✅ Found ${industryLabs.length}/6 industry labs\n`)
    } else {
      console.log('  ⚠️ No industry-specific labs found\n')
    }

    console.log('✅ Verification complete!\n')
  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

verify().catch(console.error)
