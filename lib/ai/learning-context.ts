import { prisma } from '@/lib/db'
import { LearningContext } from '@/types/context'
import { getSprintById, getConceptMetadata } from '@/lib/content-loader'

export async function getLearningContext(
  userId: string,
  sprintId?: string,
  conceptId?: string
): Promise<LearningContext> {
  const context: LearningContext = {}

  // Get current sprint progress if specified
  if (sprintId) {
    const sprint = await getSprintById(sprintId)

    if (sprint) {
      // Get user's progress for this sprint
      const progressRecords = await prisma.userProgress.findMany({
        where: {
          userId,
          sprintId,
          status: 'completed',
        },
        select: {
          conceptId: true,
        },
      })

      const conceptsCompleted = progressRecords.map(p => p.conceptId)

      context.currentSprint = {
        id: sprintId,
        title: sprint.title,
        conceptsCompleted,
        conceptsTotal: sprint.concepts.length,
        percentComplete: Math.round(
          (conceptsCompleted.length / sprint.concepts.length) * 100
        ),
      }
    }
  }

  // Get current concept details if specified
  if (sprintId && conceptId) {
    const conceptMeta = await getConceptMetadata(sprintId, conceptId)
    if (conceptMeta) {
      context.currentConcept = {
        id: conceptMeta.id,
        title: conceptMeta.title,
        tags: conceptMeta.tags || [],
        order: conceptMeta.order,
      }
    }
  }

  // Get recently completed concepts
  const recentCompletions = await prisma.conceptCompletion.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    take: 5,
    select: {
      conceptId,
      sprintId,
      completedAt: true,
    },
  })

  if (recentCompletions.length > 0) {
    const recentWithTitles = await Promise.all(
      recentCompletions.map(async (c) => {
        const conceptMeta = await getConceptMetadata(c.sprintId, c.conceptId)
        return {
          id: c.conceptId,
          title: conceptMeta?.title || c.conceptId,
          completedAt: c.completedAt.toISOString(),
        }
      })
    )
    context.recentConcepts = recentWithTitles
  }

  // Get skill scores from diagnosis
  const diagnosis = await prisma.skillDiagnosis.findUnique({
    where: { userId },
    select: {
      skillScores: true,
      recommendedPath: true,
    },
  })

  if (diagnosis) {
    context.skillScores = diagnosis.skillScores as Record<string, number>
    context.recommendedPath = diagnosis.recommendedPath

    // Identify struggling areas (scores < 0.5)
    const scores = diagnosis.skillScores as Record<string, number>
    context.strugglingAreas = Object.entries(scores)
      .filter(([_, score]) => score < 0.5)
      .map(([area, _]) => area)
  }

  return context
}

export function formatLearningContextForPrompt(context: LearningContext): string {
  const parts: string[] = []

  if (context.currentSprint) {
    parts.push(`Current Sprint: ${context.currentSprint.title}`)
    parts.push(
      `Progress: ${context.currentSprint.conceptsCompleted.length}/${context.currentSprint.conceptsTotal} concepts completed (${context.currentSprint.percentComplete}%)`
    )
  }

  if (context.currentConcept) {
    parts.push(
      `Current Lesson: ${context.currentConcept.title} (${context.currentConcept.tags.join(', ')})`
    )
  }

  if (context.recentConcepts && context.recentConcepts.length > 0) {
    parts.push(
      `Recently Completed: ${context.recentConcepts.map(c => c.title).join(', ')}`
    )
  }

  if (context.strugglingAreas && context.strugglingAreas.length > 0) {
    parts.push(`Areas for improvement: ${context.strugglingAreas.join(', ')}`)
  }

  if (context.recommendedPath) {
    parts.push(`Learning Path: ${context.recommendedPath}`)
  }

  return parts.join('\n')
}
