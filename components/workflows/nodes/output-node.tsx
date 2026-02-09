'use client'

import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { CheckCircle2 } from 'lucide-react'
import type { OutputNodeData } from '@/lib/workflows/types'

export function OutputNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as OutputNodeData

  return (
    <div
      className={`w-[220px] rounded-lg bg-white shadow-md border border-gray-200 overflow-hidden ${
        selected ? 'ring-2 ring-slate-400 border-slate-400' : ''
      }`}
    >
      {/* Target handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-slate-500 !border-2 !border-white"
      />

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 text-white"
        style={{ backgroundColor: '#475569' }}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span className="text-sm font-semibold truncate">
          {nodeData.label || 'Output'}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-slate-500 animate-pulse" />
          <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">
            Final Output
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate" title={nodeData.formatTemplate}>
          {nodeData.formatTemplate || '{{input}}'}
        </p>
      </div>
    </div>
  )
}
