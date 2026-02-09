'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WorkflowNodeType } from '@/lib/workflows/types'

const NODE_MENU: { type: WorkflowNodeType; label: string; icon: string; color: string }[] = [
  { type: 'llm_call', label: 'LLM Call', icon: '🧠', color: 'bg-purple-100 text-purple-700' },
  { type: 'rag_query', label: 'RAG Query', icon: '📚', color: 'bg-blue-100 text-blue-700' },
  { type: 'web_search', label: 'Web Search', icon: '🔍', color: 'bg-amber-100 text-amber-700' },
  { type: 'data_transform', label: 'Transform', icon: '⚙️', color: 'bg-teal-100 text-teal-700' },
  { type: 'conditional', label: 'Condition', icon: '🔀', color: 'bg-rose-100 text-rose-700' },
  { type: 'output', label: 'Output', icon: '📤', color: 'bg-slate-100 text-slate-700' },
]

interface WorkflowToolbarProps {
  name: string
  onNameChange: (name: string) => void
  onAddNode: (type: WorkflowNodeType) => void
  onSave: () => Promise<void>
  onRun: (input: string) => Promise<void>
  isRunning: boolean
}

export function WorkflowToolbar({
  name,
  onNameChange,
  onAddNode,
  onSave,
  onRun,
  isRunning,
}: WorkflowToolbarProps) {
  const [showNodeMenu, setShowNodeMenu] = useState(false)
  const [showRunDialog, setShowRunDialog] = useState(false)
  const [runInput, setRunInput] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  const handleRun = async () => {
    setShowRunDialog(false)
    await onRun(runInput)
  }

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-2 flex items-center gap-3">
      {/* Workflow name */}
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-2 py-1 w-64"
        placeholder="Workflow name..."
      />

      <div className="flex-1" />

      {/* Add Node */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNodeMenu(!showNodeMenu)}
        >
          + Add Node
        </Button>
        {showNodeMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-50 w-48">
            {NODE_MENU.map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  onAddNode(item.type)
                  setShowNodeMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 text-sm text-left"
              >
                <span className={`px-1.5 py-0.5 rounded text-xs ${item.color}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </Button>

      {/* Run */}
      <div className="relative">
        <Button
          size="sm"
          onClick={() => setShowRunDialog(!showRunDialog)}
          disabled={isRunning}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isRunning ? 'Running...' : 'Run'}
        </Button>
        {showRunDialog && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-50 w-80">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Workflow Input
            </label>
            <textarea
              value={runInput}
              onChange={(e) => setRunInput(e.target.value)}
              placeholder="Enter input for the workflow..."
              className="w-full h-24 px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRunDialog(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRun}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Execute
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
