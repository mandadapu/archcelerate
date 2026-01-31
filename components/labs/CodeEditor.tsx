'use client'

import { Editor } from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  readOnly?: boolean
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  readOnly = false,
}: CodeEditorProps) {
  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={(value) => onChange(value || '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        readOnly,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  )
}
