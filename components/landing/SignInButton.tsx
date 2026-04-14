'use client'

import type { ReactNode } from 'react'
import { useLandingAuth } from './LandingClient'

interface SignInButtonProps {
  className?: string
  children: ReactNode
}

export function SignInButton({ className, children }: SignInButtonProps) {
  const { openLogin } = useLandingAuth()
  return (
    <button type="button" onClick={openLogin} className={className}>
      {children}
    </button>
  )
}
