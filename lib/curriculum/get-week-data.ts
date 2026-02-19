import { prisma } from '@/lib/db'

export async function getWeekData(weekNumber: number, userEmail: string) {
  // First fetch: week + user in parallel (both are independent)
  const [week, user] = await Promise.all([
    prisma.curriculumWeek.findUnique({
      where: { weekNumber },
    }),
    prisma.user.findUnique({
      where: { email: userEmail },
    }),
  ])

  if (!week) return null

  // Second fetch: concepts, lab, project, and progress in parallel
  // (all depend on week.id, progress also depends on user.id)
  const [concepts, lab, project, progress] = await Promise.all([
    prisma.concept.findMany({
      where: { weekId: week.id },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.lab.findFirst({
      where: { weekId: week.id },
    }),
    prisma.weekProject.findFirst({
      where: { weekId: week.id },
    }),
    user
      ? prisma.userWeekProgress.findUnique({
          where: {
            userId_weekId: {
              userId: user.id,
              weekId: week.id,
            },
          },
        })
      : null,
  ])

  return { week, concepts, lab, project, user, progress }
}
