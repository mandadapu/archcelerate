'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface AgentStep {
  id: string
  step_number: number
  thought: string
  action: string
  action_input: any
  observation: string
  tokens_used: number
  latency_ms: number
  created_at: string
}

export function AgentExecutionTrace({ steps }: { steps: AgentStep[] }) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]))

  const toggleStep = (stepNum: number) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepNum)) {
      newExpanded.delete(stepNum)
    } else {
      newExpanded.add(stepNum)
    }
    setExpandedSteps(newExpanded)
  }

  if (steps.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No execution steps available
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {steps.map((step) => {
        const isExpanded = expandedSteps.has(step.step_number)

        return (
          <Card key={step.id}>
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleStep(step.step_number)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <CardTitle className="text-base">
                    Step {step.step_number}: {step.action}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{step.tokens_used} tokens</Badge>
                  <Badge variant="outline">{step.latency_ms}ms</Badge>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-4">
                {/* Thought */}
                <div>
                  <h4 className="font-semibold text-sm mb-1">Thought</h4>
                  <p className="text-sm text-muted-foreground">{step.thought}</p>
                </div>

                {/* Action Input */}
                <div>
                  <h4 className="font-semibold text-sm mb-1">Action Input</h4>
                  <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                    {JSON.stringify(step.action_input, null, 2)}
                  </pre>
                </div>

                {/* Observation */}
                <div>
                  <h4 className="font-semibold text-sm mb-1">Observation</h4>
                  <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap">
                    {step.observation}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
