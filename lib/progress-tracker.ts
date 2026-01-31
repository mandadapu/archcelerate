import { prisma } from '@/lib/db'
import { ProgressStatus, UserProgressData, ConceptProgress, SprintProgress } from '@/types/learning'
import { getSprintById, getSprintConcepts } from '@/lib/content-loader'

/**
 * Get user's progress for a specific concept
 */
export async function getConceptProgress(
  userId: string,
  sprintId: string,
  conceptId: string
): Promise<UserProgressData | null> {
  const progress = await prisma.userProgress.findUnique({
    where: {
      userId_sprintId_conceptId: {
        userId,
        sprintId,
        conceptId,
      },
    },
  })

  if (!progress) {
    return null
  }

  return {
    sprintId: progress.sprintId,
    conceptId: progress.conceptId,
    status: progress.status as ProgressStatus,
    startedAt: progress.startedAt || undefined,
    completedAt: progress.completedAt || undefined,
    lastAccessed: progress.lastAccessed,
  }
}

/**
 * Get all progress for a user in a sprint
 */
export async function getSprintProgress(
  userId: string,
  sprintId: string
): Promise<SprintProgress | null> {
  const sprint = await getSprintById(sprintId)
  if (!sprint) {
    return null
  }

  const concepts = await getSprintConcepts(sprintId)

  // Get all progress records for this sprint
  const progressRecords = await prisma.userProgress.findMany({
    where: {
      userId,
      sprintId,
    },
  })

  // Create a map for quick lookup
  const progressMap = new Map(
    progressRecords.map(p => [p.conceptId, p])
  )

  // Build concept progress array
  const conceptProgress: ConceptProgress[] = concepts.map(concept => {
    const progress = progressMap.get(concept.id)

    return {
      concept,
      sprintId,
      conceptId: concept.id,
      status: (progress?.status as ProgressStatus) || 'not_started',
      startedAt: progress?.startedAt || undefined,
      completedAt: progress?.completedAt || undefined,
      lastAccessed: progress?.lastAccessed || new Date(),
    }
  })

  // Calculate statistics
  const completedCount = conceptProgress.filter(
    cp => cp.status === 'completed'
  ).length
  const totalCount = concepts.length
  const percentComplete = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return {
    sprint,
    concepts: conceptProgress,
    completedCount,
    totalCount,
    percentComplete,
  }
}

/**
 * Track that a user viewed a concept (updates lastAccessed, creates if not exists)
 */
export async function trackConceptView(
  userId: string,
  sprintId: string,
  conceptId: string
): Promise<void> {
  const existing = await prisma.userProgress.findUnique({
    where: {
      userId_sprintId_conceptId: {
        userId,
        sprintId,
        conceptId,
      },
    },
  })

  if (existing) {
    // Update lastAccessed
    await prisma.userProgress.update({
      where: {
        userId_sprintId_conceptId: {
          userId,
          sprintId,
          conceptId,
        },
      },
      data: {
        lastAccessed: new Date(),
      },
    })
  } else {
    // Create new progress record as 'in_progress'
    await prisma.userProgress.create({
      data: {
        userId,
        sprintId,
        conceptId,
        status: 'in_progress',
        startedAt: new Date(),
        lastAccessed: new Date(),
      },
    })

    // Log learning event
    await prisma.learningEvent.create({
      data: {
        userId,
        eventType: 'concept.started',
        eventData: {
          sprintId,
          conceptId,
        } as any,
      },
    })
  }
}

/**
 * Mark a concept as completed
 */
export async function markConceptComplete(
  userId: string,
  sprintId: string,
  conceptId: string,
  timeSpentSeconds?: number
): Promise<void> {
  const now = new Date()

  // Update or create user progress
  await prisma.userProgress.upsert({
    where: {
      userId_sprintId_conceptId: {
        userId,
        sprintId,
        conceptId,
      },
    },
    create: {
      userId,
      sprintId,
      conceptId,
      status: 'completed',
      startedAt: now,
      completedAt: now,
      lastAccessed: now,
    },
    update: {
      status: 'completed',
      completedAt: now,
      lastAccessed: now,
    },
  })

  // Create concept completion record
  await prisma.conceptCompletion.create({
    data: {
      userId,
      sprintId,
      conceptId,
      timeSpentSeconds: timeSpentSeconds || 0,
      completedAt: now,
    },
  })

  // Log learning event
  await prisma.learningEvent.create({
    data: {
      userId,
      eventType: 'concept.completed',
      eventData: {
        sprintId,
        conceptId,
        timeSpentSeconds,
      } as any,
    },
  })
}

/**
 * Reset concept progress (for retaking)
 */
export async function resetConceptProgress(
  userId: string,
  sprintId: string,
  conceptId: string
): Promise<void> {
  await prisma.userProgress.update({
    where: {
      userId_sprintId_conceptId: {
        userId,
        sprintId,
        conceptId,
      },
    },
    data: {
      status: 'in_progress',
      completedAt: null,
      lastAccessed: new Date(),
    },
  })
}

/**
 * Get overall learning statistics for a user
 */
export async function getUserLearningStats(userId: string) {
  const [totalProgress, completedConcepts, totalTimeSpent] = await Promise.all([
    // Total concepts started or completed
    prisma.userProgress.count({
      where: {
        userId,
        status: { in: ['in_progress', 'completed'] },
      },
    }),

    // Completed concepts count
    prisma.userProgress.count({
      where: {
        userId,
        status: 'completed',
      },
    }),

    // Total time spent learning
    prisma.conceptCompletion.aggregate({
      where: { userId },
      _sum: {
        timeSpentSeconds: true,
      },
    }),
  ])

  return {
    conceptsStarted: totalProgress,
    conceptsCompleted: completedConcepts,
    totalTimeSpentSeconds: totalTimeSpent._sum.timeSpentSeconds || 0,
    totalTimeSpentHours: Math.floor((totalTimeSpent._sum.timeSpentSeconds || 0) / 3600),
  }
}

/**
 * Get user's recent learning activity
 */
export async function getRecentActivity(userId: string, limit = 5) {
  const recentProgress = await prisma.userProgress.findMany({
    where: { userId },
    orderBy: { lastAccessed: 'desc' },
    take: limit,
  })

  return recentProgress.map(p => ({
    sprintId: p.sprintId,
    conceptId: p.conceptId,
    status: p.status as ProgressStatus,
    lastAccessed: p.lastAccessed,
  }))
}

/**
 * Check if user has access to a concept (prerequisites met)
 */
export async function canAccessConcept(
  userId: string,
  sprintId: string,
  conceptId: string
): Promise<{ canAccess: boolean; reason?: string }> {
  const concepts = await getSprintConcepts(sprintId)
  const concept = concepts.find(c => c.id === conceptId)

  if (!concept) {
    return { canAccess: false, reason: 'Concept not found' }
  }

  // If no prerequisites, always accessible
  if (!concept.prerequisites || concept.prerequisites.length === 0) {
    return { canAccess: true }
  }

  // Check if all prerequisites are completed
  const prerequisiteProgress = await prisma.userProgress.findMany({
    where: {
      userId,
      sprintId,
      conceptId: { in: concept.prerequisites },
    },
  })

  const completedPrereqs = prerequisiteProgress.filter(
    p => p.status === 'completed'
  )

  if (completedPrereqs.length < concept.prerequisites.length) {
    return {
      canAccess: false,
      reason: 'Complete prerequisite concepts first',
    }
  }

  return { canAccess: true }
}
