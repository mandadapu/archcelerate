import { prisma } from '@/lib/db'
import { UserContext, ConversationContext, ProjectContext, AssembledContext } from '@/types/context'

/**
 * Fetch user context from database
 */
export async function getUserContext(userId: string): Promise<UserContext> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skillDiagnosis: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return {
    userId,
    name: user.name || null,
    currentSprint: null, // TODO: Track in user_progress
    currentProject: null,
    diagnosisCompleted: user.diagnosisCompleted,
    skillScores: user.skillDiagnosis?.skillScores as Record<string, number> | undefined,
    recommendedPath: user.skillDiagnosis?.recommendedPath,
  }
}

/**
 * Fetch conversation context
 * Note: This will be implemented once we add MentorConversation model
 */
export async function getConversationContext(
  conversationId: string
): Promise<ConversationContext | null> {
  // TODO: Implement when MentorConversation model is added
  return null
}

/**
 * Get recent conversation history
 * Note: This will be implemented once we add MentorConversation model
 */
export async function getRecentConversations(
  userId: string,
  limit: number = 5
): Promise<ConversationContext[]> {
  // TODO: Implement when MentorConversation model is added
  return []
}

/**
 * Assemble full context for AI
 */
export async function assembleContext(options: {
  userId: string
  conversationId?: string
  projectNumber?: number
  includeHistory?: boolean
}): Promise<AssembledContext> {
  const { userId, conversationId, projectNumber, includeHistory = false } = options

  // Always get user context
  const user = await getUserContext(userId)

  // Optionally get conversation context
  let conversation: ConversationContext | undefined
  if (conversationId) {
    const conv = await getConversationContext(conversationId)
    if (conv) conversation = conv
  }

  // Optionally get project context
  let project: ProjectContext | undefined
  if (projectNumber) {
    // TODO: Implement when projects are added
  }

  // Optionally include recent history
  let additionalData: Record<string, any> | undefined
  if (includeHistory) {
    const recentConvs = await getRecentConversations(userId, 3)
    additionalData = {
      recentConversations: recentConvs,
    }
  }

  return {
    user,
    conversation,
    project,
    additionalData,
  }
}

/**
 * Trim conversation to fit context window
 */
export function trimConversation(
  messages: Array<{ role: string; content: string }>,
  maxMessages: number = 10
): Array<{ role: string; content: string }> {
  if (messages.length <= maxMessages) {
    return messages
  }

  // Keep the most recent messages
  return messages.slice(-maxMessages)
}
