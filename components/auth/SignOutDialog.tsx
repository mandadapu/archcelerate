'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut({ callbackUrl: '/' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Sign out?
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 pt-2">
            You can always sign back in anytime to continue your learning journey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full h-10 px-4 bg-white border-[1.5px] border-black rounded-full text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? 'Signing out...' : 'Yes, sign me out'}
          </button>

          <button
            onClick={() => onOpenChange(false)}
            disabled={isSigningOut}
            className="w-full h-10 px-4 bg-gray-900 text-white rounded-full text-sm font-medium shadow-sm transition-all duration-200 hover:bg-gray-800 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
