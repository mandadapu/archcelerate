'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, X } from 'lucide-react'
import { COURSE_MODULES } from '@/lib/course/data'
import { getProgress } from './MarkComplete'

interface LessonSidebarProps {
  currentSlug: string
  onClose?: () => void
}

export function LessonSidebar({ currentSlug, onClose }: LessonSidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [progress, setProgressState] = useState<Record<string, boolean>>({})

  const refreshProgress = useCallback(() => {
    setProgressState(getProgress())
  }, [])

  useEffect(() => {
    refreshProgress()
    window.addEventListener('course-progress-updated', refreshProgress)
    return () =>
      window.removeEventListener('course-progress-updated', refreshProgress)
  }, [refreshProgress])

  function toggleModule(title: string) {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Lessons</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {COURSE_MODULES.map((mod) => {
          const isCollapsed = collapsed[mod.title]
          const moduleCompleted = mod.lessons.every(
            (l) => progress[l.slug]
          )

          return (
            <div key={mod.title}>
              <button
                onClick={() => toggleModule(mod.title)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-muted/50"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                {moduleCompleted ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                ) : null}
                <span>{mod.title}</span>
              </button>

              {!isCollapsed && (
                <ul className="pb-1">
                  {mod.lessons.map((lesson) => {
                    const isCurrent = lesson.slug === currentSlug
                    const isComplete = progress[lesson.slug]

                    return (
                      <li key={lesson.slug}>
                        <Link
                          href={`/watch/${lesson.slug}`}
                          className={`flex items-center gap-3 px-4 py-2 pl-8 text-sm transition-colors ${
                            isCurrent
                              ? 'bg-muted font-medium'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
