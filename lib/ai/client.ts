import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface DiagnosisAnalysisInput {
  answers: Array<{
    questionId: string
    question: string
    selectedOptions: string[]
    correctAnswers: string[]
    skillArea: string
    isCorrect: boolean
  }>
  totalQuestions: number
}

export interface DiagnosisAnalysisOutput {
  skillScores: {
    llm_fundamentals: number
    prompt_engineering: number
    rag: number
    agents: number
    multimodal: number
    production_ai: number
  }
  recommendedPath: 'standard' | 'fast-track' | 'foundation-first'
  skipConcepts: string[]
  focusAreas: string[]
  summary: string
}

export async function analyzeDiagnosis(
  input: DiagnosisAnalysisInput
): Promise<DiagnosisAnalysisOutput> {
  const prompt = createDiagnosisPrompt(input)

  const message = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 2000,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const responseText = message.content[0].type === 'text'
    ? message.content[0].text
    : ''

  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response')
  }

  return JSON.parse(jsonMatch[0])
}

function createDiagnosisPrompt(input: DiagnosisAnalysisInput): string {
  const answerSummary = input.answers.map(a =>
    `- ${a.skillArea}: ${a.isCorrect ? '✓' : '✗'} (${a.question})`
  ).join('\n')

  return `You are an AI learning path advisor. Analyze this skill diagnosis quiz results and provide personalized recommendations.

Quiz Results (${input.answers.filter(a => a.isCorrect).length}/${input.totalQuestions} correct):
${answerSummary}

Provide analysis in this exact JSON format:
{
  "skillScores": {
    "llm_fundamentals": 0.0-1.0,
    "prompt_engineering": 0.0-1.0,
    "rag": 0.0-1.0,
    "agents": 0.0-1.0,
    "multimodal": 0.0-1.0,
    "production_ai": 0.0-1.0
  },
  "recommendedPath": "standard|fast-track|foundation-first",
  "skipConcepts": ["concept_slug_1", "concept_slug_2"],
  "focusAreas": ["skill_area_1", "skill_area_2"],
  "summary": "2-3 sentence summary of their readiness"
}

Scoring guidelines:
- 0.0-0.3: Beginner (needs foundation)
- 0.4-0.7: Intermediate (standard path)
- 0.8-1.0: Advanced (can skip basics)

Path recommendations:
- "foundation-first": <50% overall, needs basics
- "standard": 50-80% overall, normal pace
- "fast-track": >80% overall, skip basics

Respond ONLY with the JSON object, no additional text.`
}
