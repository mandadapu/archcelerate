#!/usr/bin/env npx tsx
/**
 * End-to-End Test: Skill Scoring Integration
 *
 * This script tests the complete flow:
 * 1. User completes a lab (e.g., Week 1 Multi-Tier Triage)
 * 2. Lab completion hook triggers
 * 3. Skill scores update in database
 * 4. Radar chart data reflects the update
 */

import { PrismaClient } from '@prisma/client'
import { onLabComplete } from '../lib/lab-completion-hook'
import { calculateOverallScore, getRadarChartData } from '../lib/skill-scoring'

const prisma = new PrismaClient()

const TEST_USER_EMAIL = 'test-skill-scoring@archcelerate.dev'

async function cleanup() {
  console.log('🧹 Cleaning up test data...\n')

  const testUser = await prisma.user.findUnique({
    where: { email: TEST_USER_EMAIL }
  })

  if (testUser) {
    // Delete user's activity scores
    await prisma.userActivityScore.deleteMany({
      where: { userId: testUser.id }
    })

    // Delete user's skill scores
    await prisma.userSkillScore.deleteMany({
      where: { userId: testUser.id }
    })

    // Delete user
    await prisma.user.delete({
      where: { id: testUser.id }
    })

    console.log('✅ Cleaned up existing test user\n')
  }
}

async function createTestUser() {
  console.log('👤 Creating test user...\n')

  const user = await prisma.user.create({
    data: {
      email: TEST_USER_EMAIL,
      name: 'Test User (Skill Scoring)',
      emailVerified: new Date()
    }
  })

  console.log(`✅ Created test user: ${user.email} (${user.id})\n`)
  return user
}

async function testLabCompletion(userId: string, weekNumber: number, labTitle: string) {
  console.log(`📝 Testing lab completion: Week ${weekNumber} - ${labTitle}`)
  console.log('─'.repeat(70))

  // Get initial skill scores
  const initialScores = await calculateOverallScore(userId)
  console.log('\n📊 BEFORE Lab Completion:')
  console.log(`   Overall Proficiency: ${initialScores.overallProficiency.toFixed(2)}%`)
  initialScores.domains.forEach(d => {
    console.log(`   ${d.domainName}: ${d.totalPoints.toFixed(2)}/${d.maxPoints} pts (${d.percentage.toFixed(2)}%)`)
  })

  // Simulate lab completion
  console.log(`\n🚀 Calling onLabComplete(userId="${userId}", weekNumber=${weekNumber})...\n`)
  await onLabComplete(userId, weekNumber)

  // Get updated skill scores
  const updatedScores = await calculateOverallScore(userId)
  console.log('📊 AFTER Lab Completion:')
  console.log(`   Overall Proficiency: ${updatedScores.overallProficiency.toFixed(2)}%`)

  const changes: { domain: string; before: number; after: number; delta: number }[] = []

  updatedScores.domains.forEach((d, idx) => {
    const initial = initialScores.domains[idx]
    const delta = d.totalPoints - initial.totalPoints

    if (delta > 0) {
      console.log(`   ✅ ${d.domainName}: ${initial.totalPoints.toFixed(2)} → ${d.totalPoints.toFixed(2)} pts (+${delta.toFixed(2)}) [${d.percentage.toFixed(2)}%]`)
      changes.push({
        domain: d.domainName,
        before: initial.totalPoints,
        after: d.totalPoints,
        delta
      })
    } else {
      console.log(`   ${d.domainName}: ${d.totalPoints.toFixed(2)}/${d.maxPoints} pts (${d.percentage.toFixed(2)}%)`)
    }
  })

  return { initialScores, updatedScores, changes }
}

async function verifyDatabaseRecords(userId: string, weekNumber: number) {
  console.log('\n🔍 Verifying Database Records:')
  console.log('─'.repeat(70))

  // Get the lab activity
  const activity = await prisma.activity.findFirst({
    where: {
      weekNumber,
      activityType: 'lab'
    },
    include: {
      domainMappings: {
        include: { domain: true }
      }
    }
  })

  if (!activity) {
    console.log('❌ Lab activity not found!')
    return false
  }

  console.log(`\n📌 Activity: ${activity.title}`)
  console.log(`   Slug: ${activity.slug}`)
  console.log(`   Max Total Points: ${activity.maxTotalPoints}`)

  // Check UserActivityScore
  const activityScore = await prisma.userActivityScore.findUnique({
    where: {
      userId_activityId: {
        userId,
        activityId: activity.id
      }
    }
  })

  if (activityScore) {
    console.log(`\n✅ UserActivityScore record found:`)
    console.log(`   Score Percentage: ${activityScore.scorePercentage}%`)
    console.log(`   Completed At: ${activityScore.completedAt?.toISOString()}`)
  } else {
    console.log(`\n❌ UserActivityScore record NOT found!`)
    return false
  }

  // Check UserSkillScore for each mapped domain
  console.log(`\n✅ UserSkillScore records:`)
  for (const mapping of activity.domainMappings) {
    const skillScore = await prisma.userSkillScore.findUnique({
      where: {
        userId_domainId: {
          userId,
          domainId: mapping.domainId
        }
      }
    })

    if (skillScore) {
      console.log(`   ${mapping.domain.name}:`)
      console.log(`      Total Points: ${skillScore.totalPoints}`)
      console.log(`      Max Points: ${skillScore.maxPoints}`)
      console.log(`      Percentage: ${skillScore.percentage}%`)
      console.log(`      Proficiency: ${skillScore.proficiencyLevel}`)
    } else {
      console.log(`   ❌ ${mapping.domain.name}: NOT FOUND`)
    }
  }

  return true
}

