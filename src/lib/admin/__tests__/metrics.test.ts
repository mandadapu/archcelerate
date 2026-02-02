import { getDashboardMetrics, getUserActivity, getRecentUsers } from '../metrics'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

describe('Admin Metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics with user counts', async () => {
      const mockCount = jest.fn()
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(15)  // weeklyUsers
        .mockResolvedValueOnce(10)  // lastWeekUsers

      ;(prisma.user.count as jest.Mock) = mockCount

      const result = await getDashboardMetrics()

      expect(result).toEqual({
        totalUsers: 100,
        activeUsers: 15,
        totalModules: 8,
        totalLessons: 40,
        averageCompletionRate: 0,
        weeklySignups: 15,
        signupGrowth: 50,
      })

      // Verify prisma.user.count was called correctly
      expect(mockCount).toHaveBeenCalledTimes(3)

      // First call: total users (no where clause)
      expect(mockCount).toHaveBeenNthCalledWith(1)

      // Second call: this week's signups (with createdAt filter)
      const secondCall = mockCount.mock.calls[1][0]
      expect(secondCall).toHaveProperty('where')
      expect(secondCall.where).toHaveProperty('createdAt')
      expect(secondCall.where.createdAt).toHaveProperty('gte')
      expect(secondCall.where.createdAt).toHaveProperty('lte')

      // Third call: last week's signups (with createdAt filter)
      const thirdCall = mockCount.mock.calls[2][0]
      expect(thirdCall).toHaveProperty('where')
      expect(thirdCall.where).toHaveProperty('createdAt')
      expect(thirdCall.where.createdAt).toHaveProperty('gte')
      expect(thirdCall.where.createdAt).toHaveProperty('lte')
    })

    it('should calculate signup growth correctly when last week had users', async () => {
      ;(prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(10)

      const result = await getDashboardMetrics()

      expect(result.signupGrowth).toBe(100) // (20-10)/10 * 100 = 100%
    })

    it('should handle zero growth when no new signups', async () => {
      ;(prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(10)

      const result = await getDashboardMetrics()

      expect(result.signupGrowth).toBe(0)
    })

    it('should handle negative growth', async () => {
      ;(prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(10)

      const result = await getDashboardMetrics()

      expect(result.signupGrowth).toBe(-50) // (5-10)/10 * 100 = -50%
    })

    it('should return default values on error', async () => {
      ;(prisma.user.count as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await getDashboardMetrics()

      expect(result).toEqual({
        totalUsers: 0,
        activeUsers: 0,
        totalModules: 8,
        totalLessons: 40,
        averageCompletionRate: 0,
        weeklySignups: 0,
        signupGrowth: 0,
      })
    })
  })

  describe('getUserActivity', () => {
    it('should return recent users with createdAt field', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          createdAt: new Date('2025-01-15'),
        },
        {
          id: '2',
          email: 'user2@example.com',
          name: 'User 2',
          createdAt: new Date('2025-01-14'),
        },
      ]

      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)

      const result = await getUserActivity(30)

      expect(result).toEqual(mockUsers)
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: expect.any(Date),
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
    })

    it('should filter by custom days parameter', async () => {
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      await getUserActivity(60)

      const call = (prisma.user.findMany as jest.Mock).mock.calls[0][0]
      expect(call.where.createdAt).toHaveProperty('gte')
    })

    it('should return empty array on error', async () => {
      ;(prisma.user.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await getUserActivity()

      expect(result).toEqual([])
    })
  })

  describe('getRecentUsers', () => {
    it('should return recent users with status and lastLoginAt', async () => {
      const mockDate = new Date('2025-01-15')
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          image: 'avatar1.jpg',
          createdAt: mockDate,
        },
      ]

      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)

      const result = await getRecentUsers(20)

      expect(result).toEqual([
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          image: 'avatar1.jpg',
          createdAt: mockDate,
          status: 'active',
          lastLoginAt: mockDate,
        },
      ])

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
        },
      })
    })

    it('should use custom limit parameter', async () => {
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      await getRecentUsers(50)

      const call = (prisma.user.findMany as jest.Mock).mock.calls[0][0]
      expect(call.take).toBe(50)
    })

    it('should return empty array on error', async () => {
      ;(prisma.user.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await getRecentUsers()

      expect(result).toEqual([])
    })

    it('should map createdAt to lastLoginAt for all users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          image: null,
          createdAt: new Date('2025-01-15'),
        },
        {
          id: '2',
          email: 'user2@example.com',
          name: 'User 2',
          image: null,
          createdAt: new Date('2025-01-14'),
        },
      ]

      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)

      const result = await getRecentUsers()

      expect(result[0].lastLoginAt).toBe(mockUsers[0].createdAt)
      expect(result[1].lastLoginAt).toBe(mockUsers[1].createdAt)
    })
  })

  describe('TypeScript Type Safety', () => {
    it('should only query existing User model fields', async () => {
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      await getRecentUsers()

      const call = (prisma.user.findMany as jest.Mock).mock.calls[0][0]
      const selectFields = Object.keys(call.select)

      // Ensure we're not selecting 'updatedAt' which doesn't exist
      expect(selectFields).not.toContain('updatedAt')

      // Ensure we're selecting valid fields
      expect(selectFields).toContain('id')
      expect(selectFields).toContain('email')
      expect(selectFields).toContain('name')
      expect(selectFields).toContain('image')
      expect(selectFields).toContain('createdAt')
    })

    it('should filter by createdAt not updatedAt', async () => {
      ;(prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(10)

      await getDashboardMetrics()

      const weeklyCall = (prisma.user.count as jest.Mock).mock.calls[1][0]
      const lastWeekCall = (prisma.user.count as jest.Mock).mock.calls[2][0]

      // Should use createdAt, not updatedAt
      expect(weeklyCall.where).toHaveProperty('createdAt')
      expect(weeklyCall.where).not.toHaveProperty('updatedAt')
      expect(lastWeekCall.where).toHaveProperty('createdAt')
      expect(lastWeekCall.where).not.toHaveProperty('updatedAt')
    })
  })
})
