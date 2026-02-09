'use client'

import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { Shuffle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DataTransformNodeData } from '@/lib/workflows/types'

const transformLabels: Record<string, string> = {
  extract_json: 'Extract JSON',
  template: 'Template',
  combine: 'Combine',
  split: 'Split',
}

export function DataTransformNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as DataTransformNodeData

  return (
    <div
      className={`w-[220px] rounded-lg bg-white shadow-md border border-gray-200 overflow-hidden ${
        selected ? 'ring-2 ring-teal-400 border-teal-400' : ''
      }`}
    >
      {/* Target handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-teal-500 !border-2 !border-white"
      />

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 text-white"
        style={{ backgroundColor: '#14B8A6' }}
      >
        <Shuffle className="h-4 w-4 shrink-0" />
        <span className="text-sm font-semibold truncate">
          {nodeData.label || 'Transform'}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 py-0 font-medium"
        >
          {transformLabels[nodeData.transformType] || nodeData.transformType}
        </Badge>
        <p className="text-xs text-gray-500 truncate" title={nodeData.config}>
          {nodeData.config || 'No config'}
        </p>
      </div>

      {/* Source handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-teal-500 !border-2 !border-white"
      />
    </div>
  )
}
