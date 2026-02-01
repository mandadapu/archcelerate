'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { EditorToolbar } from './EditorToolbar'
import { AIAssistant } from './AIAssistant'
import { editorExtensions } from '@/src/lib/editor/extensions'

interface RichEditorProps {
  content?: string
  onChange?: (content: string) => void
  editable?: boolean
}

export function RichEditor({ content = '', onChange, editable = true }: RichEditorProps) {
  const [showAI, setShowAI] = useState(false)
  const [selectedText, setSelectedText] = useState('')

  const editor = useEditor({
    extensions: editorExtensions,
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to, ' ')
      setSelectedText(text)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 focus:outline-none min-h-[400px]',
      },
    },
  })

  const handleInsertSuggestion = (text: string) => {
    if (editor) {
      const { from, to } = editor.state.selection
      editor.chain().focus().insertContentAt({ from, to }, text).run()
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex">
      <div className="flex-1 flex flex-col">
        {editable && <EditorToolbar editor={editor} />}

        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>

        {editable && (
          <div className="border-t border-gray-200 p-2 bg-gray-50 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {editor?.storage.characterCount?.characters() || 0} characters
            </div>
            <button
              onClick={() => setShowAI(!showAI)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                showAI
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Sparkles size={16} />
              AI Assistant
            </button>
          </div>
        )}
      </div>

      {showAI && editable && (
        <AIAssistant
          selectedText={selectedText}
          onInsert={handleInsertSuggestion}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  )
}
