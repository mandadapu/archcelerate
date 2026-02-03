'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { quizQuestions as fallbackQuestions } from '@/lib/quiz/questions'
import { QuizQuestion as QuizQuestionComponent } from '@/components/quiz/QuizQuestion'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { QuizNavigation } from '@/components/quiz/QuizNavigation'
import { QuizAnswer, QuizQuestion } from '@/types/diagnosis'

export default function DiagnosisPage() {
  const router = useRouter()
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(fallbackQuestions)
  const [isLoading, setIsLoading] = useState(true)
  const [questionSource, setQuestionSource] = useState<'cache' | 'generated' | 'fallback'>('fallback')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch questions from API on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/diagnosis/questions')
        const data = await response.json()

        if (data.questions && data.questions.length > 0) {
          setQuizQuestions(data.questions)
          setQuestionSource(data.source)
          console.log(`📝 Loaded ${data.questions.length} questions from ${data.source}`)
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error)
        toast.error('Using fallback questions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-slate-600">Loading your skill diagnosis...</p>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = quizQuestions[currentIndex]
  const currentAnswer = answers[currentQuestion?.id] || []

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

      // Send to API for analysis (include questions for dynamic quiz)
      const response = await fetch('/api/diagnosis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: quizAnswers,
          questions: quizQuestions // Include the questions used
        }),
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
      toast.error('Failed to submit quiz', {
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-900">
            Skill Diagnosis
          </h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            questionSource === 'generated' ? 'bg-green-100 text-green-800' :
            questionSource === 'cache' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {questionSource === 'generated' ? '🤖 AI Generated' :
             questionSource === 'cache' ? '⚡ Cached' :
             '📋 Fallback'}
          </span>
        </div>
        <p className="text-slate-600">
          Answer these questions to get your personalized learning path
        </p>
      </div>

      <QuizProgress
        current={currentIndex + 1}
        total={quizQuestions.length}
        answered={answeredCount}
      />

      <QuizQuestionComponent
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
