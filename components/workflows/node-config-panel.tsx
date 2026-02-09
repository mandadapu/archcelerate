'use client'

import type { Node } from '@xyflow/react'
import { Button } from '@/components/ui/button'

interface NodeConfigPanelProps {
  node: Node
  onUpdate: (data: Record<string, unknown>) => void
  onDelete: () => void
  executionResult?: { status: string; output?: string }
}

export function NodeConfigPanel({ node, onUpdate, onDelete, executionResult }: NodeConfigPanelProps) {
  const data = node.data as Record<string, unknown>
  const type = node.type || ''

  const updateField = (key: string, value: unknown) => {
    onUpdate({ [key]: value })
  }

  return (
    <div className="w-80 border-l border-slate-200 bg-white overflow-y-auto">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Configure Node</h3>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-700 hover:bg-red-50">
            Delete
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-1">{type.replace('_', ' ').toUpperCase()}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Label — all nodes */}
        <Field label="Label">
          <input
            type="text"
            value={String(data.label || '')}
            onChange={(e) => updateField('label', e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
          />
        </Field>

        {/* Input node */}
        {type === 'input' && (
          <Field label="Description">
            <input
              type="text"
              value={String(data.description || '')}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
            />
          </Field>
        )}

        {/* LLM Call node */}
        {type === 'llm_call' && (
          <>
            <Field label="Model">
              <select
                value={String(data.model || 'claude-haiku-4-5-20251001')}
                onChange={(e) => updateField('model', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
              >
                <option value="claude-haiku-4-5-20251001">Claude Haiku (fast, cheap)</option>
                <option value="claude-sonnet-4-5-20250929">Claude Sonnet (powerful)</option>
              </select>
            </Field>
            <Field label="System Prompt">
              <textarea
                value={String(data.systemPrompt || '')}
                onChange={(e) => updateField('systemPrompt', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm h-20 resize-none"
              />
            </Field>
            <Field label="User Prompt Template">
              <textarea
                value={String(data.userPromptTemplate || '')}
                onChange={(e) => updateField('userPromptTemplate', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm h-20 resize-none"
                placeholder="Use {{input}} for upstream data"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Max Tokens">
                <input
                  type="number"
                  value={Number(data.maxTokens) || 1024}
                  onChange={(e) => updateField('maxTokens', parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                />
              </Field>
              <Field label="Temperature">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={Number(data.temperature) ?? 0.7}
                  onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                />
              </Field>
            </div>
          </>
        )}

        {/* RAG Query node */}
        {type === 'rag_query' && (
          <>
            <Field label="Query Template">
              <textarea
                value={String(data.queryTemplate || '')}
                onChange={(e) => updateField('queryTemplate', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm h-16 resize-none"
                placeholder="Use {{input}} for upstream data"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Top K">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={Number(data.topK) || 5}
                  onChange={(e) => updateField('topK', parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                />
              </Field>
              <Field label="Min Relevance">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={Number(data.minRelevance) ?? 0.5}
                  onChange={(e) => updateField('minRelevance', parseFloat(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                />
              </Field>
            </div>
          </>
        )}

        {/* Web Search node */}
        {type === 'web_search' && (
          <>
            <Field label="Query Template">
              <textarea
                value={String(data.queryTemplate || '')}
                onChange={(e) => updateField('queryTemplate', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm h-16 resize-none"
                placeholder="Use {{input}} for upstream data"
              />
            </Field>
            <Field label="Max Results">
              <input
                type="number"
                min="1"
                max="10"
                value={Number(data.maxResults) || 5}
                onChange={(e) => updateField('maxResults', parseInt(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
              />
            </Field>
          </>
        )}

        {/* Data Transform node */}
        {type === 'data_transform' && (
          <>
            <Field label="Transform Type">
              <select
                value={String(data.transformType || 'template')}
                onChange={(e) => updateField('transformType', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
              >
                <option value="template">Template</option>
                <option value="extract_json">Extract JSON</option>
                <option value="combine">Combine</option>
                <option value="split">Split</option>
              </select>
            </Field>
            <Field label="Config">
              <textarea
                value={String(data.config || '')}
                onChange={(e) => updateField('config', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm h-16 resize-none"
                placeholder={
                  data.transformType === 'template'
                    ? 'Use {{input}} for data'
                    : data.transformType === 'extract_json'
                      ? 'JSON path (e.g. data.result)'
                      : 'Separator or delimiter'
                }
              />
            </Field>
          </>
        )}

        {/* Conditional node */}
        {type === 'conditional' && (
          <>
            <Field label="Condition Type">
              <select
                value={String(data.conditionType || 'contains')}
                onChange={(e) => updateField('conditionType', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
              >
                <option value="contains">Contains</option>
                <option value="not_contains">Does not contain</option>
                <option value="length_gt">Length greater than</option>
                <option value="length_lt">Length less than</option>
                <option value="equals">Equals</option>
              </select>
            </Field>
            <Field label="Value">
              <input
                type="text"
                value={String(data.conditionValue || '')}
                onChange={(e) => updateField('conditionValue', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
              />
            </Field>
          </>
        )}

        {/* Output node */}
        {type === 'output' && (
          <Field label="Format Template (optional)">
            <textarea
              value={String(data.formatTemplate || '')}
              onChange={(e) => updateField('formatTemplate', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm h-16 resize-none"
              placeholder="Use {{input}} for data, or leave empty for passthrough"
            />
          </Field>
        )}

        {/* Execution Result */}
        {executionResult && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Execution Result</h4>
            <div className={`text-xs px-2 py-1 rounded inline-block mb-2 ${
              executionResult.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : executionResult.status === 'failed'
                  ? 'bg-red-100 text-red-700'
                  : executionResult.status === 'skipped'
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-blue-100 text-blue-700'
            }`}>
              {executionResult.status}
            </div>
            {executionResult.output && (
              <pre className="text-xs bg-slate-50 p-2 rounded border border-slate-200 max-h-48 overflow-auto whitespace-pre-wrap">
                {executionResult.output}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  )
}
