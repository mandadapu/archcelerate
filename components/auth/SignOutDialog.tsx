'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

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
          <DialogTitle className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              Log Out
            </span>
          </DialogTitle>
          <DialogDescription className="text-base text-gray-500">
            Are you sure you want to log out?
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-6 justify-center">
          <Button
            onClick={handleSignOut}
            disabled={isSigningOut}
            size="lg"
            className="min-w-[100px] bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white"
          >
            {isSigningOut ? 'Logging out...' : 'Confirm'}
          </Button>

          <Button
            onClick={() => onOpenChange(false)}
            disabled={isSigningOut}
            variant="outline"
            size="lg"
            className="min-w-[100px] border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
