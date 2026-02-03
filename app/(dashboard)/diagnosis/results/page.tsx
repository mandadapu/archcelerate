import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SkillRadar } from '@/components/diagnosis/SkillRadar'
import { LearningPathCard } from '@/components/diagnosis/LearningPathCard'
import Link from 'next/link'

export default async function DiagnosisResultsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  // Fetch diagnosis results
  const diagnosis = await prisma.skillDiagnosis.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  if (!diagnosis) {
    redirect('/diagnosis')
  }

  const skillScores = diagnosis.skillScores as any
  const quizAnswers = diagnosis.quizAnswers as any[]
  const quizQuestions = diagnosis.quizQuestions as any[] || []
  const correctAnswers = quizAnswers.filter(a => a.isCorrect).length
  const totalQuestions = quizAnswers.length
  const percentCorrect = Math.round((correctAnswers / totalQuestions) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Your Diagnosis Results
        </h1>
        <p className="text-slate-600">
          Based on your quiz performance, here&apos;s your personalized learning path
        </p>
      </div>

      {/* Score Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {percentCorrect}%
              </div>
              <p className="text-slate-600">
                {correctAnswers} out of {totalQuestions} questions correct
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Path Recommendation */}
      <LearningPathCard
        path={diagnosis.recommendedPath as any}
        summary="Based on your results, this path will help you build AI products most effectively."
      />

      {/* Skill Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillRadar scores={skillScores} />

          <div className="grid grid-cols-2 gap-4 mt-6">
            {Object.entries(skillScores).map(([skill, score]) => {
              const percentage = Math.round((score as number) * 100)
              const level =
                percentage >= 80 ? 'Advanced' :
                percentage >= 50 ? 'Intermediate' : 'Beginner'

              return (
                <div key={skill} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">
                      {skill.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium">{level}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      {quizQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {quizQuestions.map((question, index) => {
                const answer = quizAnswers.find(a => a.questionId === question.id)
                if (!answer) return null

                const userAnswer = answer.selectedOptions[0] // Assuming single choice
                const correctAnswer = question.correctAnswers[0]
                const isCorrect = answer.isCorrect

                const userOption = question.options.find((o: any) => o.id === userAnswer)
                const correctOption = question.options.find((o: any) => o.id === correctAnswer)

                return (
                  <div
                    key={question.id}
                    className={`border-l-4 pl-4 py-3 ${
                      isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-slate-900">
                        {index + 1}. {question.question}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isCorrect ? '✓ Correct' : '✗ Wrong'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-slate-700">Your answer: </span>
                        <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                          {userOption?.text || userAnswer}
                        </span>
                      </div>

                      {!isCorrect && (
                        <div>
                          <span className="font-medium text-slate-700">Correct answer: </span>
                          <span className="text-green-700">
                            {correctOption?.text || correctAnswer}
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-slate-600 mt-2">
                        <span className="font-medium">Skill Area: </span>
                        <span className="capitalize">{question.skillArea?.replace(/_/g, ' ')}</span>
                        {' • '}
                        <span className="capitalize">{question.difficulty}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Start?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Your learning path has been customized based on your results.
            Start Week 1 to build your first AI product!
          </p>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Go to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
