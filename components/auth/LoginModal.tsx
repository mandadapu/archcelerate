'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AuthButton } from './AuthButton'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { ArchcelerateLogo } from '@/components/brand/ArchcelerateLogo'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  callbackUrl?: string
}

export function LoginModal({ open, onOpenChange, callbackUrl = '/dashboard?welcome=1' }: LoginModalProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleSignIn = (provider: string) => {
    setLoadingProvider(provider)
    setTimeout(() => {
      onOpenChange(false)
      signIn(provider, { callbackUrl })
    }, 1200)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setLoadingProvider(null)
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-[#0f1117] border-slate-700/60 text-slate-200 shadow-2xl shadow-purple-900/20">
        <DialogHeader className="text-center space-y-4">
          {/* Pulsing Logo */}
          <div className="flex justify-center">
            <div className="animate-pulse-glow">
              <ArchcelerateLogo variant="icon" className="w-16 h-16 rounded-lg" />
            </div>
          </div>

          {/* Terminal Header */}
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-slate-600">
              INITIALIZING IDENTITY HANDSHAKE
            </p>
            <DialogTitle className="font-mono text-lg font-bold tracking-wider">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                SYSTEM ACCESS
              </span>
            </DialogTitle>
            <p className="font-mono text-[11px] text-slate-500 tracking-widest uppercase">
              AUTHORIZATION REQUIRED
            </p>
          </div>

          <div className="mx-auto w-20 h-px bg-gradient-to-r from-purple-600/50 to-cyan-500/50" />
        </DialogHeader>

        {loadingProvider ? (
          /* Loading / Redirect State */
          <div className="py-10 text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
            <p className="font-mono text-xs text-green-400 animate-pulse">
              {'>'} REDIRECTING TO {loadingProvider.toUpperCase()}_OAUTH_GATEWAY...
            </p>
            <p className="font-mono text-[10px] text-slate-600">
              ESTABLISHING SECURE TUNNEL
            </p>
          </div>
        ) : (
          /* Auth Buttons */
          <div className="py-3 space-y-3">
            {/* Primary Tier — GitHub & Google */}
            <div className="grid grid-cols-2 gap-3">
              <AuthButton
                provider="github"
                variant="primary"
                onClick={() => handleSignIn('github')}
                className="w-full"
              />
              <AuthButton
                provider="google"
                variant="primary"
                onClick={() => handleSignIn('google')}
                className="w-full"
              />
            </div>

            {/* Secondary Tier — LinkedIn */}
            <AuthButton
              provider="linkedin"
              variant="secondary"
              onClick={() => handleSignIn('linkedin')}
              className="w-full"
            />

            {/* Utility Tier — Facebook */}
            <div className="flex justify-center">
              <AuthButton
                provider="facebook"
                variant="utility"
                onClick={() => handleSignIn('facebook')}
              />
            </div>
          </div>
        )}

        {/* Terminal Footer */}
        <div className="pt-3 border-t border-slate-700/50 text-center space-y-1.5">
          <p className="font-mono text-[9px] text-slate-600 leading-relaxed">
            By continuing, you accept the{' '}
            <Link href="/terms" className="text-purple-500 hover:text-purple-400">
              USER_AGREEMENT
            </Link>{' '}
            &amp;{' '}
            <Link href="/privacy" className="text-purple-500 hover:text-purple-400">
              PRIVACY_PROTOCOL
            </Link>
          </p>
          <p className="font-mono text-[8px] text-slate-700 tracking-widest uppercase">
            256-BIT ENCRYPTED SESSION &bull; TLS 1.3
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
