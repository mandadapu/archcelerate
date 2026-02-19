import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  getLessonBySlug,
  getLessonPosition,
  getAdjacentLessons,
} from '@/lib/course/data'
import { VideoPlayer } from '@/components/course/VideoPlayer'
import { MarkComplete } from '@/components/course/MarkComplete'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const lesson = getLessonBySlug(slug)

  if (!lesson) {
    notFound()
  }

  const { index, total } = getLessonPosition(slug)
  const { prev, next } = getAdjacentLessons(slug)

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
      {/* Header: lesson counter + navigation */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Lesson {index + 1} of {total}
        </p>
        <div className="flex items-center gap-2">
          {prev ? (
            <Link
              href={`/watch/${prev}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
              aria-label="Previous lesson"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}
          {next ? (
            <Link
              href={`/watch/${next}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
              aria-label="Next lesson"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border opacity-30">
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold">{lesson.title}</h1>

      {/* Video player */}
      <VideoPlayer videoUrl={lesson.videoUrl} title={lesson.title} />

      {/* Description + mark complete */}
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          {lesson.description}
        </p>
        <MarkComplete slug={slug} />
      </div>
    </div>
  )
}
