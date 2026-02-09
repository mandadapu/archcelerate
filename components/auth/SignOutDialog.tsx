'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArchcelerateLogo } from '@/components/brand/ArchcelerateLogo'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      // Log logout event
      await fetch('/api/access-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'session.logout' }),
      }).catch(() => {})

      // Compute session duration from sessionStorage timestamp
      const startTime = sessionStorage.getItem('session_start_time')
      const sessionMinutes = startTime
        ? Math.floor((Date.now() - parseInt(startTime)) / 60000)
        : 0

      // Fetch progress snapshot before session is destroyed
      const res = await fetch('/api/session-summary')
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem(
          'session_summary',
          JSON.stringify({ ...data, sessionMinutes })
        )
      }

      sessionStorage.removeItem('session_start_time')
    } catch {
      // Proceed with sign-out even if summary fetch fails
    }

    await signOut({ callbackUrl: '/session-terminated' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-gradient-to-br from-slate-900 to-[#0f1117] border-slate-700/60 text-slate-200 shadow-2xl shadow-purple-900/20">
        <DialogHeader className="text-center space-y-4">
          {/* Logo */}
          <div className="flex justify-center">
            <ArchcelerateLogo variant="icon" className="w-12 h-12 rounded-lg" />
          </div>

          {/* Terminal Header */}
          <div className="space-y-1.5">
            <DialogTitle className="font-mono text-lg font-bold tracking-wider">
              <span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                SESSION TERMINATION
              </span>
            </DialogTitle>
            <DialogDescription className="font-mono text-[11px] text-slate-500 tracking-widest uppercase">
              CONFIRM IDENTITY DISCONNECT
            </DialogDescription>
          </div>

          <div className="mx-auto w-20 h-px bg-gradient-to-r from-purple-600/50 to-cyan-500/50" />
        </DialogHeader>

        {isSigningOut ? (
          /* Signing Out State */
          <div className="py-8 text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
            <p className="font-mono text-xs text-amber-400 animate-pulse">
              {'>'} TERMINATING SESSION...
            </p>
            <p className="font-mono text-[10px] text-slate-600">
              REVOKING ACCESS TOKENS
            </p>
          </div>
        ) : (
          /* Confirm / Cancel */
          <div className="flex gap-3 pt-4 pb-2 justify-center">
            <button
              onClick={handleSignOut}
              className="h-10 px-6 bg-slate-800 border border-red-500/40 rounded-lg font-mono text-[11px] font-medium tracking-widest text-red-400 uppercase transition-all duration-200 hover:border-red-500 hover:text-red-300 hover:shadow-[0_0_16px_rgba(239,68,68,0.15)]"
            >
              TERMINATE
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="h-10 px-6 bg-slate-800 border border-slate-600 rounded-lg font-mono text-[11px] font-medium tracking-widest text-slate-400 uppercase transition-all duration-200 hover:border-slate-500 hover:text-slate-300"
            >
              CANCEL
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
