import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { redis } from '@/lib/redis/client'
import { quizQuestions, getQuestionsByDifficulty, selectRandomQuestions } from '@/lib/quiz/questions'
import { QuizQuestion, DifficultyLevel } from '@/types/diagnosis'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const CACHE_TTL = 60 * 60 * 24 * 7 // 7 days

async function generateQuestionsWithClaude(level: DifficultyLevel = 'intermediate'): Promise<QuizQuestion[]> {
  const difficultyDescriptions = {
    beginner: 'Basic concepts, definitions, fundamental terminology. Questions should cover: "What is X?", simple API usage, introductory concepts.',
    intermediate: 'Best practices, practical patterns, real-world scenarios. Questions should cover: design decisions, optimization, integration patterns.',
    advanced: 'Architecture, scaling, edge cases, production systems. Questions should cover: complex tradeoffs, performance optimization, enterprise patterns.'
  }

  const prompt = `Generate 50 ${level.toUpperCase()} difficulty multiple-choice questions for an AI engineering skill diagnosis quiz.

Difficulty Level: ${level.toUpperCase()}
${difficultyDescriptions[level]}

Distribute questions evenly across these 6 skill areas (8-9 questions each):
1. LLM Fundamentals - tokens, context windows, temperature, models, prompting basics
2. Prompt Engineering - techniques, best practices, optimization, few-shot learning
3. RAG Systems - embeddings, retrieval, chunking strategies, vector databases
4. AI Agents - tool use, planning, memory, autonomous systems
5. Multimodal AI - vision-language models, image understanding, multi-input systems
6. Production AI - costs, latency, monitoring, scaling, deployment

CRITICAL: Your response must be ONLY a JSON array with NO markdown, NO explanations, NO text before or after.

Format (repeat for 50 questions):
[
  {
    "id": "llm-1-${level}",
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
    "difficulty": "${level}"
  }
]

Make questions practical for engineers building AI products. All questions MUST have "difficulty": "${level}". Start your response with [ and end with ]`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192,
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
  const level = (searchParams.get('level') || 'intermediate') as DifficultyLevel

  // Validate difficulty level
  if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
    return NextResponse.json(
      { error: 'Invalid difficulty level. Must be: beginner, intermediate, or advanced' },
      { status: 400 }
    )
  }

  const CACHE_KEY = `diagnosis:quiz:pool:${level}`

  try {
    // Try to get from cache first (unless refresh requested)
    if (!refresh) {
      try {
        console.log(`🔍 Attempting to get cached ${level} questions from Redis...`)
        // Add timeout wrapper for Redis operations
        const cached = await Promise.race([
          redis.get(CACHE_KEY),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Redis timeout')), 3000)
          )
        ])
        if (cached) {
          const pool = JSON.parse(cached as string)
          const selected = selectRandomQuestions(pool, 25)
          console.log(`✅ Returning ${selected.length} random questions from ${pool.length} cached ${level} questions`)
          return NextResponse.json({
            questions: selected,
            level,
            source: 'cache',
          })
        } else {
          console.log(`ℹ️ No cached ${level} questions found in Redis`)
        }
      } catch (redisError) {
        console.error('❌ Redis error:', redisError instanceof Error ? redisError.message : 'Unknown error')
        console.error('Redis error stack:', redisError)
        // Continue to generation or fallback
      }
    }

    // Generate new questions with Claude (only if refresh requested)
    if (refresh) {
      console.log(`🤖 Generating new ${level} quiz questions with Claude...`)
      const pool = await generateQuestionsWithClaude(level)

      // Try to cache the generated question pool
      try {
        await Promise.race([
          redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(pool)),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Redis timeout')), 3000)
          )
        ])
        console.log(`✅ Cached ${pool.length} ${level} questions for ${CACHE_TTL}s`)
      } catch (cacheError) {
        console.log('⚠️ Failed to cache questions:', cacheError instanceof Error ? cacheError.message : 'Unknown error')
      }

      const selected = selectRandomQuestions(pool, 25)
      return NextResponse.json({
        questions: selected,
        level,
        source: 'generated',
      })
    }

    // No cache and no refresh - use fallback questions (fast)
    console.log(`⚠️ No cache available, using fallback ${level} questions`)
    const fallbackPool = getQuestionsByDifficulty(level)
    const selected = selectRandomQuestions(fallbackPool, 25)
    return NextResponse.json({
      questions: selected,
      level,
      source: 'fallback',
    })
  } catch (error) {
    console.error('❌ Error generating questions:', error)

    // Fallback to hardcoded questions
    console.log(`⚠️ Falling back to hardcoded ${level} questions`)
    const fallbackPool = getQuestionsByDifficulty(level)
    const selected = selectRandomQuestions(fallbackPool, 25)
    return NextResponse.json({
      questions: selected,
      level,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Optional: Admin endpoint to refresh questions
export async function POST(request: Request) {
  try {
    const { adminKey, level } = await request.json()

    // Simple admin key check (you should use proper auth)
    if (adminKey !== process.env.ADMIN_REFRESH_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // If level specified, refresh only that level
    if (level) {
      if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
        return NextResponse.json(
          { error: 'Invalid difficulty level' },
          { status: 400 }
        )
      }

      const CACHE_KEY = `diagnosis:quiz:pool:${level}`
      await redis.del(CACHE_KEY)
      const questions = await generateQuestionsWithClaude(level as DifficultyLevel)
      await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(questions))

      return NextResponse.json({
        success: true,
        level,
        questionsCount: questions.length,
        message: `${level} questions refreshed successfully`,
      })
    }

    // Refresh all levels
    const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced']
    const results = []

    for (const lvl of levels) {
      const CACHE_KEY = `diagnosis:quiz:pool:${lvl}`
      await redis.del(CACHE_KEY)
      const questions = await generateQuestionsWithClaude(lvl)
      await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(questions))
      results.push({ level: lvl, count: questions.length })
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'All difficulty levels refreshed successfully',
    })
  } catch (error) {
    console.error('Error refreshing questions:', error)
    return NextResponse.json(
      { error: 'Failed to refresh questions' },
      { status: 500 }
    )
  }
}
