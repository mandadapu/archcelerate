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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              Log In
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-3">
          {/* Agreement text */}
          <p className="text-xs text-gray-500 text-center mb-4">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-purple-600 hover:text-purple-700 hover:underline">
              User Agreement
            </Link>{' '}
            and acknowledge that you understand the{' '}
            <Link href="/privacy" className="text-purple-600 hover:text-purple-700 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Auth buttons */}
          <div className="space-y-2.5">
            <AuthButton
              provider="google"
              onClick={() => {
                onOpenChange(false)
                signIn('google', { callbackUrl })
              }}
              className="w-full"
            />
            <AuthButton
              provider="facebook"
              onClick={() => {
                onOpenChange(false)
                signIn('facebook', { callbackUrl })
              }}
              className="w-full"
            />
            <AuthButton
              provider="linkedin"
              onClick={() => alert('LinkedIn login coming soon! Please use Google for now.')}
              disabled
              className="w-full"
            />
            <AuthButton
              provider="github"
              onClick={() => alert('GitHub login coming soon! Please use Google for now.')}
              disabled
              className="w-full"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
