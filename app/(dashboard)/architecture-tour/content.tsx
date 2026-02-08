'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { mdxComponents } from '@/src/lib/mdx/components'
import { Button } from '@/components/ui/button'

interface ArchitectureTourContentProps {
  mdxSource: MDXRemoteSerializeResult
  tourCompleted: boolean
  tourStartedAt: string | null
}

export function ArchitectureTourContent({
  mdxSource,
  tourCompleted,
  tourStartedAt,
}: ArchitectureTourContentProps) {
  const router = useRouter()
  const [isCompleting, setIsCompleting] = useState(false)
  const [startTime] = useState(Date.now())

  // Track tour start on mount
  useEffect(() => {
    if (!tourCompleted && !tourStartedAt) {
      fetch('/api/tour/start', { method: 'POST' }).catch(() => {})
    }
  }, [tourCompleted, tourStartedAt])

  const handleComplete = async () => {
    if (tourCompleted || isCompleting) return
    setIsCompleting(true)

    try {
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000)
      const res = await fetch('/api/tour/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSpentSeconds }),
      })

      if (!res.ok) throw new Error('Failed to complete tour')

      router.push('/dashboard')
      router.refresh()
    } catch {
      setIsCompleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="prose prose-slate max-w-none">
        <MDXRemote {...mdxSource} components={mdxComponents} />
      </div>

      {!tourCompleted ? (
        <div className="border-t pt-8 pb-4">
          <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-2xl p-8 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Ready to Build Your Sovereign Stack?
            </h3>
            <p className="text-slate-600 mb-4">
              Complete the tour to unlock your personalized skill diagnosis and production roadmap.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold"
              >
                {isCompleting ? 'Completing...' : 'Mark as Complete & Continue'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t pt-8 pb-4">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Tour Completed</span>
            </div>
            <p className="text-slate-600 text-sm">
              Return to the dashboard to continue your journey with the skill diagnosis.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
