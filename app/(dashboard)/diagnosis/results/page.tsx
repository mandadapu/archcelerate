import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkillRadar } from '@/components/diagnosis/SkillRadar'
import { LearningPathCard } from '@/components/diagnosis/LearningPathCard'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
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
  const difficultyLevel = (diagnosis.difficultyLevel as string) || 'intermediate'

  // Calculate 7-Axis Architectural Scores
  const architecturalDomains = [
    { key: 'systematic_prompting', label: 'Systematic Prompting', risk: 'Vulnerable to prompt injection attacks' },
    { key: 'sovereign_governance', label: 'Sovereign Governance', risk: 'High risk for compliance failure in production' },
    { key: 'knowledge_architecture', label: 'Knowledge Architecture', risk: 'RAG systems will fail on complex queries' },
    { key: 'agentic_systems', label: 'Agentic Systems', risk: 'Agent reliability issues under load' },
    { key: 'context_engineering', label: 'Context Engineering', risk: 'Excessive token costs in production' },
    { key: 'production_systems', label: 'Production Systems', risk: 'No observability when systems fail' },
    { key: 'model_selection', label: 'Model Selection', risk: 'Suboptimal cost-performance trade-offs' },
  ]

  const architecturalScores = architecturalDomains.map(domain => ({
    ...domain,
    score: Math.round((skillScores[domain.key] || 0) * 100),
  }))

  // Find gaps (scores < 60%)
  const gaps = architecturalScores.filter(s => s.score < 60).sort((a, b) => a.score - b.score)
  const hasArchitecturalGaps = gaps.length > 0

  const levelBadgeColor = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800',
  }[difficultyLevel] || 'bg-blue-100 text-blue-800'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-slate-900">
            Your Diagnosis Results
          </h1>
          <Badge className={`${levelBadgeColor} capitalize`}>
            {difficultyLevel} Level
          </Badge>
        </div>
        <p className="text-slate-600">
          You scored {percentCorrect}% on the {difficultyLevel} difficulty quiz
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

      {/* Foundational Skills Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Foundational Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillRadar scores={skillScores} variant="foundational" />

          <div className="grid grid-cols-2 gap-4 mt-6">
            {Object.entries(skillScores)
              .filter(([skill]) => !['systematic_prompting', 'sovereign_governance', 'knowledge_architecture', 'agentic_systems', 'context_engineering', 'production_systems', 'model_selection'].includes(skill))
              .map(([skill, score]) => {
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

      {/* 7-Axis Architectural Telemetry Report */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-900">7-Axis Architectural Telemetry Report</CardTitle>
            <Badge className="bg-purple-600 text-white">Architect Level</Badge>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            These advanced decision points separate builders from architects
          </p>
        </CardHeader>
        <CardContent>
          <SkillRadar scores={skillScores} variant="architectural" />

          <div className="grid grid-cols-1 gap-3 mt-6">
            {architecturalScores.map(({ key, label, score }) => {
              const level =
                score >= 80 ? 'Architect' :
                score >= 60 ? 'Lead' :
                score >= 40 ? 'Mid' : 'Junior'

              const colorClass =
                score >= 80 ? 'bg-purple-600' :
                score >= 60 ? 'bg-blue-600' :
                score >= 40 ? 'bg-yellow-600' : 'bg-red-600'

              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-900">{label}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${colorClass}`}>
                      {score}% • {level}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClass}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis & Risk Assessment */}
      {hasArchitecturalGaps && (
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="gap-analysis" className="border-none">
                <AccordionTrigger className="hover:no-underline hover:bg-orange-50/50 rounded-lg px-4 -mx-4 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    <span className="text-lg font-semibold text-orange-900">Critical Architecture Gaps Detected</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <p className="text-slate-700 mb-4">
                    Your diagnosis reveals architectural blind spots that could lead to production failures:
                  </p>

                  <div className="space-y-3 mb-6">
                    {gaps.map(({ label, score, risk }) => (
                      <div key={label} className="bg-white border border-orange-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-slate-900">{label}</h4>
                            <p className="text-sm text-orange-700 mt-1">
                              <span className="font-bold">{score}% proficiency</span> • {risk}
                            </p>
                          </div>
                          <Badge className="bg-red-100 text-red-800">Gap</Badge>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Strategic CTA */}
                  <div className="bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Close Your Architecture Gaps</h3>
                    <p className="mb-4 text-purple-100">
                      Archcelerate's 12-week curriculum systematically addresses these blind spots with production-ready patterns,
                      real-world case studies, and hands-on projects.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/curriculum/week-1">
                        <Button className="bg-white text-purple-600 hover:bg-purple-50 font-semibold w-full sm:w-auto">
                          Start Week 1 Free
                        </Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                          View Full Curriculum
                        </Button>
                      </Link>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

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
