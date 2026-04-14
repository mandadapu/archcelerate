'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LoginModal } from '@/components/auth/LoginModal'
import { Header } from './Header'

const LOGIN_CALLBACK = '/curriculum/week-1/concepts/llm-fundamentals'

type LandingAuthValue = { openLogin: () => void }

const LandingAuthContext = createContext<LandingAuthValue | null>(null)

export function useLandingAuth(): LandingAuthValue {
  const ctx = useContext(LandingAuthContext)
  if (!ctx) {
    throw new Error('useLandingAuth must be used within <LandingClient>')
  }
  return ctx
}

export function LandingClient({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('login') === '1') {
      setShowLoginModal(true)
      window.history.replaceState({}, '', '/')
    }

    const error = searchParams.get('error')
    if (!error) return

    if (session) {
      window.history.replaceState({}, '', '/')
      return
    }

    const errorMessages: Record<string, string> = {
      OAuthAccountNotLinked:
        'This email is already registered. Please sign in with your original provider.',
      OAuthSignin: 'Error signing in with OAuth provider.',
      OAuthCallback: 'Error in OAuth callback.',
      Configuration: 'Server configuration error.',
      AccessDenied: 'Access denied.',
      Verification: 'Verification error.',
      Default: 'An error occurred during sign in.',
    }
    setErrorMessage(errorMessages[error] ?? errorMessages.Default)

    const timer = setTimeout(() => {
      setErrorMessage(null)
      window.history.replaceState({}, '', '/')
    }, 5000)
    return () => clearTimeout(timer)
  }, [searchParams, session])

  const openLogin = useCallback(() => setShowLoginModal(true), [])
  const contextValue = useMemo(() => ({ openLogin }), [openLogin])

  return (
    <LandingAuthContext.Provider value={contextValue}>
      <Header onLoginClick={openLogin} />

      {errorMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-3">
            <p className="text-sm text-red-800 flex-1">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 text-base leading-none p-1 -m-1 rounded"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {children}

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        callbackUrl={LOGIN_CALLBACK}
      />
    </LandingAuthContext.Provider>
  )
}
