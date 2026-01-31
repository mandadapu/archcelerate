export interface CodeReviewRequest {
  repositoryUrl: string
  deployedUrl?: string
  projectNumber: number
}

export interface CodeReviewSuggestion {
  file: string
  line?: number
  severity: 'error' | 'warning' | 'suggestion' | 'praise'
  category: string
  issue: string
  recommendation: string
  why: string
}

export interface CodeReviewResult {
  overallScore: number
  scores: {
    functionality: number
    codeQuality: number
    aiBestPractices: number
    architecture: number
  }
  suggestions: CodeReviewSuggestion[]
  goodPractices: string[]
  criticalIssues: string[]
  improvementsNeeded: string[]
  summary: string
}
