'use client'

import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { BrainCircuit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { LLMCallNodeData } from '@/lib/workflows/types'

function formatModelName(model: string): string {
  if (model.includes('haiku')) return 'Haiku'
  if (model.includes('sonnet')) return 'Sonnet'
  return model
}

export function LLMCallNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as LLMCallNodeData

  return (
    <div
      className={`w-[220px] rounded-lg bg-white shadow-md border border-gray-200 overflow-hidden ${
        selected ? 'ring-2 ring-violet-400 border-violet-400' : ''
      }`}
    >
      {/* Target handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white"
      />

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 text-white"
        style={{ backgroundColor: '#8B5CF6' }}
      >
        <BrainCircuit className="h-4 w-4 shrink-0" />
        <span className="text-sm font-semibold truncate">
          {nodeData.label || 'LLM Call'}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 font-medium"
          >
            {formatModelName(nodeData.model)}
          </Badge>
          <span className="text-[10px] text-gray-400">
            {nodeData.maxTokens} tok
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate" title={nodeData.systemPrompt}>
          {nodeData.systemPrompt || 'No system prompt'}
        </p>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400">
            temp: {nodeData.temperature}
          </span>
        </div>
      </div>

      {/* Source handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white"
      />
    </div>
  )
}
