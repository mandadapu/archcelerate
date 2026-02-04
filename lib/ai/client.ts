import { aiService } from './service'

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
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced'
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

  const response = await aiService.chat({
    systemPrompt: 'You are an expert AI learning path advisor.',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    maxTokens: 2000,
  })

  // Parse JSON response
  const jsonMatch = response.content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response')
  }

  return JSON.parse(jsonMatch[0])
}

function createDiagnosisPrompt(input: DiagnosisAnalysisInput): string {
  const answerSummary = input.answers.map(a =>
    `- ${a.skillArea}: ${a.isCorrect ? '✓' : '✗'} (${a.question})`
  ).join('\n')

  const difficultyLevel = input.difficultyLevel || 'intermediate'
  const correctCount = input.answers.filter(a => a.isCorrect).length
  const scorePercentage = Math.round((correctCount / input.totalQuestions) * 100)

  const pathRecommendationGuidelines = {
    beginner: `
For BEGINNER quiz (${scorePercentage}% correct):
- >80% correct → "standard" path (ready for normal pace)
- 50-80% correct → "standard" path (proceed with support)
- <50% correct → "foundation-first" (needs more basics)`,
    intermediate: `
For INTERMEDIATE quiz (${scorePercentage}% correct):
- >80% correct → "fast-track" (skip basics)
- 60-80% correct → "standard" path (normal pace)
- <60% correct → "foundation-first" (review fundamentals)`,
    advanced: `
For ADVANCED quiz (${scorePercentage}% correct):
- >60% correct → "fast-track" (highly skilled, skip basics)
- 40-60% correct → "standard" path (solid foundation)
- <40% correct → "foundation-first" (strengthen fundamentals)`
  }

  return `You are an AI learning path advisor. Analyze this skill diagnosis quiz results and provide personalized recommendations.

Quiz Difficulty Level: ${difficultyLevel.toUpperCase()}
Quiz Results: ${correctCount}/${input.totalQuestions} correct (${scorePercentage}%)

Answer Breakdown:
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
- 0.0-0.3: Beginner level skills (needs foundation)
- 0.4-0.7: Intermediate level skills (solid foundation)
- 0.8-1.0: Advanced level skills (expert knowledge)

Path recommendations based on difficulty level:
${pathRecommendationGuidelines[difficultyLevel]}

IMPORTANT: Consider the quiz difficulty when recommending paths. A ${scorePercentage}% score on a ${difficultyLevel} quiz indicates different skill levels than the same score on a different difficulty.

Respond ONLY with the JSON object, no additional text.`
}