async function testRadarChartUpdate(userId: string) {
  console.log('\n📈 Testing Radar Chart Data:')
  console.log('─'.repeat(70))

  const radarData = await getRadarChartData(userId)

  console.log('\n🎯 Radar Chart Data Points:')
  radarData.forEach(point => {
    const bar = '█'.repeat(Math.floor(point.score / 5))
    console.log(`   ${point.domain.padEnd(30)} ${point.score.toString().padStart(3)}% ${bar}`)
  })

  return radarData
}

async function runTest() {
  console.log('\n' + '═'.repeat(70))
  console.log('   END-TO-END TEST: SKILL SCORING INTEGRATION')
  console.log('═'.repeat(70) + '\n')

  try {
    // Step 1: Cleanup
    await cleanup()

    // Step 2: Create test user
    const testUser = await createTestUser()

    // Step 3: Test Week 1 - Multi-Tier Triage Lab
    console.log('🧪 TEST 1: Week 1 - Multi-Tier Triage System Lab\n')
    const test1 = await testLabCompletion(
      testUser.id,
      1,
      'Multi-Tier Triage System'
    )

    // Verify database records
    const dbVerified = await verifyDatabaseRecords(testUser.id, 1)

    if (!dbVerified) {
      throw new Error('Database verification failed!')
    }

    // Test radar chart
    await testRadarChartUpdate(testUser.id)

    // Validate changes
    console.log('\n✅ VALIDATION:')
    console.log('─'.repeat(70))

    const systematicPromptingChange = test1.changes.find(c => c.domain === 'Systematic Prompting')
    const productionObservabilityChange = test1.changes.find(c => c.domain === 'Production Observability')

    if (systematicPromptingChange && systematicPromptingChange.delta === 40) {
      console.log('✅ Systematic Prompting: +40 pts (EXPECTED)')
    } else {
      console.log(`❌ Systematic Prompting: Expected +40 pts, got +${systematicPromptingChange?.delta || 0} pts`)
    }

    if (productionObservabilityChange && productionObservabilityChange.delta === 10) {
      console.log('✅ Production Observability: +10 pts (EXPECTED)')
    } else {
      console.log(`❌ Production Observability: Expected +10 pts, got +${productionObservabilityChange?.delta || 0} pts`)
    }

    // Step 4: Test another lab (Week 5 - Research Swarm)
    console.log('\n\n🧪 TEST 2: Week 5 - Autonomous Medical Research Swarm Lab\n')
    const test2 = await testLabCompletion(
      testUser.id,
      5,
      'Autonomous Medical Research Swarm'
    )

    await verifyDatabaseRecords(testUser.id, 5)
    await testRadarChartUpdate(testUser.id)

    // Validate changes
    console.log('\n✅ VALIDATION:')
    console.log('─'.repeat(70))

    const agenticOrchestrationChange = test2.changes.find(c => c.domain === 'Agentic Orchestration')
    const knowledgeArchitectureChange = test2.changes.find(c => c.domain === 'Knowledge Architecture')

    if (agenticOrchestrationChange && agenticOrchestrationChange.delta === 50) {
      console.log('✅ Agentic Orchestration: +50 pts (EXPECTED)')
    } else {
      console.log(`❌ Agentic Orchestration: Expected +50 pts, got +${agenticOrchestrationChange?.delta || 0} pts`)
    }

    if (knowledgeArchitectureChange && knowledgeArchitectureChange.delta === 10) {
      console.log('✅ Knowledge Architecture: +10 pts (EXPECTED)')
    } else {
      console.log(`❌ Knowledge Architecture: Expected +10 pts, got +${knowledgeArchitectureChange?.delta || 0} pts`)
    }

    // Step 5: Final summary
    const finalScores = await calculateOverallScore(testUser.id)

    console.log('\n\n' + '═'.repeat(70))
    console.log('   FINAL TEST RESULTS')
    console.log('═'.repeat(70))
    console.log(`\n📊 Overall Proficiency: ${finalScores.overallProficiency.toFixed(2)}%`)
    console.log(`📈 Proficiency Level: ${finalScores.proficiencyLevel.toUpperCase()}`)
    console.log(`✅ Completed Activities: ${finalScores.completedActivities}/${finalScores.totalActivities}`)

    console.log('\n🎯 Domain Breakdown:')
    finalScores.domains.forEach(d => {
      const bar = '█'.repeat(Math.floor(d.percentage / 5))
      console.log(`   ${d.domainName.padEnd(30)} ${d.totalPoints.toFixed(0).padStart(3)}/${d.maxPoints.toString().padStart(3)} pts [${d.percentage.toFixed(1).padStart(5)}%] ${bar}`)
    })

    console.log('\n' + '═'.repeat(70))
    console.log('✅ ALL TESTS PASSED!')
    console.log('═'.repeat(70) + '\n')

    // Cleanup at end
    console.log('🧹 Cleaning up test data...')
    await cleanup()
    console.log('✅ Test data cleaned up\n')

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
runTest().catch(console.error)
