'use client'

import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { GitBranch } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ConditionalNodeData } from '@/lib/workflows/types'

const conditionLabels: Record<string, string> = {
  contains: 'Contains',
  not_contains: 'Not Contains',
  length_gt: 'Length >',
  length_lt: 'Length <',
  equals: 'Equals',
}

export function ConditionalNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ConditionalNodeData

  return (
    <div
      className={`w-[220px] rounded-lg bg-white shadow-md border border-gray-200 overflow-hidden ${
        selected ? 'ring-2 ring-rose-400 border-rose-400' : ''
      }`}
      style={{
        clipPath:
          'polygon(50% 0%, 100% 8%, 100% 92%, 50% 100%, 0% 92%, 0% 8%)',
      }}
    >
      {/* Target handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white"
      />

      {/* Header */}
      <div
        className="flex items-center justify-center gap-2 px-3 py-2 text-white"
        style={{ backgroundColor: '#F43F5E' }}
      >
        <GitBranch className="h-4 w-4 shrink-0" />
        <span className="text-sm font-semibold truncate">
          {nodeData.label || 'Condition'}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 py-0 font-medium"
        >
          {conditionLabels[nodeData.conditionType] || nodeData.conditionType}
        </Badge>
        <p className="text-xs text-gray-500 truncate" title={nodeData.conditionValue}>
          {nodeData.conditionValue || '(empty)'}
        </p>
        {/* True / False labels */}
        <div className="flex justify-between text-[10px] font-medium pt-1">
          <span className="text-emerald-600">True</span>
          <span className="text-rose-600">False</span>
        </div>
      </div>

      {/* Source handle: true (left-bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white"
        style={{ left: '30%' }}
      />

      {/* Source handle: false (right-bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white"
        style={{ left: '70%' }}
      />
    </div>
  )
}
