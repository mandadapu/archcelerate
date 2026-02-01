'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Send, FileText, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Source {
  chunkId: string
  documentId: string
  content: string
  relevanceScore: number
}

interface QueryResponse {
  answer: string
  sources: Source[]
  hasMemoryContext: boolean
  metadata: {
    sourcesUsed: number
    avgRelevance: number
    latencyMs: number
    cost: number
  }
}

export function QAInterface() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<QueryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || query.trim().length < 3) {
      setError('Please enter a question (minimum 3 characters)')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/rag/query-with-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: query }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Query failed')
      }

      const data = await res.json()
      setResponse(data)
      setExpandedSources(new Set()) // Reset expanded sources
    } catch (error) {
      console.error('Query error:', error)
      setError(error instanceof Error ? error.message : 'Failed to process query')
    } finally {
      setLoading(false)
    }
  }

  function toggleSource(index: number) {
    const newExpanded = new Set(expandedSources)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSources(newExpanded)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Ask a question about your documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          className="resize-none"
          disabled={loading}
          aria-label="Question input"
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? (
            'Searching...'
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Ask Question
            </>
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{response.answer}</ReactMarkdown>
            </div>

            {response.sources && response.sources.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Sources ({response.sources.length})
                </h4>
                <div className="space-y-2">
                  {response.sources.map((source, i) => (
                    <div key={i} className="text-sm border-l-2 border-blue-500 pl-3">
                      <button
                        onClick={() => toggleSource(i)}
                        className="flex items-center justify-between w-full text-left hover:bg-muted/50 p-2 rounded"
                      >
                        <div>
                          <div className="font-medium">Source {i + 1}</div>
                          <div className="text-muted-foreground text-xs">
                            Relevance: {(source.relevanceScore * 100).toFixed(0)}%
                          </div>
                        </div>
                        {expandedSources.has(i) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {expandedSources.has(i) && (
                        <div className="text-xs mt-2 p-2 bg-muted/30 rounded">{source.content}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {response.metadata && (
              <div className="text-xs text-muted-foreground border-t pt-2 flex items-center gap-4">
                <span>{response.metadata.sourcesUsed} sources</span>
                <span>{response.metadata.latencyMs}ms</span>
                <span>${response.metadata.cost.toFixed(4)}</span>
                {response.hasMemoryContext && (
                  <span className="text-blue-600 dark:text-blue-400">• Using memory context</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
