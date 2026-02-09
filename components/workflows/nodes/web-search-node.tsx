'use client'

import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { Globe } from 'lucide-react'
import type { WebSearchNodeData } from '@/lib/workflows/types'

export function WebSearchNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as WebSearchNodeData

  return (
    <div
      className={`w-[220px] rounded-lg bg-white shadow-md border border-gray-200 overflow-hidden ${
        selected ? 'ring-2 ring-amber-400 border-amber-400' : ''
      }`}
    >
      {/* Target handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
      />

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 text-white"
        style={{ backgroundColor: '#F59E0B' }}
      >
        <Globe className="h-4 w-4 shrink-0" />
        <span className="text-sm font-semibold truncate">
          {nodeData.label || 'Web Search'}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <p className="text-xs text-gray-500 truncate" title={nodeData.queryTemplate}>
          {nodeData.queryTemplate || '{{input}}'}
        </p>
        <div className="flex items-center">
          <span className="text-[10px] text-gray-400">
            Max results: <span className="font-medium text-gray-600">{nodeData.maxResults}</span>
          </span>
        </div>
      </div>

      {/* Source handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
      />
    </div>
  )
}
