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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Logout Confirmation
          </DialogTitle>
          <DialogDescription className="text-base text-gray-500">
            Are you sure you want to do logout?
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-6 justify-center">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? 'Signing out...' : 'Confirm'}
          </button>

          <button
            onClick={() => onOpenChange(false)}
            disabled={isSigningOut}
            className="px-8 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
