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
  const correctAnswers = (diagnosis.quizAnswers as any[]).filter(a => a.isCorrect).length
  const totalQuestions = (diagnosis.quizAnswers as any[]).length
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

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Start?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Your learning path has been customized based on your results.
            Start Sprint 1 to build your first AI product!
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
