'use client'

import { useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { InputNode } from './nodes/input-node'
import { LLMCallNode } from './nodes/llm-call-node'
import { RAGQueryNode } from './nodes/rag-query-node'
import { WebSearchNode } from './nodes/web-search-node'
import { DataTransformNode } from './nodes/data-transform-node'
import { ConditionalNode } from './nodes/conditional-node'
import { OutputNode } from './nodes/output-node'
import { NodeConfigPanel } from './node-config-panel'
import { WorkflowToolbar } from './workflow-toolbar'
import {
  WorkflowNodeType,
  WorkflowDefinition,
  DEFAULT_INPUT,
  DEFAULT_LLM_CALL,
  DEFAULT_RAG_QUERY,
  DEFAULT_WEB_SEARCH,
  DEFAULT_DATA_TRANSFORM,
  DEFAULT_CONDITIONAL,
  DEFAULT_OUTPUT,
} from '@/lib/workflows/types'

const nodeTypes = {
  input: InputNode,
  llm_call: LLMCallNode,
  rag_query: RAGQueryNode,
  web_search: WebSearchNode,
  data_transform: DataTransformNode,
  conditional: ConditionalNode,
  output: OutputNode,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NODE_DEFAULTS: Record<WorkflowNodeType, any> = {
  input: DEFAULT_INPUT,
  llm_call: DEFAULT_LLM_CALL,
  rag_query: DEFAULT_RAG_QUERY,
  web_search: DEFAULT_WEB_SEARCH,
  data_transform: DEFAULT_DATA_TRANSFORM,
  conditional: DEFAULT_CONDITIONAL,
  output: DEFAULT_OUTPUT,
}

interface WorkflowCanvasProps {
  initialDefinition?: WorkflowDefinition
  workflowId?: string
  workflowName: string
  onSave: (name: string, definition: WorkflowDefinition) => Promise<void>
  onRun: (definition: WorkflowDefinition, input: string) => Promise<void>
  isRunning?: boolean
  nodeStatuses?: Record<string, { status: string; output?: string }>
}

// Default starting workflow with Input + Output
const defaultNodes: Node[] = [
  {
    id: 'input-1',
    type: 'input',
    position: { x: 300, y: 50 },
    data: { ...DEFAULT_INPUT },
  },
  {
    id: 'output-1',
    type: 'output',
    position: { x: 300, y: 400 },
    data: { ...DEFAULT_OUTPUT },
  },
]

const defaultEdges: Edge[] = []

function WorkflowCanvasInner({
  initialDefinition,
  workflowId,
  workflowName,
  onSave,
  onRun,
  isRunning = false,
  nodeStatuses,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialDefinition?.nodes?.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data as unknown as Record<string, unknown>,
    })) as Node[] || defaultNodes
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialDefinition?.edges?.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
    })) || defaultEdges
  )
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [name, setName] = useState(workflowName)
  const nodeIdCounter = useRef(10)

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, id: `e-${Date.now()}` }, eds))
    },
    [setEdges]
  )

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  const addNode = useCallback(
    (type: WorkflowNodeType) => {
      const id = `${type}-${++nodeIdCounter.current}`
      const newNode: Node = {
        id,
        type,
        position: { x: 300, y: 200 + Math.random() * 100 },
        data: { ...NODE_DEFAULTS[type] },
      }
      setNodes((nds) => [...nds, newNode])
      setSelectedNodeId(id)
    },
    [setNodes]
  )

  const updateNodeData = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
      )
    },
    [setNodes]
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId))
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
      setSelectedNodeId(null)
    },
    [setNodes, setEdges]
  )

  const getDefinition = useCallback((): WorkflowDefinition => {
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: (n.type || 'input') as WorkflowNodeType,
        position: n.position,
        data: n.data as any,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || undefined,
        targetHandle: e.targetHandle || undefined,
      })),
    }
  }, [nodes, edges])

  const handleSave = useCallback(async () => {
    await onSave(name, getDefinition())
  }, [name, getDefinition, onSave])

  const handleRun = useCallback(
    async (input: string) => {
      await onRun(getDefinition(), input)
    },
    [getDefinition, onRun]
  )

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId) || null
    : null

  return (
    <div className="flex h-full">
      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        <WorkflowToolbar
          name={name}
          onNameChange={setName}
          onAddNode={addNode}
          onSave={handleSave}
          onRun={handleRun}
          isRunning={isRunning}
        />
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes.map((n) => ({
              ...n,
              // Add execution status styling
              className: nodeStatuses?.[n.id]
                ? nodeStatuses[n.id].status === 'completed'
                  ? 'ring-2 ring-green-500 rounded-lg'
                  : nodeStatuses[n.id].status === 'failed'
                    ? 'ring-2 ring-red-500 rounded-lg'
                    : nodeStatuses[n.id].status === 'running'
                      ? 'ring-2 ring-blue-500 rounded-lg animate-pulse'
                      : nodeStatuses[n.id].status === 'skipped'
                        ? 'opacity-40'
                        : ''
                : '',
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            className="bg-slate-50"
          >
            <Controls />
            <MiniMap
              nodeStrokeWidth={3}
              className="!bg-white !border-slate-200"
            />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          </ReactFlow>
        </div>
      </div>

      {/* Config Panel */}
      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onUpdate={(data) => updateNodeData(selectedNode.id, data)}
          onDelete={() => deleteNode(selectedNode.id)}
          executionResult={
            nodeStatuses?.[selectedNode.id]
              ? { status: nodeStatuses[selectedNode.id].status, output: nodeStatuses[selectedNode.id].output }
              : undefined
          }
        />
      )}
    </div>
  )
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
