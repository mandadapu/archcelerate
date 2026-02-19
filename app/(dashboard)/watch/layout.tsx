'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { LessonSidebar } from '@/components/course/LessonSidebar'

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Extract slug from /watch/[slug]
  const slug = pathname.split('/watch/')[1] || ''

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8 flex h-[calc(100vh-4rem)]">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden"
        aria-label="Open lessons"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-80 border-l bg-background transition-transform lg:static lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <LessonSidebar
          currentSlug={slug}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>
    </div>
  )
}
