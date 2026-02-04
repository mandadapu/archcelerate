import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { assembleContext } from '@/lib/ai/context'
import { getMentorSystemPrompt } from '@/lib/ai/prompts'
import { trackMentorQuestion } from '@/lib/analytics/mentor'
import OpenAI from 'openai'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null // OpenAI is optional for chat - only needed for curriculum search
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

interface CurriculumSearchResult {
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

async function searchCurriculum(
  userId: string,
  query: string,
  limit: number = 5
): Promise<CurriculumSearchResult[]> {
  try {
    // Check if OpenAI is configured
    const openai = getOpenAIClient()
    if (!openai) {
      console.log('OpenAI not configured, skipping curriculum search')
      return []
    }

    // Generate embedding for search query
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })
    const queryEmbedding = embedding.data[0].embedding
    const embeddingString = `[${queryEmbedding.join(',')}]`

    // Search curriculum chunks with vector similarity
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
          OR cc."userId" = ${userId}                            -- User's own content
          OR (cc."isPublic" = true AND cc."userId" IS NOT NULL) -- Public content from others
        )
        AND (1 - (c.embedding <=> ${embeddingString}::vector)) > 0.7  -- Similarity threshold
      ORDER BY c.embedding <=> ${embeddingString}::vector
      LIMIT ${limit}
    `

    return results.map((row) => ({
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
  } catch (error) {
    console.error('Curriculum search error:', error)
    return []
  }
}

function formatCurriculumContext(results: CurriculumSearchResult[]): string {
  if (results.length === 0) return ''

  let context = '\n\n--- CURRICULUM REFERENCES ---\n'
  context += 'The following relevant content from the curriculum may help answer the question:\n\n'

  results.forEach((result, index) => {
    const sourceLabel = result.source.isUserContent
      ? `User Note: "${result.source.title}"${result.source.author ? ` by ${result.source.author.name}` : ''}`
      : result.source.weekNumber
      ? `Week ${result.source.weekNumber}: "${result.source.title}"`
      : `"${result.source.title}"`

    context += `[${index + 1}] ${sourceLabel}\n`
    if (result.context.heading) {
      context += `Section: ${result.context.heading}\n`
    }
    context += `Content:\n${result.content.trim()}\n`
    context += `(Relevance: ${(result.similarity * 100).toFixed(0)}%)\n\n`
  })

  context += '--- END CURRICULUM REFERENCES ---\n\n'
  context += 'When answering, you may reference these sources by their number [1], [2], etc. '
  context += 'Always cite sources when you use information from them.\n\n'

  return context
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      conversationId,
      sprintId,
      conceptId,
    } = await req.json()

    // Verify authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    // Rate limiting
    const limitResult = await rateLimit(
      `chat:${user.id}`,
      RATE_LIMITS.MENTOR_CHAT
    )

    if (!limitResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          reset: limitResult.reset,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the latest user message for curriculum search
    const userQuestion = messages[messages.length - 1]
    const questionText = userQuestion?.role === 'user' ? userQuestion.content : ''

    // Search curriculum for relevant content
    const curriculumResults = await searchCurriculum(user.id, questionText, 5)
    const curriculumContext = formatCurriculumContext(curriculumResults)

    // Assemble context with learning information
    const context = await assembleContext({
      userId: user.id,
      conversationId,
      sprintId,
      conceptId,
      includeHistory: false,
    })

    // Generate context-aware system prompt with curriculum references
    let systemPrompt = getMentorSystemPrompt(context.learning)
    if (curriculumContext) {
      systemPrompt += curriculumContext
    }

    // Track the question
    if (userQuestion && conversationId) {
      await trackMentorQuestion(user.id, questionText, {
        sprintId,
        conceptId,
        conversationId,
      })
    }

    // Create streaming response
    const stream = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
      stream: true,
    })

    // Convert Anthropic stream to web standard stream
    const encoder = new TextEncoder()
    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text
              fullResponse += text
              controller.enqueue(encoder.encode(text))
            }
          }

          // Save conversation to database after streaming completes
          if (conversationId) {
            await saveConversation(
              user.id,
              conversationId,
              messages,
              fullResponse,
              sprintId,
              conceptId,
              curriculumResults
            )
          }

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Stream error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

async function saveConversation(
  userId: string,
  conversationId: string,
  userMessages: any[],
  assistantResponse: string,
  sprintId?: string,
  conceptId?: string,
  curriculumReferences?: CurriculumSearchResult[]
) {
  // Get existing conversation
  const existing = await prisma.mentorConversation.findUnique({
    where: { id: conversationId },
  })

  // Format citations for display
  const citations = curriculumReferences?.map((ref, index) => ({
    id: index + 1,
    title: ref.source.title,
    type: ref.source.type,
    weekNumber: ref.source.weekNumber,
    heading: ref.context.heading,
    isUserContent: ref.source.isUserContent,
    author: ref.source.author,
    similarity: ref.similarity,
  }))

  const allMessages = [
    ...(existing?.messages as any[] || []),
    ...userMessages.map((m: any) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date().toISOString(),
    })),
    {
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date().toISOString(),
      citations: citations || [],
    },
  ]

  // Generate title from first user message if new conversation
  let title = existing?.title
  if (!title && userMessages.length > 0) {
    const firstMessage = userMessages.find((m: any) => m.role === 'user')
    if (firstMessage) {
      title = firstMessage.content.slice(0, 60)
      if (firstMessage.content.length > 60) title += '...'
    }
  }

  // Upsert conversation with context
  await prisma.mentorConversation.upsert({
    where: { id: conversationId },
    create: {
      id: conversationId,
      userId,
      messages: allMessages as any,
      title,
      contextSprint: sprintId || null,
      contextConcept: conceptId || null,
    },
    update: {
      messages: allMessages as any,
      title,
      contextSprint: sprintId || existing?.contextSprint || null,
      contextConcept: conceptId || existing?.contextConcept || null,
    },
  })

  // Log event for new conversations
  if (!existing) {
    await prisma.learningEvent.create({
      data: {
        userId,
        eventType: 'mentor.conversation_started',
        eventData: {
          conversation_id: conversationId,
          sprint_id: sprintId,
          concept_id: conceptId,
        } as any,
      },
    })
  }
}
