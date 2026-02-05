import { updateUserSkillScores } from '@/lib/skill-scoring'
import { prisma } from '@/lib/db'

/**
 * Hook function that updates skill scores when a lab is completed.
 * This connects lab completion to the skill diagnosis radar chart.
 * 
 * @param userId - The ID of the user completing the lab
 * @param weekNumber - The week number (1-12) of the completed lab
 * @returns Promise<void>
 */
export async function onLabComplete(
  userId: string,
  weekNumber: number
): Promise<void> {
  try {
    // Find the lab activity for this week
    const activity = await prisma.activity.findFirst({
      where: {
        weekNumber,
        activityType: 'lab'
      }
    })

    if (!activity) {
      console.warn(`⚠️  No lab activity found for week ${weekNumber}`)
      return
    }

    // Update skill scores with 100% completion
    // This automatically distributes points to all mapped domains
    await updateUserSkillScores(userId, activity.id, 100)

    console.log(`✅ Skill scores updated for user ${userId}, lab ${activity.slug}`)
  } catch (error) {
    console.error(`❌ Error updating skill scores for week ${weekNumber}:`, error)
    // Don't throw - lab completion should succeed even if skill update fails
    // This ensures graceful degradation
  }
}
