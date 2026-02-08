'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ArchitectureTourCardProps {
  status: 'not-started' | 'in-progress'
  tourStartedAt?: string | null
}

export function ArchitectureTourCard({ status, tourStartedAt }: ArchitectureTourCardProps) {
  if (status === 'not-started') {
    return (
      <div className="group relative bg-white border border-gray-200 rounded-lg p-6 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:border-transparent">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-purple-500">
              Start Here
            </p>
            <h2 className="text-xl font-bold text-slate-900">
              Architecture Tour
            </h2>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          The executive summary of production AI: see how RAG, Agents, Fine-tuning, and Infrastructure mesh into the 4-layer Sovereign Stack.
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-slate-400 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            10 min
          </span>
          <Link href="/architecture-tour">
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
              Begin Tour
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // in-progress state
  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg p-6 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:border-transparent">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-purple-500">
            In Progress
          </p>
          <h2 className="text-xl font-bold text-slate-900">
            Architecture Tour
          </h2>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-4">
        You started this tour{tourStartedAt ? ` ${formatRelativeTime(tourStartedAt)}` : ' recently'}. Continue to complete your understanding of the Sovereign Stack.
      </p>
      <div className="flex justify-end mt-auto">
        <Link href="/architecture-tour">
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white">
            Continue Tour
          </Button>
        </Link>
      </div>
    </div>
  )
}

function formatRelativeTime(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}
