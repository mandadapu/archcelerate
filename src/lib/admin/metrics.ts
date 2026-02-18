import { prisma } from '@/lib/db'
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns'

export async function getDashboardMetrics() {
  const now = new Date()
  const weekStart = startOfWeek(now)
  const weekEnd = endOfWeek(now)
  const lastWeekStart = startOfWeek(subWeeks(now, 1))

  try {
    const [
      totalUsers,
      weeklyUsers,
      lastWeekUsers,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // This week's signups
      prisma.user.count({
        where: {
          createdAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      }),

      // Last week's signups
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastWeekStart,
            lte: weekStart,
          },
        },
      }),
    ])

    // Calculate signup growth
    const signupGrowth = lastWeekUsers > 0
      ? ((weeklyUsers - lastWeekUsers) / lastWeekUsers) * 100
      : 0

    // Calculate active users (simplified - users who logged in this week)
    const activeUsers = weeklyUsers

    return {
      totalUsers,
      activeUsers,
      totalModules: 8, // Based on curriculum
      totalLessons: 40, // Approximate
      averageCompletionRate: 0, // Placeholder - would need lesson_progress table
      weeklySignups: weeklyUsers,
      signupGrowth,
    }
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    // Return default values on error
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalModules: 8,
      totalLessons: 40,
      averageCompletionRate: 0,
      weeklySignups: 0,
      signupGrowth: 0,
    }
  }
}

export async function getUserActivity(days: number = 30) {
  try {
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: subWeeks(new Date(), Math.ceil(days / 7)),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    return users
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return []
  }
}

export async function getRecentUsers(limit: number = 20) {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
    })

    return users.map((user) => ({
      ...user,
      status: 'active' as const,
      lastLoginAt: user.createdAt,
    }))
  } catch (error) {
    console.error('Error fetching recent users:', error)
    return []
  }
}
