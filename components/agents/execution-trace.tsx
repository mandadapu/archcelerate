'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2, Wrench } from 'lucide-react'

interface ExecutionTraceProps {
  steps: any[]
  toolCalls: any[]
}

export function ExecutionTrace({ steps, toolCalls }: ExecutionTraceProps) {
  return (
    <div className="space-y-4">
      {steps.map((step) => {
        // Find tool calls for this step
        const stepToolCalls = toolCalls.filter(
          (tc) => tc.step_id === step.id
        )

        return (
          <Card key={step.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Step {step.step_number}: {step.action_name}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {step.tokens_used || 0} tokens
                  </Badge>
                  <Badge variant="outline">
                    {step.latency_ms || 0}ms
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Thought (Reasoning) */}
              {step.thought && (
                <div>
                  <div className="text-sm font-medium mb-1">Thought:</div>
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {step.thought}
                  </div>
                </div>
              )}

              {/* Action */}
              {step.action_name !== 'finish' && (
                <div>
                  <div className="text-sm font-medium mb-1">Action:</div>
                  <div className="text-sm">
                    <code className="bg-muted px-2 py-1 rounded">
                      {step.action_name}
                    </code>
                    {step.action_input && (
                      <pre className="mt-2 bg-muted p-3 rounded-md overflow-x-auto text-xs">
                        {typeof step.action_input === 'string'
                          ? step.action_input
                          : JSON.stringify(step.action_input, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* Tool Calls */}
              {stepToolCalls.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Tool Calls:
                  </div>
                  <div className="space-y-2">
                    {stepToolCalls.map((tc) => (
                      <div
                        key={tc.id}
                        className="flex items-start gap-2 text-sm bg-muted p-3 rounded-md"
                      >
                        {tc.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{tc.tool_name}</div>
                          {tc.parameters && (
                            <pre className="mt-1 text-xs overflow-x-auto">
                              {typeof tc.parameters === 'string'
                                ? tc.parameters
                                : JSON.stringify(tc.parameters, null, 2)}
                            </pre>
                          )}
                          {tc.result && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Result:{' '}
                              {typeof tc.result === 'string'
                                ? tc.result
                                : JSON.stringify(tc.result)}
                            </div>
                          )}
                          {tc.error && (
                            <div className="mt-2 text-xs text-red-500">
                              Error: {tc.error}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observation */}
              {step.observation && (
                <div>
                  <div className="text-sm font-medium mb-1">Observation:</div>
                  <div className="text-sm bg-muted p-3 rounded-md max-h-64 overflow-y-auto">
                    {typeof step.observation === 'string'
                      ? step.observation
                      : JSON.stringify(step.observation, null, 2)}
                  </div>
                </div>
              )}

              {/* Final Answer (for finish action) */}
              {step.action_name === 'finish' && step.action_input && (
                <div>
                  <div className="text-sm font-medium mb-1">Final Answer:</div>
                  <div className="text-sm bg-green-50 dark:bg-green-950 p-3 rounded-md">
                    {typeof step.action_input === 'string'
                      ? step.action_input
                      : JSON.stringify(step.action_input, null, 2)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {steps.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No execution steps found
        </div>
      )}
    </div>
  )
}
