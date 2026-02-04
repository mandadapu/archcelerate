import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200

function chunkContent(content: string): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < content.length) {
    const end = Math.min(start + CHUNK_SIZE, content.length)
    const chunk = content.slice(start, end)
    chunks.push(chunk)
    start = end - CHUNK_OVERLAP
  }

  return chunks
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

// GET /api/curriculum/[id] - Get specific curriculum
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const curriculum = await prisma.curriculumContent.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        chunks: {
          select: {
            id: true,
            chunkIndex: true,
            heading: true,
            codeBlock: true,
          },
          orderBy: {
            chunkIndex: 'asc',
          },
        },
      },
    })

    if (!curriculum) {
      return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 })
    }

    // Check access: must be owner, public, or system content
    const hasAccess =
      curriculum.userId === user.id ||
      curriculum.isPublic ||
      curriculum.userId === null

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ curriculum })
  } catch (error) {
    console.error('Error fetching curriculum:', error)
    return NextResponse.json(
      { error: 'Failed to fetch curriculum' },
      { status: 500 }
    )
  }
}

// PUT /api/curriculum/[id] - Update curriculum
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check ownership
    const existing = await prisma.curriculumContent.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 })
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, type, weekNumber, isPublic, metadata } = body

    // Update content record
    const updated = await prisma.curriculumContent.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(type && { type }),
        ...(weekNumber !== undefined && { weekNumber }),
        ...(isPublic !== undefined && { isPublic }),
        ...(metadata && { metadata }),
        lastIndexed: new Date(),
      },
    })

    // If content changed, re-chunk and re-embed
    if (content) {
      // Delete old chunks
      await prisma.curriculumChunk.deleteMany({
        where: { contentId: params.id },
      })

      // Create new chunks
      const chunks = chunkContent(content)

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]

        const headingMatch = chunk.match(/^#+\s+(.+)$/m)
        const heading = headingMatch ? headingMatch[1] : null

        const codeBlockCount = (chunk.match(/```/g) || []).length
        const isCodeBlock = codeBlockCount >= 2

        const embedding = await generateEmbedding(chunk)

        await prisma.curriculumChunk.create({
          data: {
            contentId: params.id,
            content: chunk,
            embedding: `[${embedding.join(',')}]` as any,
            chunkIndex: i,
            heading,
            codeBlock: isCodeBlock,
            metadata: {
              wordCount: chunk.split(/\s+/).length,
            },
          },
        })

        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      return NextResponse.json({
        success: true,
        curriculum: updated,
        chunksCreated: chunks.length,
      })
    }

    return NextResponse.json({ success: true, curriculum: updated })
  } catch (error) {
    console.error('Error updating curriculum:', error)
    return NextResponse.json(
      { error: 'Failed to update curriculum' },
      { status: 500 }
    )
  }
}

// DELETE /api/curriculum/[id] - Delete curriculum
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check ownership
    const existing = await prisma.curriculumContent.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 })
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete (chunks will cascade delete)
    await prisma.curriculumContent.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting curriculum:', error)
    return NextResponse.json(
      { error: 'Failed to delete curriculum' },
      { status: 500 }
    )
  }
}
