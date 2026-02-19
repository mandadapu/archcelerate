// app/api/memory/store/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MemoryManager } from '@/lib/memory/memory-manager'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    const memoryManager = new MemoryManager(session.user.id)

    switch (type) {
      case 'episodic':
        await memoryManager.storeEpisodicMemory(
          data.conversationId,
          data.messageId,
          data.summary,
          data.importanceScore
        )
        break

      case 'semantic':
        await memoryManager.storeSemanticMemory(
          data.fact,
          data.sourceConversationId,
          data.confidence
        )
        break

      case 'procedural':
        await memoryManager.updateProceduralMemory(data.preferences)
        break

      default:
        return Response.json({ error: 'Invalid memory type' }, { status: 400 })
    }

    return Response.json({ success: true })

  } catch (error: any) {
    console.error('Memory store error:', error)
    return Response.json(
      { error: 'Failed to store memory' },
      { status: 500 }
    )
  }
}
