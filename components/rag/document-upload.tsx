'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, CheckCircle2, XCircle } from 'lucide-react'
import { validateFile } from '@/lib/rag/utils'
import { ERROR_MESSAGES } from '@/lib/rag/constants'

export function DocumentUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      setStatus('error')
      setErrorMessage(validation.error || 'Invalid file')
      return
    }

    setUploading(true)
    setStatus('uploading')
    setProgress(0)
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      setProgress(50)
      setStatus('processing')

      const data = await response.json()

      // Poll for processing completion
      await pollProcessingStatus(data.documentId)

      setProgress(100)
      setStatus('success')

      // Notify parent component
      onUploadComplete?.()
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  async function pollProcessingStatus(documentId: string) {
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const response = await fetch(`/api/documents/${documentId}/status`)
      const data = await response.json()

      if (data.status === 'completed') {
        return
      } else if (data.status === 'failed') {
        throw new Error(data.error || 'Processing failed')
      }

      setProgress(50 + i * 1.5)
    }

    throw new Error('Processing timeout')
  }

  return (
    <div className="border-2 border-dashed rounded-lg p-8">
      <div className="flex flex-col items-center gap-4">
        {status === 'idle' && (
          <>
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-semibold mb-1">Upload Documents</h3>
              <p className="text-sm text-muted-foreground">PDF, DOCX, TXT, or MD files (max 10MB)</p>
            </div>
            <label>
              <Button variant="outline" disabled={uploading} asChild>
                <span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleUpload}
                    aria-label="Choose file to upload"
                  />
                  Choose File
                </span>
              </Button>
            </label>
          </>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <>
            <FileText className="h-12 w-12 text-blue-600 animate-pulse" />
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center mt-2 text-muted-foreground">
                {status === 'uploading' ? 'Uploading...' : 'Processing document...'}
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <div className="text-center">
              <h3 className="font-semibold mb-1">Upload Complete</h3>
              <p className="text-sm text-muted-foreground">Document processed and ready for search</p>
            </div>
            <Button onClick={() => setStatus('idle')}>Upload Another</Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-600" />
            <div className="text-center">
              <h3 className="font-semibold mb-1">Upload Failed</h3>
              <p className="text-sm text-muted-foreground">{errorMessage || 'Please try again'}</p>
            </div>
            <Button onClick={() => setStatus('idle')} variant="outline">
              Try Again
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
