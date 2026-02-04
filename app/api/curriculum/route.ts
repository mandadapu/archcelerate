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

// GET /api/curriculum - List user's curriculum
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const includePublic = searchParams.get('includePublic') === 'true'

    // Get user's curriculum and optionally public curriculum from others
    const whereClause = includePublic
      ? {
          OR: [
            { userId: user.id },
            { isPublic: true, userId: { not: null } }, // Public user content only
          ],
        }
      : { userId: user.id }

    const curriculum = await prisma.curriculumContent.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        slug: true,
        weekNumber: true,
        isPublic: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ curriculum })
  } catch (error) {
    console.error('Error fetching curriculum:', error)
    return NextResponse.json(
      { error: 'Failed to fetch curriculum' },
      { status: 500 }
    )
  }
}

// POST /api/curriculum - Create user curriculum
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { title, content, type, weekNumber, isPublic, metadata } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Ensure unique slug for this user
    let slug = baseSlug
    let counter = 1
    while (true) {
      const existing = await prisma.curriculumContent.findUnique({
        where: {
          userId_slug: {
            userId: user.id,
            slug,
          },
        },
      })
      if (!existing) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create curriculum content record
    const curriculumContent = await prisma.curriculumContent.create({
      data: {
        userId: user.id,
        title,
        content,
        type: type || 'user-note',
        slug,
        weekNumber: weekNumber || null,
        isPublic: isPublic || false,
        metadata: metadata || {},
      },
    })

    // Chunk and embed the content
    const chunks = chunkContent(content)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      // Extract heading if present
      const headingMatch = chunk.match(/^#+\s+(.+)$/m)
      const heading = headingMatch ? headingMatch[1] : null

      // Check if code block
      const codeBlockCount = (chunk.match(/```/g) || []).length
      const isCodeBlock = codeBlockCount >= 2

      // Generate embedding
      const embedding = await generateEmbedding(chunk)

      await prisma.curriculumChunk.create({
        data: {
          contentId: curriculumContent.id,
          content: chunk,
          embedding: `[${embedding.join(',')}]` as any,
          chunkIndex: i,
          heading,
          codeBlock: isCodeBlock,
          metadata: {
            wordCount: chunk.split(/\s+/).length,
          },
        } as any,
      })

      // Rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return NextResponse.json({
      success: true,
      curriculum: curriculumContent,
      chunksCreated: chunks.length,
    })
  } catch (error) {
    console.error('Error creating curriculum:', error)
    return NextResponse.json(
      { error: 'Failed to create curriculum' },
      { status: 500 }
    )
  }
}
