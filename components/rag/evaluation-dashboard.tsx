'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, TrendingUp, AlertCircle } from 'lucide-react'
import { EvaluationSummary, EvaluationResult } from '@/lib/rag/types'

export function EvaluationDashboard() {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<EvaluationResult[] | null>(null)
  const [summary, setSummary] = useState<EvaluationSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runEvaluation() {
    setRunning(true)
    setError(null)

    try {
      // In production, datasetId would come from selection
      const datasetId = 'default-dataset-id'

      const res = await fetch('/api/rag/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datasetId }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Evaluation failed')
      }

      const data = await res.json()
      setResults(data.results)
      setSummary(data.summary)
    } catch (error) {
      console.error('Evaluation error:', error)
      setError(error instanceof Error ? error.message : 'Evaluation failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Run Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runEvaluation} disabled={running}>
            {running ? 'Running Evaluation...' : 'Start Evaluation'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{summary.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">
                  {summary.totalQuestions - summary.passed}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{(summary.passRate * 100).toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Pass Rate</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Faithfulness</span>
                  <span className="text-sm text-muted-foreground">
                    {(summary.avgFaithfulness * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={summary.avgFaithfulness * 100} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Relevance</span>
                  <span className="text-sm text-muted-foreground">
                    {(summary.avgRelevance * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={summary.avgRelevance * 100} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Coverage</span>
                  <span className="text-sm text-muted-foreground">
                    {(summary.avgCoverage * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={summary.avgCoverage * 100} />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, i) => (
                <div key={i} className="border-l-2 pl-4" style={{ borderColor: result.passed ? '#22c55e' : '#ef4444' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{result.question}</div>
                      <div className="text-sm text-muted-foreground mt-1">{result.answer}</div>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>F: {(result.metrics.faithfulness * 100).toFixed(0)}%</span>
                        <span>R: {(result.metrics.relevance * 100).toFixed(0)}%</span>
                        <span>C: {(result.metrics.coverage * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    {result.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 ml-4" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 ml-4" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
