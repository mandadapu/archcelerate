'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

interface SystemHandshakeProps {
  provider?: string
  userName?: string
}

export function SystemHandshake({ provider, userName }: SystemHandshakeProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track session start time for "Time in Terminal" on logout
    if (!sessionStorage.getItem('session_start_time')) {
      sessionStorage.setItem('session_start_time', Date.now().toString())
    }

    if (searchParams.get('welcome') !== '1') return

    const urlProvider = searchParams.get('provider')
    const activeProvider = urlProvider || provider

    // Log access event
    fetch('/api/access-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: activeProvider || 'unknown' }),
    }).catch(() => {})

    const providerLabel = activeProvider
      ? `${activeProvider.toUpperCase()}_OAUTH`
      : 'SSO'

    const displayName = userName?.split(' ')[0]?.toUpperCase() || 'ARCHITECT'

    toast(
      <div className="font-mono text-xs leading-relaxed space-y-0.5">
        <div>
          <span className="text-slate-500">[SYSTEM]:</span>{' '}
          <span className="text-green-400">IDENTITY_VERIFIED</span>{' '}
          <span className="text-slate-500">via</span>{' '}
          <span className="text-cyan-400">{providerLabel}</span>
        </div>
        <div>
          <span className="text-slate-500">[STATUS]:</span>{' '}
          <span className="text-green-400">SESSION INITIALIZED</span>
        </div>
        <div>
          <span className="text-slate-500">[ACTION]:</span>{' '}
          <span className="text-white">WELCOME BACK, {displayName}.</span>
        </div>
      </div>,
      {
        duration: 5000,
        className: '!bg-slate-900 !border-slate-700 !shadow-lg !shadow-purple-500/10',
      }
    )

    // Clean the ?welcome=1 from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('welcome')
    url.searchParams.delete('provider')
    window.history.replaceState({}, '', url.pathname + url.search)
  }, [searchParams, provider, userName])

  return null
}
