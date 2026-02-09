// app/(dashboard)/workflows/[workflowId]/page.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { WorkflowCanvas } from '@/components/workflows/workflow-canvas'
import type { WorkflowDefinition } from '@/lib/workflows/types'

export default function WorkflowEditorPage() {
  const params = useParams()
  const workflowId = params.workflowId as string
  const [workflow, setWorkflow] = useState<{
    name: string
    definition: WorkflowDefinition
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [nodeStatuses, setNodeStatuses] = useState<
    Record<string, { status: string; output?: string }>
  >({})

  useEffect(() => {
    async function loadWorkflow() {
      try {
        const res = await fetch(`/api/workflows/${workflowId}`)
        if (!res.ok) {
          setError('Workflow not found')
          return
        }
        const data = await res.json()
        setWorkflow({
          name: data.workflow.name,
          definition: data.workflow.definition,
        })
      } catch {
        setError('Failed to load workflow')
      } finally {
        setLoading(false)
      }
    }
    loadWorkflow()
  }, [workflowId])

  const handleSave = useCallback(
    async (name: string, definition: WorkflowDefinition) => {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, definition }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(`Save failed: ${data.error}`)
      }
    },
    [workflowId]
  )

  const handleRun = useCallback(
    async (definition: WorkflowDefinition, input: string) => {
      setIsRunning(true)
      setNodeStatuses({})

      const pending: Record<string, { status: string }> = {}
      definition.nodes.forEach((n) => {
        pending[n.id] = { status: 'pending' }
      })
      setNodeStatuses(pending)

      try {
        const res = await fetch(`/api/workflows/${workflowId}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input }),
        })

        const data = await res.json()

        if (!res.ok) {
          alert(`Execution failed: ${data.error}`)
          setNodeStatuses({})
          return
        }

        const statuses: Record<string, { status: string; output?: string }> = {}
        if (data.nodeResults) {
          for (const [nodeId, result] of Object.entries(data.nodeResults)) {
            const r = result as { status: string; output?: string }
            statuses[nodeId] = { status: r.status, output: r.output }
          }
        }
        setNodeStatuses(statuses)
      } catch (err) {
        alert(`Execution error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setNodeStatuses({})
      } finally {
        setIsRunning(false)
      }
    },
    [workflowId]
  )

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-slate-500">Loading workflow...</div>
      </div>
    )
  }

  if (error || !workflow) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-red-500">{error || 'Workflow not found'}</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <WorkflowCanvas
        initialDefinition={workflow.definition}
        workflowId={workflowId}
        workflowName={workflow.name}
        onSave={handleSave}
        onRun={handleRun}
        isRunning={isRunning}
        nodeStatuses={nodeStatuses}
      />
    </div>
  )
}
