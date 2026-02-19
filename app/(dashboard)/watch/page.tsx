import { redirect } from 'next/navigation'
import { getAllLessons } from '@/lib/course/data'

export default function WatchIndexPage() {
  const lessons = getAllLessons()
  if (lessons.length > 0) {
    redirect(`/watch/${lessons[0].slug}`)
  }
  return null
}
