'use client'

import { useState } from 'react'
import { Sparkles, Loader2, X } from 'lucide-react'
import { getAISuggestion, AISuggestion } from '@/src/lib/editor/ai-suggestions'

interface AIAssistantProps {
  selectedText: string
  onInsert: (text: string) => void
  onClose: () => void
}

export function AIAssistant({ selectedText, onInsert, onClose }: AIAssistantProps) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [error, setError] = useState('')

  const handleSuggestion = async (type: AISuggestion['type']) => {
    if (!selectedText) {
      setError('Please select some text first')
      return
    }

    setLoading(true)
    setError('')
    setSuggestion('')

    try {
      const result = await getAISuggestion(selectedText, type)
      setSuggestion(result)
    } catch (err) {
      setError('Failed to get AI suggestion. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const buttons: Array<{ type: AISuggestion['type']; label: string; description: string }> = [
    { type: 'improve', label: 'Improve', description: 'Enhance clarity and engagement' },
    { type: 'expand', label: 'Expand', description: 'Add more details' },
    { type: 'simplify', label: 'Simplify', description: 'Make it easier to understand' },
    { type: 'example', label: 'Add Example', description: 'Provide a practical example' },
  ]

  return (
    <div className="border-l border-gray-200 w-80 bg-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-purple-600" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {!selectedText && (
          <div className="text-sm text-gray-500 mb-4">
            Select some text in the editor to get AI suggestions.
          </div>
        )}

        {selectedText && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-500 mb-2">Selected Text:</div>
            <div className="text-sm bg-gray-50 p-2 rounded border border-gray-200 max-h-32 overflow-y-auto">
              {selectedText}
            </div>
          </div>
        )}

        <div className="space-y-2 mb-4">
          {buttons.map((btn) => (
            <button
              key={btn.type}
              onClick={() => handleSuggestion(btn.type)}
              disabled={loading || !selectedText}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="font-medium text-sm">{btn.label}</div>
              <div className="text-xs text-gray-500">{btn.description}</div>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 size={24} className="animate-spin text-purple-600" />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        {suggestion && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500">AI Suggestion:</div>
            <div className="text-sm bg-purple-50 p-3 rounded-lg border border-purple-200">
              {suggestion}
            </div>
            <button
              onClick={() => {
                onInsert(suggestion)
                setSuggestion('')
              }}
              className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Insert Suggestion
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
