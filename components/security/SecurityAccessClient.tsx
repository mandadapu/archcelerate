'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DeprovisionModal } from './DeprovisionModal'

interface AccessEvent {
  id: string
  eventType: string
  eventData: Record<string, string>
  occurredAt: string
}

interface SecurityAccessClientProps {
  events: AccessEvent[]
  activeSessions: number
  userEmail: string
}

export function SecurityAccessClient({
  events,
  activeSessions,
  userEmail,
}: SecurityAccessClientProps) {
  const router = useRouter()
  const [isTerminating, setIsTerminating] = useState(false)
  const [showDeprovision, setShowDeprovision] = useState(false)
  const [sessionCount, setSessionCount] = useState(activeSessions)

  const handleTerminateSessions = async () => {
    setIsTerminating(true)
    try {
      const res = await fetch('/api/security/terminate-sessions', {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok) {
        setSessionCount(1)
        toast(
          <div className="font-mono text-xs leading-relaxed space-y-0.5">
            <div>
              <span className="text-slate-500">[SYSTEM]:</span>{' '}
              <span className="text-green-400">
                {data.terminatedSessions} SESSION
                {data.terminatedSessions !== 1 ? 'S' : ''} TERMINATED
              </span>
            </div>
            <div>
              <span className="text-slate-500">[STATUS]:</span>{' '}
              <span className="text-green-400">CURRENT SESSION PRESERVED</span>
            </div>
          </div>,
          {
            duration: 4000,
            className:
              '!bg-slate-900 !border-slate-700 !shadow-lg !shadow-purple-500/10',
          }
        )
        router.refresh()
      } else {
        toast.error('Failed to terminate sessions')
      }
    } catch {
      toast.error('Failed to terminate sessions')
    } finally {
      setIsTerminating(false)
    }
  }

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso)
    return d
      .toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(',', '')
  }

  const formatProvider = (eventData: Record<string, string>, eventType: string) => {
    if (eventType === 'session.logout') {
      const p = eventData?.provider
      if (p === 'BULK_TERMINATE') return 'BULK_TERMINATE'
      return 'SESSION_LOGOUT'
    }
    const p = eventData?.provider || 'unknown'
    if (p === 'unknown') return 'UNKNOWN'
    return `${p.toUpperCase()}_OAUTH`
  }

  return (
    <div className="space-y-8">
      {/* Section 1: Access Logs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="font-mono text-lg sm:text-xl font-bold tracking-wider">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                SECURITY_AUDIT: ACCESS_LOGS
              </span>
            </h1>
            <p className="font-mono text-[10px] text-slate-500 tracking-widest uppercase mt-1">
              IDENTITY VERIFICATION HISTORY
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase hidden sm:inline">
              {sessionCount} ACTIVE SESSION{sessionCount !== 1 ? 'S' : ''}
            </span>
            <button
              onClick={handleTerminateSessions}
              disabled={isTerminating || sessionCount <= 1}
              className="h-9 px-3 sm:px-4 bg-slate-900 border border-red-500/40 rounded-lg font-mono text-[10px] font-medium tracking-widest text-red-400 uppercase transition-all duration-200 hover:border-red-500 hover:text-red-300 hover:shadow-[0_0_16px_rgba(239,68,68,0.15)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isTerminating ? 'TERMINATING...' : 'TERMINATE OTHER SESSIONS'}
            </button>
          </div>
        </div>

        {/* Access Log Table */}
        <div className="bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 px-4 md:px-5 py-3 border-b border-slate-700/60">
            <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase">
              TIMESTAMP
            </span>
            <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase">
              PROVIDER
            </span>
            <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase hidden md:block">
              IP ADDRESS
            </span>
            <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase">
              STATUS
            </span>
          </div>

          {/* Table Rows */}
          {events.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-mono text-[11px] text-slate-600 tracking-widest uppercase">
                NO ACCESS EVENTS RECORDED
              </p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 px-4 md:px-5 py-3 border-b border-slate-800/60 last:border-b-0 hover:bg-slate-800/30 transition-colors"
              >
                <span className="font-mono text-[10px] md:text-[11px] text-slate-400">
                  {formatTimestamp(event.occurredAt)}
                </span>
                <span className="font-mono text-[10px] md:text-[11px] text-cyan-400 truncate">
                  {formatProvider(event.eventData, event.eventType)}
                </span>
                <span className="font-mono text-[11px] text-slate-400 hidden md:block">
                  {event.eventData?.ipAddress || 'unknown'}
                </span>
                <span
                  className={`font-mono text-[11px] font-medium ${
                    event.eventData?.status === 'SUCCESS'
                      ? 'text-green-400'
                      : 'text-amber-400'
                  }`}
                >
                  {event.eventData?.status || 'UNKNOWN'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

      {/* Section 2: Critical Operations */}
      <div>
        <h2 className="font-mono text-lg font-bold tracking-wider mb-1">
          <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            CRITICAL_OPERATIONS
          </span>
        </h2>
        <p className="font-mono text-[10px] text-slate-500 tracking-widest uppercase mb-4">
          PERMANENT_IDENTITY_DEPROVISIONING
        </p>

        <div className="bg-red-50 border border-red-300 rounded-lg p-5 space-y-4">
          <p className="font-mono text-[11px] text-red-700 leading-relaxed">
            WARNING: This action will permanently purge your architectural
            portfolio, skill telemetry, and certification progress. This
            operation is non-reversible.
          </p>

          <button
            onClick={() => setShowDeprovision(true)}
            className="h-10 px-6 bg-slate-900 border border-red-500/40 rounded-lg font-mono text-[11px] font-medium tracking-widest text-red-400 uppercase transition-all duration-200 hover:border-red-500 hover:text-red-300 hover:shadow-[0_0_16px_rgba(239,68,68,0.15)]"
          >
            PURGE ACCOUNT &amp; DATA
          </button>
        </div>
      </div>

      <DeprovisionModal
        open={showDeprovision}
        onOpenChange={setShowDeprovision}
        userEmail={userEmail}
      />
    </div>
  )
}
