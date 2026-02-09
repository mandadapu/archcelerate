'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SignOutDialog } from '@/components/auth/SignOutDialog'
import { ArchcelerateLogo } from '@/components/brand/ArchcelerateLogo'
import { Power, Menu, X } from 'lucide-react'

interface DashboardNavProps {
  userName?: string | null
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/mentor/new', label: 'AI Mentor' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/skill-diagnosis', label: 'My Progress' },
  { href: '/security-access', label: 'Security' },
]

export function DashboardNav({ userName }: DashboardNavProps) {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo + Desktop Links */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center shrink-0">
                <ArchcelerateLogo variant="compact" className="h-10 w-auto" />
              </Link>
              <div className="hidden md:flex items-center space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop: Username + Terminate */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-slate-600">{userName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSignOutDialog(true)}
                className="font-mono text-[11px] font-semibold tracking-[1px] uppercase text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1.5"
              >
                <Power className="w-3.5 h-3.5" />
                TERMINATE SESSION
              </Button>
            </div>

            {/* Mobile: Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">{userName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setShowSignOutDialog(true)
                }}
                className="font-mono text-[11px] font-semibold tracking-[1px] uppercase text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1.5"
              >
                <Power className="w-3.5 h-3.5" />
                TERMINATE SESSION
              </Button>
            </div>
          </div>
        )}
      </nav>

      <SignOutDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
      />
    </>
  )
}
