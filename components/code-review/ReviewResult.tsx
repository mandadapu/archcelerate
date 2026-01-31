import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SuggestionCard } from './SuggestionCard'

interface ReviewResultProps {
  review: {
    overallScore: number
    scores: {
      functionality: number
      codeQuality: number
      aiBestPractices: number
      architecture: number
    }
    suggestions: any[]
    goodPractices: string[]
    criticalIssues: string[]
    improvementsNeeded: string[]
    summary: string
  }
}

export function ReviewResult({ review }: ReviewResultProps) {
  const scoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const errors = review.suggestions.filter(s => s.severity === 'error')
  const warnings = review.suggestions.filter(s => s.severity === 'warning')
  const suggestions = review.suggestions.filter(s => s.severity === 'suggestion')
  const praise = review.suggestions.filter(s => s.severity === 'praise')

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
          <CardDescription>{review.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className={`text-6xl font-bold ${scoreColor(review.overallScore)}`}>
              {review.overallScore}/100
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(review.scores).map(([key, score]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`font-medium ${scoreColor(score)}`}>
                    {score}/100
                  </span>
                </div>
                <Progress value={score} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {review.criticalIssues.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">Critical Issues</CardTitle>
            <CardDescription>These must be fixed</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {review.criticalIssues.map((issue, i) => (
                <li key={i} className="text-red-800">{issue}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Good Practices */}
      {review.goodPractices.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Good Practices</CardTitle>
            <CardDescription>Things you did well</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {review.goodPractices.map((practice, i) => (
                <li key={i} className="text-green-800">{practice}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Detailed Feedback */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Detailed Feedback</h2>

        {errors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-red-900">
              Errors ({errors.length})
            </h3>
            {errors.map((suggestion, i) => (
              <SuggestionCard key={i} suggestion={suggestion} />
            ))}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-yellow-900">
              Warnings ({warnings.length})
            </h3>
            {warnings.map((suggestion, i) => (
              <SuggestionCard key={i} suggestion={suggestion} />
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-blue-900">
              Suggestions ({suggestions.length})
            </h3>
            {suggestions.map((suggestion, i) => (
              <SuggestionCard key={i} suggestion={suggestion} />
            ))}
          </div>
        )}

        {praise.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-green-900">
              Praise ({praise.length})
            </h3>
            {praise.map((suggestion, i) => (
              <SuggestionCard key={i} suggestion={suggestion} />
            ))}
          </div>
        )}
      </div>

      {/* Improvements Needed */}
      {review.improvementsNeeded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Improvements</CardTitle>
            <CardDescription>Consider addressing these</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {review.improvementsNeeded.map((improvement, i) => (
                <li key={i} className="text-slate-700">{improvement}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
