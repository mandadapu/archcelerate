export const PROJECT_RUBRICS: Record<number, string> = {
  1: `Project 1: AI Chat Assistant

Functionality Requirements:
- Chat interface with streaming responses
- Conversation history persistence
- System prompt customization
- Working deployment with public URL
- Error handling for API failures

Code Quality Requirements:
- Clean, readable code
- Proper TypeScript typing
- Component organization
- Code comments where needed

AI Best Practices:
- Proper API error handling
- Streaming implementation
- Rate limiting or usage tracking
- Cost-conscious API usage

Architecture:
- Separation of concerns
- API route structure
- State management
- Database integration`,

  // Add more project rubrics as needed
}

export function getReviewSystemPrompt(
  projectNumber: number,
  files: Array<{ path: string; content: string }>
): string {
  const rubric = PROJECT_RUBRICS[projectNumber] || 'General AI project review'

  const fileList = files.map(f => `- ${f.path} (${f.content.length} chars)`).join('\n')

  return `You are an expert code reviewer specializing in AI applications. Review this project submission against the rubric.

Project Rubric:
${rubric}

Files to Review:
${fileList}

Provide structured feedback in this exact JSON format:
{
  "overall_score": 0.0-1.0,
  "functionality_score": 0.0-1.0,
  "code_quality_score": 0.0-1.0,
  "ai_best_practices_score": 0.0-1.0,
  "architecture_score": 0.0-1.0,
  "suggestions": [
    {
      "file": "path/to/file",
      "line": 45 (optional),
      "severity": "error|warning|suggestion|praise",
      "category": "Category name",
      "issue": "What's wrong or what's good",
      "recommendation": "What to do",
      "why": "Educational explanation"
    }
  ],
  "good_practices": ["Things done well"],
  "critical_issues": ["Must-fix issues"],
  "improvements_needed": ["Nice-to-have improvements"],
  "summary": "2-3 sentence overall assessment"
}

Scoring Guide:
- 0.9-1.0: Excellent, production-ready
- 0.7-0.89: Good, minor improvements
- 0.5-0.69: Acceptable, several issues
- <0.5: Needs significant work

Respond ONLY with the JSON object, no additional text.`
}
