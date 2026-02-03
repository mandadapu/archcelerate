'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  options: Array<{ id: string; text: string }>
  correctAnswer: string
  difficulty: string
}

interface ConceptQuizProps {
  conceptSlug: string
  conceptTitle: string
}

export function ConceptQuiz({ conceptSlug, conceptTitle }: ConceptQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    fetchQuestions()
  }, [conceptSlug, conceptTitle])

  const fetchQuestions = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/quiz/concept?slug=${encodeURIComponent(conceptSlug)}&title=${encodeURIComponent(conceptTitle)}`
      )

      if (!response.ok) {
        throw new Error('Failed to load quiz questions')
      }

      const data = await response.json()
      setQuestions(data.questions)
      setSelectedAnswers({})
      setCurrentQuestion(0)
      setShowResults(false)
      setScore(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    // Calculate score
    let correctCount = 0
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++
      }
    })
    setScore(correctCount)
    setShowResults(true)

    // Save quiz attempt to database
    try {
      await fetch('/api/quiz/concept/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptSlug,
          questions,
          answers: selectedAnswers,
          score: correctCount,
          totalQuestions: questions.length,
        }),
      })
    } catch (error) {
      console.error('Failed to save quiz attempt:', error)
      // Don't block the UI if saving fails
    }
  }

  const handleRetake = () => {
    setSelectedAnswers({})
    setCurrentQuestion(0)
    setShowResults(false)
    setScore(0)
  }

  if (loading) {
    return (
      <Card className="mt-8">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading quiz questions...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mt-8 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Quiz Unavailable</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchQuestions} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (questions.length === 0) {
    return null
  }

  // Results view
  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    const passed = percentage >= 70

    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
          <CardDescription>
            You scored {score} out of {questions.length} ({percentage}%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className={`p-6 rounded-lg text-center ${
            passed ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'
          }`}>
            <div className="text-5xl font-bold mb-2">
              {passed ? (
                <CheckCircle className="inline-block h-16 w-16 text-green-600" />
              ) : (
                <span className="text-yellow-600">{percentage}%</span>
              )}
            </div>
            <p className="text-lg font-medium">
              {passed ? 'Great job! You passed!' : 'Keep learning and try again!'}
            </p>
          </div>

          {/* Question-by-question review */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Review Your Answers</h3>
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[question.id]
              const isCorrect = userAnswer === question.correctAnswer
              const userOption = question.options.find(o => o.id === userAnswer)
              const correctOption = question.options.find(o => o.id === question.correctAnswer)

              return (
                <div
                  key={question.id}
                  className={`border-l-4 pl-4 py-3 rounded-r ${
                    isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-900 text-sm">
                      {index + 1}. {question.question}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${
                      isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? '✓ Correct' : '✗ Wrong'}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Your answer: </span>
                      <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                        {userOption?.text || 'Not answered'}
                      </span>
                    </div>

                    {!isCorrect && (
                      <div>
                        <span className="font-medium text-slate-700">Correct answer: </span>
                        <span className="text-green-700">
                          {correctOption?.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleRetake} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake Quiz
            </Button>
            <Button onClick={fetchQuestions} variant="outline">
              Generate New Questions
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Quiz view
  const question = questions[currentQuestion]
  const selectedAnswer = selectedAnswers[question.id]
  const allAnswered = questions.every(q => selectedAnswers[q.id])

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Test Your Understanding</CardTitle>
        <CardDescription>
          Question {currentQuestion + 1} of {questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            {question.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(question.id, option.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === option.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center ${
                    selectedAnswer === option.id
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-slate-300'
                  }`}>
                    {selectedAnswer === option.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-slate-700">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty badge */}
        <div className="flex items-center">
          <span className="text-xs text-slate-500 mr-2">Difficulty:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            question.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
            question.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Previous
          </Button>

          <div className="text-sm text-slate-500">
            {Object.keys(selectedAnswers).length} of {questions.length} answered
          </div>

          {currentQuestion < questions.length - 1 ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
