import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { executeCode } from '@/lib/sandbox/client'
import { NextResponse } from 'next/server'
import { updateUserSkillScores } from '@/lib/skill-scoring'

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { sprintId, conceptId, labSlug, code, testCases } = await request.json()

    // Run test cases
    const results = []
    for (const test of testCases) {
      const testCode = `${code}\n\nconsole.log(${test.input})`
      const result = await executeCode(testCode)

      const passed = result.output.trim() === test.expectedOutput.trim()
      results.push({ ...test, passed, actualOutput: result.output })
    }

    const allPassed = results.every(r => r.passed)
    const failedCount = results.filter(r => !r.passed).length

    // Store attempt
    await prisma.labAttempt.create({
      data: {
        userId: user.id,
        labId: labSlug,
        sprintId,
        conceptId,
        passed: allPassed,
        score: allPassed ? 100 : Math.round(((testCases.length - failedCount) / testCases.length) * 100),
        feedback: results as any,
      },
    })

    // Log event if passed
    if (allPassed) {
      await prisma.learningEvent.create({
        data: {
          userId: user.id,
          eventType: 'lab.completed',
          eventData: {
            sprint_id: sprintId,
            concept_id: conceptId,
            lab_slug: labSlug,
          } as any,
        },
      })

      // Update skill scores for lab completion
      // Find the activity by lab slug to get the correct week/activity mapping
      const activity = await prisma.activity.findFirst({
        where: {
          slug: labSlug,
          activityType: 'lab'
        }
      })

      if (activity) {
        // Update skill scores with 100% completion
        // This automatically distributes points to all mapped skill domains
        await updateUserSkillScores(user.id, activity.id, 100)
        console.log(`✅ Skill scores updated for user ${user.id}, lab ${labSlug}`)
      }
    }

    return NextResponse.json({
      passed: allPassed,
      failedCount,
      results,
      feedback: allPassed
        ? 'All tests passed! Great work.'
        : `${failedCount} test(s) failed. Check the expected vs actual outputs.`,
    })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json(
      { error: 'Submission failed' },
      { status: 500 }
    )
  }
}
