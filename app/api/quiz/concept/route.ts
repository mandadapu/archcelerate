import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import Redis from 'ioredis'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

const CACHE_TTL = 60 * 60 * 24 * 7 // 7 days

async function generateConceptQuiz(conceptTitle: string, conceptSlug: string): Promise<any[]> {
  const prompt = `You are an AI educator creating a short quiz to test understanding of this concept: "${conceptTitle}"

Generate 5 multiple-choice questions that test comprehension of this specific topic.

For each question, provide:
- A clear, specific question about the concept
- 4 options (a, b, c, d)
- The correct answer
- Difficulty level (beginner/intermediate/advanced)

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "${conceptSlug}-1",
    "question": "What is...",
    "options": [
      {"id": "a", "text": "Option A"},
      {"id": "b", "text": "Option B"},
      {"id": "c", "text": "Option C"},
      {"id": "d", "text": "Option D"}
    ],
    "correctAnswer": "b",
    "difficulty": "beginner"
  }
]

Make questions practical and directly related to "${conceptTitle}".`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
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

  // Extract JSON from response
  let jsonText = content.text.trim()
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '')
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '')
  }

  const questions = JSON.parse(jsonText)

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Invalid questions format from Claude')
  }

  return questions
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const conceptSlug = searchParams.get('slug')
  const conceptTitle = searchParams.get('title')
  const refresh = searchParams.get('refresh') === 'true'

  if (!conceptSlug || !conceptTitle) {
    return NextResponse.json(
      { error: 'Missing slug or title parameter' },
      { status: 400 }
    )
  }

  try {
    const cacheKey = `concept:quiz:${conceptSlug}`

    // Try cache first (unless refresh requested)
    if (!refresh) {
      const cached = await redis.get(cacheKey)
      if (cached) {
        console.log(`✅ Returning cached quiz for ${conceptSlug}`)
        return NextResponse.json({
          questions: JSON.parse(cached),
          source: 'cache',
        })
      }
    }

    // Generate new questions with Claude
    console.log(`🤖 Generating quiz for ${conceptTitle}...`)
    const questions = await generateConceptQuiz(conceptTitle, conceptSlug)

    // Cache the generated questions
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(questions))
    console.log(`✅ Cached ${questions.length} questions for ${conceptSlug}`)

    return NextResponse.json({
      questions,
      source: 'generated',
    })
  } catch (error) {
    console.error('❌ Error generating concept quiz:', error)

    // Return fallback questions
    const fallbackQuestions = [
      {
        id: `${conceptSlug}-1`,
        question: `What is the main purpose of ${conceptTitle}?`,
        options: [
          { id: 'a', text: 'To provide foundational understanding' },
          { id: 'b', text: 'To test advanced concepts' },
          { id: 'c', text: 'To practice coding skills' },
          { id: 'd', text: 'To learn deployment strategies' },
        ],
        correctAnswer: 'a',
        difficulty: 'beginner',
      },
    ]

    return NextResponse.json({
      questions: fallbackQuestions,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
