import { aiService } from './service'
import { getReviewSystemPrompt } from './review-prompts'
import { CodeReviewResult } from '@/types/code-review'

export async function reviewCode(
  files: Array<{ path: string; content: string }>,
  projectNumber: number
): Promise<CodeReviewResult> {
  // Prepare code for review
  const codeContext = files
    .map(f => `File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
    .join('\n\n---\n\n')

  const systemPrompt = getReviewSystemPrompt(projectNumber, files)

  const prompt = `Review this code submission:\n\n${codeContext}`

  // Call AI with retry logic
  const response = await aiService.chatWithRetry(
    {
      systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      maxTokens: 4096,
    },
    3
  )

  // Parse JSON response
  const jsonMatch = response.content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse review response')
  }

  const rawReview = JSON.parse(jsonMatch[0])

  // Convert to standardized format
  return {
    overallScore: Math.round((rawReview.overall_score || 0) * 100),
    scores: {
      functionality: Math.round((rawReview.functionality_score || 0) * 100),
      codeQuality: Math.round((rawReview.code_quality_score || 0) * 100),
      aiBestPractices: Math.round((rawReview.ai_best_practices_score || 0) * 100),
      architecture: Math.round((rawReview.architecture_score || 0) * 100),
    },
    suggestions: rawReview.suggestions || [],
    goodPractices: rawReview.good_practices || [],
    criticalIssues: rawReview.critical_issues || [],
    improvementsNeeded: rawReview.improvements_needed || [],
    summary: rawReview.summary || 'Review completed',
  }
}
