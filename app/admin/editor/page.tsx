'use client'

import { useState } from 'react'
import { RichEditor } from '@/src/components/editor/RichEditor'
import { Save, FileDown, Eye } from 'lucide-react'

export default function EditorPage() {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [preview, setPreview] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    // TODO: Implement save to database
    console.log('Saving content:', { title, content })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => {
    const mdxContent = `---
title: "${title}"
description: ""
duration: 30
difficulty: "beginner"
objectives:
  - ""
---

${content}
`
    const blob = new Blob([mdxContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.mdx`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Content Editor</h1>
          <p className="text-gray-600">Create and edit lesson content with AI assistance</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Lesson Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setPreview(false)}
              className={`px-4 py-2 rounded-lg ${
                !preview
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setPreview(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                preview
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye size={16} />
              Preview
            </button>
          </div>

          {!preview ? (
            <RichEditor content={content} onChange={setContent} />
          ) : (
            <div className="border border-gray-200 rounded-lg p-6 bg-white min-h-[400px]">
              <h2 className="text-2xl font-bold mb-4">{title || 'Untitled'}</h2>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            <Save size={18} />
            {saved ? 'Saved!' : 'Save Lesson'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            <FileDown size={18} />
            Export as MDX
          </button>
        </div>
      </div>
    </div>
  )
}
