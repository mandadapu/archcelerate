'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AuthButton } from './AuthButton'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
            Log In
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Agreement text */}
          <p className="text-xs text-gray-600 text-center mb-6">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              User Agreement
            </Link>{' '}
            and acknowledge that you understand the{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Auth buttons */}
          <div className="space-y-3">
            <AuthButton
              provider="google"
              onClick={() => {
                onOpenChange(false)
                signIn('google', { callbackUrl: '/dashboard' })
              }}
              className="w-full"
            />
            <AuthButton
              provider="facebook"
              onClick={() => alert('Facebook login coming soon! Please use Google for now.')}
              disabled
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
