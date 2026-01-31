export interface UserContext {
  userId: string
  name: string | null
  currentSprint: number | null
  currentProject: number | null
  diagnosisCompleted: boolean
  skillScores?: Record<string, number>
  recommendedPath?: string
}

export interface ConversationContext {
  conversationId: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  contextType: 'mentor' | 'code_review' | 'interview'
  metadata?: Record<string, any>
}

export interface ProjectContext {
  projectNumber: number
  projectName: string
  userCode?: string
  submissionUrl?: string
  lastSubmission?: string
}

export interface AssembledContext {
  user: UserContext
  conversation?: ConversationContext
  project?: ProjectContext
  additionalData?: Record<string, any>
}
