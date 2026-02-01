'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Trash2, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Document {
  id: string
  filename: string
  filesize: number
  chunk_count: number
  created_at: string
  status: 'processing' | 'completed' | 'failed'
}

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    setLoading(true)
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteDocument(id: string) {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocuments(documents.filter((doc) => doc.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading documents...</div>
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No documents uploaded yet. Upload your first document to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Your Documents ({documents.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchDocuments}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-medium">{doc.filename}</div>
                  <div className="text-sm text-muted-foreground">
                    {(doc.filesize / 1024).toFixed(1)} KB • {doc.chunk_count} chunks •{' '}
                    {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {doc.status === 'processing' && (
                  <span className="text-sm text-yellow-600">Processing...</span>
                )}
                {doc.status === 'failed' && <span className="text-sm text-red-600">Failed</span>}
                <Button variant="ghost" size="sm" onClick={() => deleteDocument(doc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
