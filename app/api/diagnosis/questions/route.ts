import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import Redis from 'ioredis'
import { quizQuestions } from '@/lib/quiz/questions'
import { QuizQuestion } from '@/types/diagnosis'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

const CACHE_KEY = 'diagnosis:quiz:questions'
const CACHE_TTL = 60 * 60 * 24 * 7 // 7 days

async function generateQuestionsWithClaude(): Promise<QuizQuestion[]> {
  const prompt = `You are an AI educator creating a skill diagnosis quiz for software engineers learning to build AI products.

Generate 15 multiple-choice questions covering these skill areas:
1. LLM Fundamentals (5 questions)
2. Prompt Engineering (3 questions)
3. RAG Systems (3 questions)
4. AI Agents (2 questions)
5. Production Deployment (2 questions)

For each question, provide:
- A clear, technical question
- 4 options (a, b, c, d)
- The correct answer(s)
- Difficulty level (beginner/intermediate/advanced)

Return ONLY a valid JSON array of questions in this exact format:
[
  {
    "id": "llm-1",
    "type": "single-choice",
    "question": "What is a token in LLMs?",
    "options": [
      {"id": "a", "text": "Option A"},
      {"id": "b", "text": "Option B"},
      {"id": "c", "text": "Option C"},
      {"id": "d", "text": "Option D"}
    ],
    "correctAnswers": ["b"],
    "skillArea": "llm_fundamentals",
    "difficulty": "beginner"
  }
]

Make questions practical and relevant to building production AI systems. Focus on real-world scenarios.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  // Extract JSON from response (handle markdown code blocks)
  let jsonText = content.text.trim()
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '')
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '')
  }

  const questions: QuizQuestion[] = JSON.parse(jsonText)

  // Validate structure
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Invalid questions format from Claude')
  }

  return questions
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const refresh = searchParams.get('refresh') === 'true'

  try {
    // Try to get from cache first (unless refresh requested)
    if (!refresh) {
      const cached = await redis.get(CACHE_KEY)
      if (cached) {
        console.log('✅ Returning cached quiz questions')
        return NextResponse.json({
          questions: JSON.parse(cached),
          source: 'cache',
        })
      }
    }

    // Generate new questions with Claude
    console.log('🤖 Generating new quiz questions with Claude...')
    const questions = await generateQuestionsWithClaude()

    // Cache the generated questions
    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(questions))
    console.log(`✅ Cached ${questions.length} questions for ${CACHE_TTL}s`)

    return NextResponse.json({
      questions,
      source: 'generated',
    })
  } catch (error) {
    console.error('❌ Error generating questions:', error)

    // Fallback to hardcoded questions
    console.log('⚠️ Falling back to hardcoded questions')
    return NextResponse.json({
      questions: quizQuestions,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Optional: Admin endpoint to refresh questions
export async function POST(request: Request) {
  try {
    const { adminKey } = await request.json()

    // Simple admin key check (you should use proper auth)
    if (adminKey !== process.env.ADMIN_REFRESH_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Clear cache and regenerate
    await redis.del(CACHE_KEY)
    const questions = await generateQuestionsWithClaude()
    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(questions))

    return NextResponse.json({
      success: true,
      questionsCount: questions.length,
      message: 'Questions refreshed successfully',
    })
  } catch (error) {
    console.error('Error refreshing questions:', error)
    return NextResponse.json(
      { error: 'Failed to refresh questions' },
      { status: 500 }
    )
  }
}
