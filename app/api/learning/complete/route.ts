import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { markConceptComplete } from '@/lib/progress-tracker'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    const { sprintId, conceptId, timeSpentSeconds } = await req.json()

    if (!sprintId || !conceptId) {
      return new Response('Missing required fields', { status: 400 })
    }

    await markConceptComplete(user.id, sprintId, conceptId, timeSpentSeconds)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Mark complete error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
