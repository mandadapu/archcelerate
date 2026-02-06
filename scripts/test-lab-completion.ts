import { PrismaClient } from '@prisma/client'
import { updateUserSkillScores } from '../lib/skill-scoring'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing Week 1 Lab Completion and Skill Score Update\n')

  // Step 1: Get or create a test user
  const testEmail = 'test-lab-completion@archcelerate.com'
  let user = await prisma.user.findUnique({
    where: { email: testEmail }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test User (Lab Completion)'
      }
    })
    console.log(`✅ Created test user: ${user.email}`)
  } else {
    console.log(`✅ Using existing test user: ${user.email}`)
  }

  // Step 2: Get the Week 1 Multi-Tier Triage lab activity
  const activity = await prisma.activity.findFirst({
    where: {
      slug: 'w1-multi-tier-triage-lab',
      activityType: 'lab'
    },
    include: {
      domainMappings: {
        include: {
          domain: true
        }
      }
    }
  })

  if (!activity) {
    console.log('❌ Activity not found: w1-multi-tier-triage-lab')
    return
  }

  console.log(`\n📚 Lab Activity: ${activity.title}`)
  console.log(`   Slug: ${activity.slug}`)
  console.log(`   Max Points: ${activity.maxTotalPoints}`)
  console.log(`   Domain Mappings:`)
  activity.domainMappings.forEach(dm => {
    console.log(`     - ${dm.domain.name}: ${dm.maxPoints} pts (${dm.isPrimary ? 'PRIMARY' : 'secondary'})`)
  })

  // Step 3: Get skill scores BEFORE lab completion
  const scoresBefore = await prisma.userSkillScore.findMany({
    where: { userId: user.id },
    include: { domain: true },
    orderBy: { domain: { orderIndex: 'asc' } }
  })

  console.log(`\n📊 Skill Scores BEFORE Lab Completion:`)
  if (scoresBefore.length === 0) {
    console.log(`   (No scores yet - will be initialized)`)
  } else {
    scoresBefore.forEach(score => {
      console.log(`   ${score.domain.name}: ${score.totalPoints}/${score.maxPoints} pts (${score.percentage.toFixed(1)}%)`)
    })
  }

  // Step 4: Simulate lab completion by calling updateUserSkillScores
  console.log(`\n🎯 Simulating lab completion (100% score)...`)
  await updateUserSkillScores(user.id, activity.id, 100)

  // Step 5: Get skill scores AFTER lab completion
  const scoresAfter = await prisma.userSkillScore.findMany({
    where: { userId: user.id },
    include: { domain: true },
    orderBy: { domain: { orderIndex: 'asc' } }
  })

  console.log(`\n📊 Skill Scores AFTER Lab Completion:`)
  scoresAfter.forEach(score => {
    const before = scoresBefore.find(s => s.domainId === score.domainId)
    const diff = score.totalPoints - (before?.totalPoints || 0)
    const diffStr = diff > 0 ? ` (+${diff})` : ''
    console.log(`   ${score.domain.name}: ${score.totalPoints}/${score.maxPoints} pts (${score.percentage.toFixed(1)}%)${diffStr}`)
  })

  // Step 6: Verify the expected increases
  console.log(`\n✅ Verification:`)
  const systematicPrompting = scoresAfter.find(s => s.domain.slug === 'systematic-prompting')
  const productionObservability = scoresAfter.find(s => s.domain.slug === 'production-observability')

  const systematicBefore = scoresBefore.find(s => s.domain.slug === 'systematic-prompting')
  const observabilityBefore = scoresBefore.find(s => s.domain.slug === 'production-observability')

  const systematicIncrease = (systematicPrompting?.totalPoints || 0) - (systematicBefore?.totalPoints || 0)
  const observabilityIncrease = (productionObservability?.totalPoints || 0) - (observabilityBefore?.totalPoints || 0)

  if (systematicIncrease === 40) {
    console.log(`   ✅ Systematic Prompting increased by 40 pts (expected)`)
  } else {
    console.log(`   ❌ Systematic Prompting increased by ${systematicIncrease} pts (expected 40)`)
  }

  if (observabilityIncrease === 10) {
    console.log(`   ✅ Production Observability increased by 10 pts (expected)`)
  } else {
    console.log(`   ❌ Production Observability increased by ${observabilityIncrease} pts (expected 10)`)
  }

  console.log(`\n🎉 Test Complete!`)

  await prisma.$disconnect()
}

main().catch(console.error)
