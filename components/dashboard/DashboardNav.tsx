'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SignOutDialog } from '@/components/auth/SignOutDialog'
import { ArchcelerateLogo } from '@/components/brand/ArchcelerateLogo'

interface DashboardNavProps {
  userEmail?: string | null
}

export function DashboardNav({ userEmail }: DashboardNavProps) {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)

  return (
    <>
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center">
                <ArchcelerateLogo variant="compact" className="h-10 w-auto" />
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
                  Dashboard
                </Link>
                <Link href="/skill-diagnosis" className="text-sm text-slate-600 hover:text-slate-900">
                  Skill Diagnosis
                </Link>
                <Link href="/mentor/new" className="text-sm text-slate-600 hover:text-slate-900">
                  AI Mentor
                </Link>
                <Link href="/portfolio" className="text-sm text-slate-600 hover:text-slate-900">
                  Portfolio
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">{userEmail}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSignOutDialog(true)}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <SignOutDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
      />
    </>
  )
}
