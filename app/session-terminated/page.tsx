'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArchcelerateLogo } from '@/components/brand/ArchcelerateLogo'

interface SessionSummary {
  identity: string
  totalTimeHours: number
  highestWeek: { number: number; title: string } | null
  labsCompleted: number
  topSkills: { name: string; score: number }[]
  sessionMinutes: number
}

export default function SessionTerminatedPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [countdown, setCountdown] = useState(15)
  const [loaded, setLoaded] = useState(false)

  // Read and clear localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('session_summary')
      if (raw) {
        setSummary(JSON.parse(raw))
        localStorage.removeItem('session_summary')
      }
    } catch {
      // localStorage unavailable or corrupted
    }
    setLoaded(true)
  }, [])

  // Auto-redirect countdown
  useEffect(() => {
    if (!loaded) return
    if (!summary) {
      router.push('/')
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [loaded, summary, router])

  // Don't render until localStorage has been checked
  if (!loaded || !summary) return null

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '< 1M'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0) return `${h}H ${m}M`
    return `${m}M`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <ArchcelerateLogo variant="icon" className="w-14 h-14 rounded-lg" />
        </div>

        {/* Terminal Header */}
        <div className="space-y-2">
          <h1 className="font-mono text-xl font-bold tracking-wider">
            <span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
              SESSION_TERMINATED
            </span>
          </h1>
          <p className="font-mono text-[11px] text-slate-500 tracking-widest uppercase">
            AUDIT LOG SECURED
          </p>
        </div>

        <div className="mx-auto w-20 h-px bg-gradient-to-r from-purple-600/50 to-cyan-500/50" />

        {/* Progress Snapshot */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-5 space-y-3 text-left">
          <Row label="IDENTITY" value={summary.identity} />
          <Row
            label="TIME IN TERMINAL"
            value={formatDuration(summary.sessionMinutes)}
          />
          <Row
            label="LABS ADVANCED"
            value={
              summary.labsCompleted > 0
                ? `${summary.labsCompleted} LAB${summary.labsCompleted !== 1 ? 'S' : ''} COMPLETED`
                : 'NO LABS YET'
            }
          />
          {summary.highestWeek && (
            <Row
              label="CURRENT WEEK"
              value={`WEEK ${summary.highestWeek.number} — ${summary.highestWeek.title.toUpperCase()}`}
            />
          )}
          {summary.topSkills.length > 0 && (
            <Row
              label="TOP SKILLS"
              value={summary.topSkills
                .map((s) => `${s.name}: ${s.score}%`)
                .join(' | ')}
            />
          )}
        </div>

        <div className="mx-auto w-20 h-px bg-gradient-to-r from-purple-600/50 to-cyan-500/50" />

        {/* Status line */}
        <p className="font-mono text-[10px] text-green-500/70 tracking-widest uppercase">
          STATUS: ALL TOKENS REVOKED — SESSION [SECURE]
        </p>

        {/* Re-Authorize Button */}
        <button
          onClick={() => router.push('/')}
          className="h-11 px-8 bg-slate-800 border border-green-500/40 rounded-lg font-mono text-[11px] font-medium tracking-widest text-green-400 uppercase transition-all duration-200 hover:border-green-500 hover:text-green-300 hover:shadow-[0_0_16px_rgba(34,197,94,0.15)]"
        >
          RE-AUTHORIZE SESSION
        </button>

        {/* Countdown */}
        <p className="font-mono text-[10px] text-slate-600 tracking-widest">
          REDIRECTING IN {countdown}S...
        </p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="font-mono text-[10px] text-slate-500 tracking-widest shrink-0">
        {label}
      </span>
      <span className="font-mono text-[11px] text-slate-300 text-right">
        {value}
      </span>
    </div>
  )
}
