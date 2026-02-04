import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient()
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

export interface CurriculumSearchResult {
  chunkId: string
  content: string
  similarity: number
  source: {
    contentId: string
    title: string
    type: string
    weekNumber: number | null
    filePath: string | null
    slug: string
    isUserContent: boolean
    author?: {
      name: string | null
      email: string | null
    }
  }
  context: {
    heading: string | null
    codeBlock: boolean
    chunkIndex: number
  }
}

// POST /api/curriculum/search - Search curriculum with semantic similarity
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
    const { query, limit = 10, includeCodeBlocks = true } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query)

    // Build the SQL query for vector similarity search
    // We search across:
    // 1. System content (userId = NULL)
    // 2. User's own content (userId = user.id)
    // 3. Public content from others (isPublic = true AND userId != NULL AND userId != user.id)
    const embeddingString = `[${queryEmbedding.join(',')}]`

    const results = await prisma.$queryRaw<
      Array<{
        chunk_id: string
        content_id: string
        chunk_content: string
        chunk_index: number
        heading: string | null
        code_block: boolean
        similarity: number
        title: string
        type: string
        week_number: number | null
        file_path: string | null
        slug: string
        user_id: string | null
        is_public: boolean
        author_name: string | null
        author_email: string | null
      }>
    >`
      SELECT
        c.id as chunk_id,
        c."contentId" as content_id,
        c.content as chunk_content,
        c."chunkIndex" as chunk_index,
        c.heading,
        c."codeBlock" as code_block,
        1 - (c.embedding <=> ${embeddingString}::vector) as similarity,
        cc.title,
        cc.type,
        cc."weekNumber" as week_number,
        cc."filePath" as file_path,
        cc.slug,
        cc."userId" as user_id,
        cc."isPublic" as is_public,
        u.name as author_name,
        u.email as author_email
      FROM "CurriculumChunk" c
      INNER JOIN "CurriculumContent" cc ON c."contentId" = cc.id
      LEFT JOIN "User" u ON cc."userId" = u.id
      WHERE
        (
          cc."userId" IS NULL                                    -- System content
          OR cc."userId" = ${user.id}                           -- User's own content
          OR (cc."isPublic" = true AND cc."userId" IS NOT NULL) -- Public content from others
        )
        ${includeCodeBlocks ? '' : 'AND c."codeBlock" = false'}
      ORDER BY c.embedding <=> ${embeddingString}::vector
      LIMIT ${Math.min(limit, 50)}
    `

    // Transform results into structured format
    const searchResults: CurriculumSearchResult[] = results.map((row) => ({
      chunkId: row.chunk_id,
      content: row.chunk_content,
      similarity: Number(row.similarity),
      source: {
        contentId: row.content_id,
        title: row.title,
        type: row.type,
        weekNumber: row.week_number,
        filePath: row.file_path,
        slug: row.slug,
        isUserContent: row.user_id !== null,
        ...(row.user_id && {
          author: {
            name: row.author_name,
            email: row.author_email,
          },
        }),
      },
      context: {
        heading: row.heading,
        codeBlock: row.code_block,
        chunkIndex: row.chunk_index,
      },
    }))

    return NextResponse.json({
      query,
      results: searchResults,
      count: searchResults.length,
    })
  } catch (error) {
    console.error('Error searching curriculum:', error)
    return NextResponse.json(
      { error: 'Failed to search curriculum' },
      { status: 500 }
    )
  }
}
