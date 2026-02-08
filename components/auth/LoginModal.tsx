'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AuthButton } from './AuthButton'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  callbackUrl?: string
}

export function LoginModal({ open, onOpenChange, callbackUrl = '/dashboard' }: LoginModalProps) {
  const handleSignIn = (provider: string) => {
    onOpenChange(false)
    signIn(provider, { callbackUrl })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-slate-200">
        <DialogHeader className="text-center space-y-2">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-500">
            Federated Identity Access
          </p>
          <DialogTitle className="text-2xl font-bold font-display">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Sovereign Access
            </span>
          </DialogTitle>
          <div className="mx-auto w-16 h-px bg-gradient-to-r from-purple-600 to-cyan-500" />
        </DialogHeader>

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

        {/* Footer */}
        <div className="pt-3 border-t border-slate-700/50 text-center">
          <p className="text-[10px] text-slate-500 leading-relaxed">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-purple-400 hover:text-purple-300 hover:underline">
              User Agreement
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-purple-400 hover:text-purple-300 hover:underline">
              Privacy Policy
            </Link>
          </p>
          <p className="mt-1.5 text-[9px] text-slate-600 tracking-wide uppercase">
            256-bit encrypted session
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
