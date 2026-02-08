'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getQuestionsByDifficulty } from '@/lib/quiz/questions'
import { QuizQuestion as QuizQuestionComponent } from '@/components/quiz/QuizQuestion'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { QuizNavigation } from '@/components/quiz/QuizNavigation'
import { LevelSelector } from '@/components/quiz/LevelSelector'
import { QuizAnswer, QuizQuestion, DifficultyLevel } from '@/types/diagnosis'
import { Button } from '@/components/ui/button'

export default function DiagnosisPage() {
  const router = useRouter()
  const [showLevelSelector, setShowLevelSelector] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [questionSource, setQuestionSource] = useState<'cache' | 'generated' | 'fallback'>('fallback')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch questions based on selected level
  const fetchQuestions = async (level: DifficultyLevel) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/diagnosis/questions?level=${level}`)
      const data = await response.json()

      if (data.questions && data.questions.length > 0) {
        setQuizQuestions(data.questions)
        setQuestionSource(data.source)
        console.log(`📝 Loaded ${data.questions.length} ${level} questions from ${data.source}`)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      toast.error('Using fallback questions')
      // Use fallback questions for the selected level
      const fallbackQuestions = getQuestionsByDifficulty(level)
      setQuizQuestions(fallbackQuestions.slice(0, 25))
      setQuestionSource('fallback')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickStart = () => {
    setSelectedLevel('intermediate')
    setShowLevelSelector(false)
    fetchQuestions('intermediate')
  }

  const handleLevelSelect = (level: DifficultyLevel) => {
    setSelectedLevel(level)
    setShowLevelSelector(false)
    fetchQuestions(level)
  }

  const handleChangeLevel = () => {
    if (Object.keys(answers).length > 0) {
      const confirmed = window.confirm(
        'Are you sure? Your current progress will be lost.'
      )
      if (!confirmed) return
    }
    setShowLevelSelector(true)
    setSelectedLevel(null)
    setAnswers({})
    setCurrentIndex(0)
    setQuizQuestions([])
  }

  // Show level selector on initial load
  if (showLevelSelector) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Architectural Skill Diagnosis
          </h1>
          <p className="text-lg text-slate-600">
            Choose your starting point. High-stakes systems require high-precision skills.
          </p>
        </div>
        <LevelSelector onLevelSelect={handleLevelSelect} onQuickStart={handleQuickStart} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-slate-600">Loading your {selectedLevel} quiz...</p>
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

      // Send to API for analysis (include questions and difficulty level)
      const response = await fetch('/api/diagnosis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: quizAnswers,
          questions: quizQuestions, // Include the questions used
          difficultyLevel: selectedLevel, // Include selected difficulty level
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze quiz')
      }

      const result = await response.json()

      // Redirect to personalized dashboard with real-time telemetry
      router.push('/skill-diagnosis')
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">
              Skill Diagnosis
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
              selectedLevel === 'beginner' ? 'bg-green-100 text-green-800' :
              selectedLevel === 'intermediate' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {selectedLevel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              questionSource === 'generated' ? 'bg-green-100 text-green-800' :
              questionSource === 'cache' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {questionSource === 'generated' ? '🤖 AI Generated' :
               questionSource === 'cache' ? '⚡ Cached' :
               '📋 Fallback'}
            </span>
            <Button variant="outline" size="sm" onClick={handleChangeLevel}>
              Change Level
            </Button>
          </div>
        </div>
        <p className="text-slate-600">
          Answer these {quizQuestions.length} questions to get your personalized learning path
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
