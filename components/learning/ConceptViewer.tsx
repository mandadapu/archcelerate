'use client'

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { AskMentorButton } from './AskMentorButton'
import { mdxComponents } from '@/src/lib/mdx/components'

interface ConceptViewerProps {
  mdxSource: MDXRemoteSerializeResult
  sprintId: string
  conceptId: string
  conceptTitle: string
  nextConceptId?: string
  previousConceptId?: string
  isCompleted: boolean
}

export default function ConceptViewer({
  mdxSource,
  sprintId,
  conceptId,
  conceptTitle,
  nextConceptId,
  previousConceptId,
  isCompleted: initialCompleted,
}: ConceptViewerProps) {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [marking, setMarking] = useState(false)

  const handleMarkComplete = async () => {
    setMarking(true)
    try {
      const response = await fetch('/api/learning/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sprintId, conceptId }),
      })

      if (response.ok) {
        setIsCompleted(true)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to mark complete:', error)
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* MDX Content */}
      <div className="prose prose-slate max-w-none">
        <MDXRemote {...mdxSource} components={mdxComponents} />
      </div>

      {/* Ask Mentor Button */}
      <div className="pt-4">
        <AskMentorButton
          sprintId={sprintId}
          conceptId={conceptId}
          conceptTitle={conceptTitle}
        />
      </div>

      {/* Navigation Footer */}
      <div className="border-t pt-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            {previousConceptId && (
              <Button
                variant="outline"
                onClick={() => router.push(`/learn/${sprintId}/${previousConceptId}`)}
              >
                ← Previous Concept
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {!isCompleted && (
              <Button
                onClick={handleMarkComplete}
                disabled={marking}
                className="bg-green-600 hover:bg-green-700"
              >
                {marking ? 'Marking...' : 'Mark as Complete'}
              </Button>
            )}

            {nextConceptId && (
              <Button onClick={() => router.push(`/learn/${sprintId}/${nextConceptId}`)}>
                Next Concept →
              </Button>
            )}

            {!nextConceptId && isCompleted && (
              <Button onClick={() => router.push(`/learn/${sprintId}`)}>
                Back to Sprint
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
