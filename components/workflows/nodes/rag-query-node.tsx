'use client'

import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { Database } from 'lucide-react'
import type { RAGQueryNodeData } from '@/lib/workflows/types'

export function RAGQueryNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as RAGQueryNodeData

  return (
    <div
      className={`w-[220px] rounded-lg bg-white shadow-md border border-gray-200 overflow-hidden ${
        selected ? 'ring-2 ring-blue-400 border-blue-400' : ''
      }`}
    >
      {/* Target handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 text-white"
        style={{ backgroundColor: '#3B82F6' }}
      >
        <Database className="h-4 w-4 shrink-0" />
        <span className="text-sm font-semibold truncate">
          {nodeData.label || 'RAG Query'}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <p className="text-xs text-gray-500 truncate" title={nodeData.queryTemplate}>
          {nodeData.queryTemplate || '{{input}}'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            Top K: <span className="font-medium text-gray-600">{nodeData.topK}</span>
          </span>
          <span className="text-[10px] text-gray-400">
            Min: <span className="font-medium text-gray-600">{nodeData.minRelevance}</span>
          </span>
        </div>
      </div>

      {/* Source handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
    </div>
  )
}
