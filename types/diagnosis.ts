export type QuestionType = 'single-choice' | 'multiple-choice' | 'code-evaluation'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

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
  difficulty: DifficultyLevel
}

export type SkillArea =
  | 'llm_fundamentals'
  | 'prompt_engineering'
  | 'rag'
  | 'agents'
  | 'multimodal'
  | 'production_ai'
  // 7 Architectural Domains
  | 'systematic_prompting'
  | 'sovereign_governance'
  | 'knowledge_architecture'
  | 'agentic_systems'
  | 'context_engineering'
  | 'production_systems'
  | 'model_selection'

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
  // 7 Architectural Domains
  systematic_prompting: number
  sovereign_governance: number
  knowledge_architecture: number
  agentic_systems: number
  context_engineering: number
  production_systems: number
  model_selection: number
}

export type LearningPath = 'standard' | 'fast-track' | 'foundation-first'

export interface DiagnosisResult {
  userId: string
  difficultyLevel?: DifficultyLevel
  answers: QuizAnswer[]
  skillScores: SkillScores
  recommendedPath: LearningPath
  skipConcepts: string[]
  focusAreas: SkillArea[]
  completedAt: string
}
