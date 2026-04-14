'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface HeaderProps {
  onLoginClick: () => void
}

export function Header({ onLoginClick }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold text-gray-900 tracking-tight">
          Archcelerate
        </Link>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/mandadapu/archcelerate"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            GitHub
          </a>
          {session ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              Dashboard
            </Link>
          ) : (
            <button
              onClick={onLoginClick}
              className="text-sm font-medium px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
