export interface AssessmentAnswers {
  experience: 'beginner' | 'intermediate' | 'advanced'
  ai_exposure: 'none' | 'some' | 'api' | 'production'
  goal: 'learn' | 'build' | 'career' | 'business'
}

export interface LearningPath {
  id: string
  name: string
  modules: string[]
  skipModules?: string[]
  recommendedPace: 'slow' | 'medium' | 'fast'
}

export function recommendPath(answers: AssessmentAnswers): LearningPath {
  const { experience, ai_exposure, goal } = answers

  // Beginner path - comprehensive foundation
  if (experience === 'beginner' || ai_exposure === 'none') {
    return {
      id: 'full',
      name: 'Full Curriculum (Beginner Pace)',
      modules: ['all'],
      recommendedPace: 'slow',
    }
  }

  // Rapid builder path - for experienced devs who want to build quickly
  if (goal === 'build' && experience === 'advanced') {
    return {
      id: 'rapid',
      name: 'Rapid Builder',
      modules: ['1', '2', '3', '5', '7'],
      skipModules: ['4', '6'],
      recommendedPace: 'fast',
    }
  }

  // RAG specialist path - deep dive into retrieval systems
  if (goal === 'learn' && (ai_exposure === 'some' || ai_exposure === 'api')) {
    return {
      id: 'rag-specialist',
      name: 'RAG Specialist',
      modules: ['1', '2', '3'],
      recommendedPace: 'medium',
    }
  }

  // Agent developer path - focus on autonomous agents
  if (goal === 'build' && ai_exposure === 'api') {
    return {
      id: 'agent',
      name: 'Agent Developer',
      modules: ['1', '3', '5'],
      recommendedPace: 'medium',
    }
  }

  // Default full curriculum for career transition and business goals
  return {
    id: 'full',
    name: 'Full Curriculum',
    modules: ['all'],
    recommendedPace: 'medium',
  }
}

export interface UserProfile {
  userId: string
  learningPathId: string
  recommendedPace: 'slow' | 'medium' | 'fast'
  assessmentAnswers: AssessmentAnswers
  onboardingCompletedAt: Date
}

export function getUserProfileDefaults(
  userId: string,
  answers: AssessmentAnswers,
  path: LearningPath
): Omit<UserProfile, 'userId'> {
  return {
    learningPathId: path.id,
    recommendedPace: path.recommendedPace,
    assessmentAnswers: answers,
    onboardingCompletedAt: new Date(),
  }
}
