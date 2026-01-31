import { prisma } from '@/lib/db'

export async function trackMentorQuestion(
  userId: string,
  question: string,
  context: {
    sprintId?: string
    conceptId?: string
    conversationId: string
  }
) {
  await prisma.learningEvent.create({
    data: {
      userId,
      eventType: 'mentor.question_asked',
      eventData: {
        question_length: question.length,
        sprint_id: context.sprintId,
        concept_id: context.conceptId,
        conversation_id: context.conversationId,
        timestamp: new Date().toISOString(),
      } as any,
    },
  })
}

export async function getMentorUsageStats(userId: string) {
  // Total questions asked
  const totalQuestions = await prisma.learningEvent.count({
    where: {
      userId,
      eventType: 'mentor.question_asked',
    },
  })

  // Questions per sprint
  const bySprintData = await prisma.learningEvent.findMany({
    where: {
      userId,
      eventType: 'mentor.question_asked',
    },
    select: {
      eventData: true,
    },
  })

  const bySprint: Record<string, number> = {}
  bySprintData.forEach(event => {
    const sprintId = (event.eventData as any).sprint_id
    if (sprintId) {
      bySprint[sprintId] = (bySprint[sprintId] || 0) + 1
    }
  })

  // Active conversations
  const activeConversations = await prisma.mentorConversation.count({
    where: { userId },
  })

  return {
    totalQuestions: totalQuestions || 0,
    questionsBySprint: bySprint,
    activeConversations: activeConversations || 0,
  }
}
