// Learning content types

export interface ConceptMetadata {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedMinutes: number
  order: number
  prerequisites?: string[]
  tags?: string[]
}

export interface SprintMetadata {
  id: string
  title: string
  description: string
  order: number
  concepts: ConceptMetadata[]
}

export interface ConceptContent {
  metadata: ConceptMetadata
  content: string
  labs?: LabDefinition[]
}

export interface LabDefinition {
  id: string
  title: string
  description: string
  type: 'quiz' | 'coding' | 'project'
  questions?: QuizQuestion[]
  instructions?: string
  startingCode?: string
  tests?: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface UserProgressData {
  sprintId: string
  conceptId: string
  status: ProgressStatus
  startedAt?: Date
  completedAt?: Date
  lastAccessed: Date
  timeSpentSeconds?: number
}

export interface ConceptProgress extends UserProgressData {
  concept: ConceptMetadata
}

export interface SprintProgress {
  sprint: SprintMetadata
  concepts: ConceptProgress[]
  completedCount: number
  totalCount: number
  percentComplete: number
}
