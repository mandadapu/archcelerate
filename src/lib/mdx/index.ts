import { allLessons, allModules } from 'contentlayer/generated'

export function getAllModules() {
  return allModules.sort((a, b) => a.order - b.order)
}

export function getModuleBySlug(slug: string) {
  return allModules.find((module) => module.slug === slug)
}

export function getLessonsByModule(moduleSlug: string) {
  return allLessons
    .filter((lesson) => lesson.module === moduleSlug)
    .sort((a, b) => a.order - b.order)
}

export function getLessonBySlug(slug: string) {
  return allLessons.find((lesson) => lesson.slug === slug)
}

export function getNextLesson(currentSlug: string) {
  const currentLesson = getLessonBySlug(currentSlug)
  if (!currentLesson) return null

  const moduleLessons = getLessonsByModule(currentLesson.module)
  const currentIndex = moduleLessons.findIndex(
    (lesson) => lesson.slug === currentSlug
  )

  if (currentIndex === -1 || currentIndex === moduleLessons.length - 1) {
    return null
  }

  return moduleLessons[currentIndex + 1]
}

export function getPreviousLesson(currentSlug: string) {
  const currentLesson = getLessonBySlug(currentSlug)
  if (!currentLesson) return null

  const moduleLessons = getLessonsByModule(currentLesson.module)
  const currentIndex = moduleLessons.findIndex(
    (lesson) => lesson.slug === currentSlug
  )

  if (currentIndex === -1 || currentIndex === 0) {
    return null
  }

  return moduleLessons[currentIndex - 1]
}
