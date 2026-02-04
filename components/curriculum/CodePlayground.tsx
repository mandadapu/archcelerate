'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Play, RotateCcw } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodePlaygroundProps {
  code: string
  title?: string
  description?: string
  exerciseType?:
    | 'token-counting'
    | 'cost-calculation'
    | 'structured-output'
    | 'prompt-caching'
    | 'content-moderation'
    | 'input-validation'
    | 'bias-detection'
    | 'accuracy-testing'
    | 'custom'
}

export function CodePlayground({
  code,
  title,
  description,
  exerciseType = 'custom'
}: CodePlaygroundProps) {
  const [editableCode, setEditableCode] = useState(code)
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRun = async () => {
    setIsRunning(true)
    setError(null)
    setOutput('')

    try {
      const response = await fetch('/api/playground/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: editableCode,
          exerciseType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute code')
      }

      setOutput(data.output)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setEditableCode(code)
    setOutput('')
    setError(null)
  }

  return (
    <Card className="p-6 space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      {/* Code Editor */}
      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-900 p-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">TypeScript</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={handleReset}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Run Code
                </>
              )}
            </Button>
          </div>
        </div>

        <textarea
          value={editableCode}
          onChange={(e) => setEditableCode(e.target.value)}
          className="w-full p-4 bg-gray-950 text-gray-100 font-mono text-sm resize-none focus:outline-none"
          rows={Math.min(editableCode.split('\n').length + 2, 30)}
          spellCheck={false}
        />
      </div>

      {/* Output Display */}
      {(output || error) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Output:</span>
          </div>
          <div className="border rounded-md bg-gray-50 dark:bg-gray-900">
            {error ? (
              <div className="p-4 text-sm text-red-600 dark:text-red-400 font-mono">
                Error: {error}
              </div>
            ) : (
              <SyntaxHighlighter
                language="text"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {output}
              </SyntaxHighlighter>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
