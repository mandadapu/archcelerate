import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import Redis from 'ioredis'
import { quizQuestions } from '@/lib/quiz/questions'
import { QuizQuestion } from '@/types/diagnosis'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  connectTimeout: 10000, // 10 second timeout for VPC connector
  commandTimeout: 5000, // 5 second timeout for commands
  retryStrategy: (times) => {
    console.log(`🔄 Redis retry attempt ${times}`)
    // Retry up to 3 times with exponential backoff
    if (times > 3) return null
    return Math.min(times * 100, 3000)
  },
  lazyConnect: false, // Connect immediately on startup
  enableReadyCheck: true, // Wait for Redis to be ready
  maxRetriesPerRequest: 2, // Retry commands twice
})

// Add connection event handlers for debugging
redis.on('connect', () => {
  console.log('✅ Redis connection established')
})

redis.on('ready', () => {
  console.log('✅ Redis ready to accept commands')
})

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message)
})

redis.on('close', () => {
  console.log('⚠️ Redis connection closed')
})

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...')
})

const CACHE_KEY = 'diagnosis:quiz:questions'
const CACHE_TTL = 60 * 60 * 24 * 7 // 7 days

async function generateQuestionsWithClaude(): Promise<QuizQuestion[]> {
  const prompt = `Generate 15 multiple-choice questions for a skill diagnosis quiz covering:
1. LLM Fundamentals (5 questions) - tokens, context windows, temperature, models
2. Prompt Engineering (3 questions) - techniques, best practices, optimization
3. RAG Systems (3 questions) - embeddings, retrieval, chunking strategies
4. AI Agents (2 questions) - tool use, planning, memory
5. Production Deployment (2 questions) - costs, latency, monitoring

CRITICAL: Your response must be ONLY a JSON array with NO markdown, NO explanations, NO text before or after.

Format (repeat for 15 questions):
[
  {
    "id": "llm-1",
    "type": "single-choice",
    "question": "What is a token in the context of Large Language Models?",
    "options": [
      {"id": "a", "text": "A word in the input text"},
      {"id": "b", "text": "A subword unit used by the model's tokenizer"},
      {"id": "c", "text": "A single character"},
      {"id": "d", "text": "A sentence"}
    ],
    "correctAnswers": ["b"],
    "skillArea": "llm_fundamentals",
    "difficulty": "beginner"
  }
]

Make questions practical for engineers building AI products. Start your response with [ and end with ]`

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 4096,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    system: 'You are a JSON generator. Return ONLY valid JSON with no explanations, markdown formatting, or additional text. Your entire response must be parseable as JSON.',
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

  // Clean up common JSON formatting issues
  jsonText = jsonText.trim()

  // Remove any text before the opening bracket
  const jsonStart = jsonText.indexOf('[')
  if (jsonStart > 0) {
    jsonText = jsonText.substring(jsonStart)
  }

  // Remove any text after the closing bracket
  const jsonEnd = jsonText.lastIndexOf(']')
  if (jsonEnd !== -1 && jsonEnd < jsonText.length - 1) {
    jsonText = jsonText.substring(0, jsonEnd + 1)
  }

  // Remove trailing commas before closing brackets/braces
  jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1')

  let questions: QuizQuestion[]
  try {
    questions = JSON.parse(jsonText)
  } catch (parseError) {
    console.error('❌ Failed to parse Claude response:', parseError)
    console.error('Response text:', content.text.substring(0, 500))
    throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
  }

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
      try {
        console.log('🔍 Attempting to get cached questions from Redis...')
        // Add timeout wrapper for Redis operations
        const cached = await Promise.race([
          redis.get(CACHE_KEY),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Redis timeout')), 3000)
          )
        ])
        if (cached) {
          console.log('✅ Returning cached quiz questions')
          return NextResponse.json({
            questions: JSON.parse(cached as string),
            source: 'cache',
          })
        } else {
          console.log('ℹ️ No cached questions found in Redis')
        }
      } catch (redisError) {
        console.error('❌ Redis error:', redisError instanceof Error ? redisError.message : 'Unknown error')
        console.error('Redis error stack:', redisError)
        // Continue to generation
      }
    }

    // Generate new questions with Claude (only if refresh requested)
    if (refresh) {
      console.log('🤖 Generating new quiz questions with Claude...')
      const questions = await generateQuestionsWithClaude()

      // Try to cache the generated questions
      try {
        await Promise.race([
          redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(questions)),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Redis timeout')), 3000)
          )
        ])
        console.log(`✅ Cached ${questions.length} questions for ${CACHE_TTL}s`)
      } catch (cacheError) {
        console.log('⚠️ Failed to cache questions:', cacheError instanceof Error ? cacheError.message : 'Unknown error')
      }

      return NextResponse.json({
        questions,
        source: 'generated',
      })
    }

    // No cache and no refresh - use fallback questions (fast)
    console.log('⚠️ No cache available, using fallback questions')
    return NextResponse.json({
      questions: quizQuestions,
      source: 'fallback',
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
