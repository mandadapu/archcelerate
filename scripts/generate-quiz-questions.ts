import Anthropic from '@anthropic-ai/sdk'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SKILL_AREAS = [
  'llm_fundamentals',
  'prompt_engineering',
  'rag',
  'agents',
  'multimodal',
  'production_ai',
]

interface GenerateQuestionsParams {
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  skillArea: string
  count: number
  startingId: number
}

async function generateQuestions({
  difficulty,
  skillArea,
  count,
  startingId,
}: GenerateQuestionsParams) {
  const difficultyGuidelines = {
    beginner: 'Fundamentals, definitions, basic API usage, "What is X?" type questions. Focus on core concepts and terminology.',
    intermediate: 'Best practices, practical patterns, multi-choice scenarios, "What\'s the best approach?" questions. Focus on applying knowledge in real scenarios.',
    advanced: 'Architecture decisions, optimization, edge cases, production scaling questions. Focus on complex trade-offs, performance, and enterprise considerations.',
  }

  const prompt = `Generate exactly ${count} high-quality quiz questions for an AI/LLM skills assessment.

Difficulty Level: ${difficulty}
Skill Area: ${skillArea}
Guidelines: ${difficultyGuidelines[difficulty]}

Requirements:
- Each question should test practical knowledge, not just theory
- Include a mix of single-choice and multiple-choice questions
- For code-evaluation questions, include realistic code snippets
- Ensure questions are unambiguous with clear correct answers
- Distribute difficulty evenly within the ${difficulty} level

Return the questions in this EXACT JSON format (array of objects):
[
  {
    "id": "${skillArea.substring(0, 4)}-${startingId}",
    "type": "single-choice" | "multiple-choice" | "code-evaluation",
    "question": "Question text here?",
    "code": "optional code snippet for code-evaluation type",
    "options": [
      { "id": "a", "text": "Option A text" },
      { "id": "b", "text": "Option B text" },
      { "id": "c", "text": "Option C text" },
      { "id": "d", "text": "Option D text" }
    ],
    "correctAnswers": ["a"] or ["a", "b"] for multiple-choice,
    "skillArea": "${skillArea}",
    "difficulty": "${difficulty}"
  }
]

Return ONLY the JSON array, no additional text or explanation.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      // Extract JSON from markdown code blocks if present
      let jsonText = content.text.trim()
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '')
      }

      const questions = JSON.parse(jsonText)
      return questions
    }

    throw new Error('Unexpected response format from Claude')
  } catch (error) {
    console.error(`Error generating questions for ${skillArea} (${difficulty}):`, error)
    throw error
  }
}

async function main() {
  const difficulty = process.argv[2] as 'beginner' | 'intermediate' | 'advanced'
  const outputFile = process.argv[3]

  if (!difficulty || !outputFile) {
    console.error('Usage: ts-node generate-quiz-questions.ts <beginner|intermediate|advanced> <output-file>')
    process.exit(1)
  }

  const questionsPerArea = {
    beginner: 7, // 7 per area × 6 areas = 42 questions
    intermediate: 7, // 7 per area × 6 areas = 42 questions (we already have some)
    advanced: 9, // 9 per area × 6 areas = 54 questions (round to 50)
  }

  const allQuestions: any[] = []
  let currentId = 100 // Start with ID 100 to avoid conflicts

  for (const skillArea of SKILL_AREAS) {
    console.log(`Generating ${questionsPerArea[difficulty]} ${difficulty} questions for ${skillArea}...`)

    const questions = await generateQuestions({
      difficulty,
      skillArea,
      count: questionsPerArea[difficulty],
      startingId: currentId,
    })

    allQuestions.push(...questions)
    currentId += questions.length

    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log(`\nGenerated ${allQuestions.length} questions total`)
  console.log(`Copy and paste these into lib/quiz/questions.ts:\n`)
  console.log(JSON.stringify(allQuestions, null, 2))
}

main().catch(console.error)
