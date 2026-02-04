import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
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
            projects: true
          }
        }
      }
    })

    return NextResponse.json({ weeks })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
