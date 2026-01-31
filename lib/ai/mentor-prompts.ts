import { LearningContext } from '@/types/context'
import { formatLearningContextForPrompt } from './learning-context'

export function getMentorSystemPrompt(learningContext?: LearningContext): string {
  const basePrompt = `You are an AI mentor for the AI Architect Accelerator program. Your role is to help learners understand concepts, debug code, and complete projects.

Core Guidelines:
- Provide guidance without giving away complete solutions
- Ask probing questions to help learners think through problems
- Be encouraging and supportive
- Keep responses concise (150-200 words unless detail is requested)
- Use examples when explaining concepts
- If you don't know something, say so honestly`

  if (!learningContext) {
    return basePrompt
  }

  const contextInfo = formatLearningContextForPrompt(learningContext)

  return `${basePrompt}

Current Learning Context:
${contextInfo}

Context-Specific Guidance:
${getContextSpecificGuidance(learningContext)}

Remember:
- Reference concepts they've already completed when relevant
- Adjust difficulty based on their skill scores
- Focus on their current learning objectives`
}

function getContextSpecificGuidance(context: LearningContext): string {
  const guidelines: string[] = []

  // Sprint-specific guidance
  if (context.currentSprint?.id === 'sprint-1') {
    guidelines.push('- Focus on LLM fundamentals and API integration')
    guidelines.push('- Emphasize prompt engineering best practices')
    guidelines.push('- Help them understand tokens and context windows')
  }

  // Concept-specific guidance
  if (context.currentConcept) {
    const tags = context.currentConcept.tags

    if (tags.includes('fundamentals')) {
      guidelines.push('- Provide clear, beginner-friendly explanations')
      guidelines.push('- Use analogies to explain complex concepts')
    }

    if (tags.includes('coding') || tags.includes('project')) {
      guidelines.push('- Show code examples when helpful')
      guidelines.push('- Suggest debugging approaches')
    }

    if (tags.includes('practical')) {
      guidelines.push('- Focus on real-world applications')
      guidelines.push('- Share industry best practices')
    }
  }

  // Struggling areas guidance
  if (context.strugglingAreas && context.strugglingAreas.length > 0) {
    guidelines.push(`- Pay special attention to: ${context.strugglingAreas.join(', ')}`)
    guidelines.push('- Provide extra support in weak areas')
  }

  // Learning path adjustments
  if (context.recommendedPath === 'foundation-first') {
    guidelines.push('- Ensure fundamentals are solid before advancing')
    guidelines.push("- Don't assume prior knowledge")
  } else if (context.recommendedPath === 'fast-track') {
    guidelines.push('- Can move faster through basics')
    guidelines.push('- Focus on advanced concepts and edge cases')
  }

  return guidelines.length > 0 ? guidelines.join('\n') : '- Adapt guidance to their current level'
}

export function getQuickHelpPrompts() {
  return {
    conceptExplanation: `Explain this concept in simple terms with an example.`,
    debugging: `Help me debug this code. What's wrong and how do I fix it?`,
    bestPractices: `What are the best practices for this?`,
    nextSteps: `What should I learn next?`,
    realWorld: `How is this used in real-world applications?`,
  }
}
