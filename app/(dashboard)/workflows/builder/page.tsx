// app/(dashboard)/workflows/builder/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { WorkflowCanvas } from '@/components/workflows/workflow-canvas'
import type { WorkflowDefinition } from '@/lib/workflows/types'

export default function WorkflowBuilderPage() {
  const router = useRouter()
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [nodeStatuses, setNodeStatuses] = useState<
    Record<string, { status: string; output?: string }>
  >({})

  const handleSave = useCallback(
    async (name: string, definition: WorkflowDefinition) => {
      if (workflowId) {
        // Update existing
        const res = await fetch(`/api/workflows/${workflowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, definition }),
        })
        if (!res.ok) {
          const data = await res.json()
          alert(`Save failed: ${data.error}`)
        }
      } else {
        // Create new
        const res = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, definition }),
        })
        if (res.ok) {
          const data = await res.json()
          setWorkflowId(data.workflow.id)
          // Update URL without full navigation
          window.history.replaceState(null, '', `/workflows/${data.workflow.id}`)
        } else {
          const data = await res.json()
          alert(`Save failed: ${data.error}`)
        }
      }
    },
    [workflowId]
  )

  const handleRun = useCallback(
    async (definition: WorkflowDefinition, input: string) => {
      // Save first if needed
      if (!workflowId) {
        await handleSave('Untitled Workflow', definition)
      }

      const currentId = workflowId
      if (!currentId) {
        alert('Please save the workflow first')
        return
      }

      setIsRunning(true)
      setNodeStatuses({})

      // Mark all nodes as pending
      const pending: Record<string, { status: string }> = {}
      definition.nodes.forEach((n) => {
        pending[n.id] = { status: 'pending' }
      })
      setNodeStatuses(pending)

      try {
        const res = await fetch(`/api/workflows/${currentId}/execute`, {
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

        // Update node statuses from results
        const statuses: Record<string, { status: string; output?: string }> = {}
        if (data.nodeResults) {
          for (const [nodeId, result] of Object.entries(data.nodeResults)) {
            const r = result as { status: string; output?: string }
            statuses[nodeId] = { status: r.status, output: r.output }
          }
        }
        setNodeStatuses(statuses)
      } catch (error) {
        alert(`Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setNodeStatuses({})
      } finally {
        setIsRunning(false)
      }
    },
    [workflowId, handleSave]
  )

  return (
    <div className="h-[calc(100vh-4rem)]">
      <WorkflowCanvas
        workflowName="Untitled Workflow"
        onSave={handleSave}
        onRun={handleRun}
        isRunning={isRunning}
        nodeStatuses={nodeStatuses}
      />
    </div>
  )
}
