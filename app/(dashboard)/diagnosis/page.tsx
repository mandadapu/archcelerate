'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { quizQuestions } from '@/lib/quiz/questions'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { QuizNavigation } from '@/components/quiz/QuizNavigation'
import { QuizAnswer } from '@/types/diagnosis'

export default function DiagnosisPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = quizQuestions[currentIndex]
  const currentAnswer = answers[currentQuestion.id] || []

  const answeredCount = Object.keys(answers).length
  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < quizQuestions.length - 1
  const isLastQuestion = currentIndex === quizQuestions.length - 1
  const isAnswered = currentAnswer.length > 0

  const handleAnswerChange = (options: string[]) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: options,
    })
  }

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (canGoNext && isAnswered) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleSubmit = async () => {
    if (!isAnswered) return

    setIsSubmitting(true)

    try {
      // Prepare quiz results
      const quizAnswers: QuizAnswer[] = quizQuestions.map(q => {
        const selected = answers[q.id] || []
        const correct = q.correctAnswers

        // Check if answer is correct
        const isCorrect =
          selected.length === correct.length &&
          selected.every(s => correct.includes(s))

        return {
          questionId: q.id,
          selectedOptions: selected,
          isCorrect,
        }
      })

      // Send to API for analysis
      const response = await fetch('/api/diagnosis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: quizAnswers }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze quiz')
      }

      const result = await response.json()

      // Redirect to results page
      router.push('/diagnosis/results')
    } catch (error) {
      console.error('Error submitting quiz:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to submit quiz: ${message}. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Skill Diagnosis
        </h1>
        <p className="text-slate-600">
          Answer these questions to get your personalized learning path
        </p>
      </div>

      <QuizProgress
        current={currentIndex + 1}
        total={quizQuestions.length}
        answered={answeredCount}
      />

      <QuizQuestion
        question={currentQuestion}
        selectedOptions={currentAnswer}
        onAnswerChange={handleAnswerChange}
      />

      <QuizNavigation
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isLastQuestion={isLastQuestion}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isAnswered={isAnswered}
      />

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-lg font-medium">Analyzing your results...</p>
          </div>
        </div>
      )}
    </div>
  )
}
