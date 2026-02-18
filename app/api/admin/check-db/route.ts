import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateAdminAuth } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const authError = validateAdminAuth(req)
  if (authError) return authError

  try {
    const weeks = await prisma.curriculumWeek.findMany({
      orderBy: { weekNumber: 'asc' },
      select: {
        weekNumber: true,
        title: true,
        description: true,
        _count: {
          select: {
            concepts: true,
            labs: true,
            weekProjects: true
          }
        }
      }
    })

    return NextResponse.json({ weeks })
  } catch (error) {
    return NextResponse.json(
      { error: 'Database check failed' },
      { status: 500 }
    )
  }
}
