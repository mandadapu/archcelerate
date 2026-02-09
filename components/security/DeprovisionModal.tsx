'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArchcelerateLogo } from '@/components/brand/ArchcelerateLogo'

interface DeprovisionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail: string
}

const PURGE_STEPS = [
  'SHUTTING DOWN AGENT_WORKSPACES...',
  'WIPING VECTOR_INDEX_CELLS...',
  'PURGING SKILL_TELEMETRY...',
  'IDENTITY_DELETED. TERMINATING SESSION.',
]

export function DeprovisionModal({
  open,
  onOpenChange,
  userEmail,
}: DeprovisionModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isPurging, setIsPurging] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const expectedText = `PURGE_IDENTITY_${userEmail}`
  const isValid = confirmText === expectedText

  const handlePurge = async () => {
    if (!isValid) return

    setIsPurging(true)
    setError(null)
    setCompletedSteps([])

    // Animate through steps
    for (let i = 0; i < PURGE_STEPS.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setCompletedSteps((prev) => [...prev, PURGE_STEPS[i]])
    }

    // Execute deletion
    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationText: confirmText }),
      })

      if (res.ok) {
        await signOut({ callbackUrl: '/' })
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to delete account')
        setIsPurging(false)
        setCompletedSteps([])
      }
    } catch {
      setError('Network error. Please try again.')
      setIsPurging(false)
      setCompletedSteps([])
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (isPurging) return
    setConfirmText('')
    setError(null)
    setCompletedSteps([])
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-[#0f1117] border-red-700/40 text-slate-200 shadow-2xl shadow-red-900/20">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <ArchcelerateLogo variant="icon" className="w-12 h-12 rounded-lg" />
          </div>

          <div className="space-y-1.5">
            <DialogTitle className="font-mono text-lg font-bold tracking-wider">
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                PERMANENT_IDENTITY_DEPROVISIONING
              </span>
            </DialogTitle>
            <DialogDescription className="font-mono text-[11px] text-slate-500 tracking-widest uppercase">
              IRREVERSIBLE DATA PURGE
            </DialogDescription>
          </div>

          <div className="mx-auto w-20 h-px bg-gradient-to-r from-red-600/50 to-red-400/50" />
        </DialogHeader>

        {isPurging ? (
          <div className="py-6 space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            </div>
            {completedSteps.map((step, i) => (
              <p key={i} className="font-mono text-xs text-red-400">
                {'>'} {step}{' '}
                {i < completedSteps.length - 1 && (
                  <span className="text-green-400">[OK]</span>
                )}
              </p>
            ))}
          </div>
        ) : (
          <div className="space-y-4 pt-2 pb-2">
            {/* Warning */}
            <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-3">
              <p className="font-mono text-[10px] text-red-300/80 leading-relaxed">
                This action will permanently purge your architectural portfolio,
                skill telemetry, and certification progress. This operation is
                non-reversible.
              </p>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-slate-400 tracking-widest uppercase block">
                TYPE TO CONFIRM:
              </label>
              <p className="font-mono text-[10px] text-red-400 break-all">
                {expectedText}
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-red-500/60 transition-colors"
                placeholder="Enter confirmation text..."
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {error && (
              <p className="font-mono text-[10px] text-red-400">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 justify-center">
              <button
                onClick={handlePurge}
                disabled={!isValid}
                className="h-10 px-6 bg-slate-800 border border-red-500/40 rounded-lg font-mono text-[11px] font-medium tracking-widest text-red-400 uppercase transition-all duration-200 hover:border-red-500 hover:text-red-300 hover:shadow-[0_0_16px_rgba(239,68,68,0.15)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                PURGE ACCOUNT &amp; DATA
              </button>
              <button
                onClick={() => handleOpenChange(false)}
                className="h-10 px-6 bg-slate-800 border border-slate-600 rounded-lg font-mono text-[11px] font-medium tracking-widest text-slate-400 uppercase transition-all duration-200 hover:border-slate-500 hover:text-slate-300"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
