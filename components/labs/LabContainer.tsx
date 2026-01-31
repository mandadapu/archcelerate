'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CodeEditor } from './CodeEditor'
import { toast } from 'sonner'
import { Play, CheckCircle2 } from 'lucide-react'

interface LabContainerProps {
  labSlug: string
  sprintId: string
  conceptId: string
  title: string
  instructions: string
  starterCode: string
  testCases: Array<{ input: string; expectedOutput: string; description: string }>
  onComplete?: () => void
}

export function LabContainer({
  labSlug,
  sprintId,
  conceptId,
  title,
  instructions,
  starterCode,
  testCases,
  onComplete,
}: LabContainerProps) {
  const [code, setCode] = useState(starterCode)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isPassed, setIsPassed] = useState(false)

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('')

    try {
      const response = await fetch('/api/labs/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: 'javascript' }),
      })

      const result = await response.json()

      if (result.success) {
        setOutput(result.output)
      } else {
        setOutput(`Error: ${result.error}`)
      }
    } catch (error) {
      setOutput('Failed to execute code')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    setIsRunning(true)

    try {
      const response = await fetch('/api/labs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintId,
          conceptId,
          labSlug,
          code,
          testCases,
        }),
      })

      const result = await response.json()

      if (result.passed) {
        setIsPassed(true)
        toast.success('All tests passed! Lab complete.')
        onComplete?.()
      } else {
        toast.error(`${result.failedCount} test(s) failed`)
        setOutput(result.feedback)
      }
    } catch (error) {
      toast.error('Failed to submit lab')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p>{instructions}</p>
          </div>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Code</CardTitle>
            {isPassed && (
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Passed</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CodeEditor value={code} onChange={setCode} height="400px" />

          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleRun}
              disabled={isRunning}
              variant="outline"
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isRunning || isPassed}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? 'Testing...' : 'Submit'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output */}
      {output && (
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
              {output}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testCases.map((test, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded text-sm">
                <div className="font-medium">{test.description}</div>
                <div className="text-slate-600">
                  Input: {test.input} → Expected: {test.expectedOutput}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
