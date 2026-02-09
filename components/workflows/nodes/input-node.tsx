'use client'

import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { PlayCircle } from 'lucide-react'
import type { InputNodeData } from '@/lib/workflows/types'

export function InputNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as InputNodeData

  return (
    <div
      className={`w-[220px] rounded-lg bg-white shadow-md border border-gray-200 overflow-hidden ${
        selected ? 'ring-2 ring-emerald-400 border-emerald-400' : ''
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 text-white"
        style={{ backgroundColor: '#10B981' }}
      >
        <PlayCircle className="h-4 w-4 shrink-0" />
        <span className="text-sm font-semibold truncate">
          {nodeData.label || 'Input'}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {nodeData.description || 'Workflow input'}
        </p>
      </div>

      {/* Source handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white"
      />
    </div>
  )
}
