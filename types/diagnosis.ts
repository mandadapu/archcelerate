export type QuestionType = 'single-choice' | 'multiple-choice' | 'code-evaluation'

export interface QuizQuestion {
  id: string
  type: QuestionType
  question: string
  code?: string
  options: {
    id: string
    text: string
  }[]
  correctAnswers: string[]
  skillArea: SkillArea
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export type SkillArea =
  | 'llm_fundamentals'
  | 'prompt_engineering'
  | 'rag'
  | 'agents'
  | 'multimodal'
  | 'production_ai'

export interface QuizAnswer {
  questionId: string
  selectedOptions: string[]
  isCorrect: boolean
}

export interface SkillScores {
  llm_fundamentals: number
  prompt_engineering: number
  rag: number
  agents: number
  multimodal: number
  production_ai: number
}

export type LearningPath = 'standard' | 'fast-track' | 'foundation-first'

export interface DiagnosisResult {
  userId: string
  answers: QuizAnswer[]
  skillScores: SkillScores
  recommendedPath: LearningPath
  skipConcepts: string[]
  focusAreas: SkillArea[]
  completedAt: string
}
