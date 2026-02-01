'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, PlayCircle, Search, Code, MessageSquare, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type AgentType = 'research' | 'code-review' | 'support'

interface AgentStep {
  stepNumber: number
  thought: string
  action: string
  observation: string
}

interface AgentExecution {
  executionId: string
  status: 'success' | 'error' | 'timeout' | 'max_iterations' | 'running' | 'failed'
  steps?: AgentStep[]
  output?: string
  totalTokens?: number
  totalCost?: number
  errorMessage?: string
}

export function AgentPlayground() {
  const [agentType, setAgentType] = useState<AgentType>('research')
  const [inputs, setInputs] = useState<any>({})
  const [execution, setExecution] = useState<AgentExecution | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAgentTypeChange = (newType: AgentType) => {
    setAgentType(newType)
    setInputs({}) // Clear inputs when changing agent type
    setExecution(null) // Clear previous execution
  }

  const runAgent = async () => {
    // Validate inputs
    if (agentType === 'research' && !inputs.topic?.trim()) {
      alert('Please enter a research topic')
      return
    }
    if (agentType === 'code-review' && (!inputs.repoUrl?.trim() || !inputs.filePaths?.length)) {
      alert('Please enter both repository URL and file paths')
      return
    }
    if (agentType === 'support' && !inputs.message?.trim()) {
      alert('Please enter a customer message')
      return
    }

    setLoading(true)
    setExecution(null)

    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentType, input: inputs })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Agent execution failed')
      }

      const result = await response.json()
      setExecution(result)
    } catch (error: any) {
      console.error('Agent execution error:', error)
      setExecution({
        executionId: '',
        status: 'failed',
        errorMessage: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'error':
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      case 'timeout':
      case 'max_iterations':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default'
      case 'error':
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Agent Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Agent Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={agentType} onValueChange={(value) => handleAgentTypeChange(value as AgentType)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Research Agent */}
              <label
                htmlFor="research"
                className={`flex flex-col items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  agentType === 'research'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <RadioGroupItem value="research" id="research" />
                  <Search className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold">Research Agent</span>
                </div>
                <p className="text-sm text-muted-foreground ml-9">
                  Search the web, analyze sources, and create comprehensive reports
                </p>
              </label>

              {/* Code Review Agent */}
              <label
                htmlFor="code-review"
                className={`flex flex-col items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  agentType === 'code-review'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <RadioGroupItem value="code-review" id="code-review" />
                  <Code className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Code Review Agent</span>
                </div>
                <p className="text-sm text-muted-foreground ml-9">
                  Fetch GitHub code, analyze quality, and provide detailed feedback
                </p>
              </label>

              {/* Customer Support Agent */}
              <label
                htmlFor="support"
                className={`flex flex-col items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  agentType === 'support'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <RadioGroupItem value="support" id="support" />
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Support Agent</span>
                </div>
                <p className="text-sm text-muted-foreground ml-9">
                  Lookup customer info, check orders, and provide helpful responses
                </p>
              </label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {agentType === 'research' && (
            <div className="space-y-2">
              <Label htmlFor="topic">Research Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Latest developments in quantum computing"
                value={inputs.topic || ''}
                onChange={(e) => setInputs({ topic: e.target.value })}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                The agent will search the web, read multiple sources, and create a comprehensive report
              </p>
            </div>
          )}

          {agentType === 'code-review' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="repoUrl">GitHub Repository URL</Label>
                <Input
                  id="repoUrl"
                  placeholder="https://github.com/username/repo"
                  value={inputs.repoUrl || ''}
                  onChange={(e) => setInputs({ ...inputs, repoUrl: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filePaths">File Paths (comma-separated)</Label>
                <Input
                  id="filePaths"
                  placeholder="src/index.ts, src/app.ts"
                  value={inputs.filePaths?.join(', ') || ''}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      filePaths: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  The agent will fetch code, analyze it, and provide detailed review feedback
                </p>
              </div>
            </>
          )}

          {agentType === 'support' && (
            <div className="space-y-2">
              <Label htmlFor="message">Customer Message</Label>
              <Textarea
                id="message"
                placeholder="Describe the customer's issue..."
                value={inputs.message || ''}
                onChange={(e) => setInputs({ message: e.target.value })}
                rows={4}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                The agent will look up customer info, check orders, and provide a helpful response
              </p>
            </div>
          )}

          <Button
            onClick={runAgent}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Running Agent...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-5 w-5" />
                Run Agent
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {(execution?.status === 'failed' || execution?.status === 'error') && execution.errorMessage && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Execution Failed:</strong> {execution.errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Timeout/Max Iterations Display */}
      {(execution?.status === 'timeout' || execution?.status === 'max_iterations') && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Notice:</strong> {execution.status === 'timeout' ? 'Execution timed out' : 'Maximum iterations reached'}
          </AlertDescription>
        </Alert>
      )}

      {/* Execution Status */}
      {execution && execution.status && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(execution.status)}
                Execution Status
              </CardTitle>
              <Badge variant={getStatusBadgeVariant(execution.status)}>
                {execution.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {execution.executionId && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Execution ID: {execution.executionId}</span>
                <Link
                  href={`/dashboard/agents/${execution.executionId}`}
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  View Details
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Execution Trace */}
      {execution && execution.steps && execution.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Trace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {execution.steps.map((step, i) => (
                <div
                  key={i}
                  className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 dark:bg-blue-950/50 rounded-r"
                >
                  <div className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                    Step {step.stepNumber}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-purple-700 dark:text-purple-300">Thought:</span>
                      <p className="text-muted-foreground mt-1">{step.thought}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700 dark:text-blue-300">Action:</span>
                      <p className="text-muted-foreground mt-1 font-mono text-xs">{step.action}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700 dark:text-green-300">Observation:</span>
                      <p className="text-muted-foreground mt-1 line-clamp-3">
                        {step.observation.substring(0, 300)}
                        {step.observation.length > 300 && '...'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Output */}
      {execution && execution.output && execution.status === 'success' && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Final Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
              <div className="whitespace-pre-wrap">{execution.output}</div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t text-sm">
              {execution.totalTokens !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Tokens:</span>
                  <span className="font-semibold">{execution.totalTokens.toLocaleString()}</span>
                </div>
              )}
              {execution.totalCost !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="font-semibold">${execution.totalCost.toFixed(4)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={getStatusBadgeVariant(execution.status)}>
                  {execution.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
