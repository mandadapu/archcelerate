import { QuizAnswer } from '@/types/diagnosis'
import { quizQuestions as defaultQuestions } from '@/lib/quiz/questions'

export function validateQuizAnswers(
  answers: QuizAnswer[],
  questions: any[] = defaultQuestions
): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check if all questions are answered
  if (answers.length !== questions.length) {
    errors.push(`Expected ${questions.length} answers, got ${answers.length}`)
  }

  // Validate each answer
  answers.forEach((answer, index) => {
    const question = questions.find(q => q.id === answer.questionId)

    if (!question) {
      errors.push(`Invalid question ID at index ${index}: ${answer.questionId}`)
      return
    }

    // Check if selected options are valid
    const invalidOptions = answer.selectedOptions.filter(
      opt => !question.options.some((o: any) => o.id === opt)
    )

    if (invalidOptions.length > 0) {
      errors.push(`Invalid options for question ${question.id}: ${invalidOptions.join(', ')}`)
    }

    // Check answer type constraints
    if (question.type === 'single-choice' && answer.selectedOptions.length > 1) {
      errors.push(`Question ${question.id} should have only one answer`)
    }

    if (answer.selectedOptions.length === 0) {
      errors.push(`Question ${question.id} has no answer selected`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}
