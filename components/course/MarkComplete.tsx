'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

const STORAGE_KEY = 'archcelerate-course-progress'

export function getProgress(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function setProgress(progress: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  window.dispatchEvent(new CustomEvent('course-progress-updated'))
}

interface MarkCompleteProps {
  slug: string
}

export function MarkComplete({ slug }: MarkCompleteProps) {
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    setCompleted(!!getProgress()[slug])
  }, [slug])

  function toggle() {
    const progress = getProgress()
    const next = !progress[slug]
    progress[slug] = next
    setProgress(progress)
    setCompleted(next)
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        completed
          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      }`}
    >
      {completed ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Completed
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" />
          Mark as Complete
        </>
      )}
    </button>
  )
}
