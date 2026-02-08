'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AuthButton } from './AuthButton'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { ArchcelerateLogo } from '@/components/brand/ArchcelerateLogo'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  callbackUrl?: string
}

export function LoginModal({ open, onOpenChange, callbackUrl = '/dashboard?welcome=1' }: LoginModalProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const popupRef = useRef<Window | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanupPopup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close()
    }
    popupRef.current = null
    setLoadingProvider(null)
  }, [])

  // Listen for auth success from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'auth-success') {
        cleanupPopup()
        window.location.href = callbackUrl
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [callbackUrl, cleanupPopup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const handleSignIn = (provider: string) => {
    setLoadingProvider(provider)

    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      '',
      'oauth_popup',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    if (!popup) {
      // Popup blocked — fall back to full-page redirect
      onOpenChange(false)
      signIn(provider, { callbackUrl })
      return
    }

    popupRef.current = popup

    // Dark loading page in popup while OAuth provider loads
    popup.document.write(
      `<!DOCTYPE html><html><head><title>Archcelerate</title></head>` +
      `<body style="background:#1e293b;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:ui-monospace,monospace;color:#64748b;font-size:12px;letter-spacing:0.1em;">` +
      `<p>CONNECTING TO ${provider.toUpperCase()}_OAUTH_GATEWAY...</p>` +
      `</body></html>`
    )
    popup.document.close()

    // Fetch CSRF token and submit OAuth form inside popup
    fetch('/api/auth/csrf')
      .then(res => res.json())
      .then(({ csrfToken }) => {
        if (!popup || popup.closed) return

        const form = popup.document.createElement('form')
        form.method = 'POST'
        form.action = `/api/auth/signin/${provider}`

        const csrfInput = popup.document.createElement('input')
        csrfInput.type = 'hidden'
        csrfInput.name = 'csrfToken'
        csrfInput.value = csrfToken
        form.appendChild(csrfInput)

        const callbackInput = popup.document.createElement('input')
        callbackInput.type = 'hidden'
        callbackInput.name = 'callbackUrl'
        callbackInput.value = `${window.location.origin}/auth/popup-callback`
        form.appendChild(callbackInput)

        popup.document.body.appendChild(form)
        form.submit()
      })

    // Poll for popup close (user cancelled without completing auth)
    pollRef.current = setInterval(() => {
      if (!popup || popup.closed) {
        cleanupPopup()
      }
    }, 500)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) cleanupPopup()
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-[#0f1117] border-slate-700/60 text-slate-200 shadow-2xl shadow-purple-900/20">
        <DialogHeader className="text-center space-y-4">
          {/* Pulsing Logo */}
          <div className="flex justify-center">
            <div className="animate-pulse-glow">
              <ArchcelerateLogo variant="icon" className="w-16 h-16 rounded-lg" />
            </div>
          </div>

          {/* Terminal Header */}
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-slate-600">
              INITIALIZING IDENTITY HANDSHAKE
            </p>
            <DialogTitle className="font-mono text-lg font-bold tracking-wider">
              <span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                SYSTEM ACCESS
              </span>
            </DialogTitle>
            <p className="font-mono text-[11px] text-slate-500 tracking-widest uppercase">
              AUTHORIZATION REQUIRED
            </p>
          </div>

          <div className="mx-auto w-20 h-px bg-gradient-to-r from-purple-600/50 to-cyan-500/50" />
        </DialogHeader>

        {loadingProvider ? (
          /* Loading / Popup Active State */
          <div className="py-10 text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
            <p className="font-mono text-xs text-green-400 animate-pulse">
              {'>'} AWAITING {loadingProvider.toUpperCase()}_OAUTH RESPONSE...
            </p>
            <p className="font-mono text-[10px] text-slate-600">
              COMPLETE AUTHENTICATION IN THE POPUP WINDOW
            </p>
          </div>
        ) : (
          /* Auth Buttons */
          <div className="py-3 space-y-3">
            {/* Primary Tier — GitHub & Google */}
            <div className="grid grid-cols-2 gap-3">
              <AuthButton
                provider="github"
                variant="primary"
                onClick={() => handleSignIn('github')}
                className="w-full"
              />
              <AuthButton
                provider="google"
                variant="primary"
                onClick={() => handleSignIn('google')}
                className="w-full"
              />
            </div>

            {/* Secondary Tier — LinkedIn */}
            <AuthButton
              provider="linkedin"
              variant="secondary"
              onClick={() => handleSignIn('linkedin')}
              className="w-full"
            />

            {/* Utility Tier — Facebook */}
            <div className="flex justify-center">
              <AuthButton
                provider="facebook"
                variant="utility"
                onClick={() => handleSignIn('facebook')}
              />
            </div>
          </div>
        )}

        {/* Terminal Footer */}
        <div className="pt-3 border-t border-slate-700/50 text-center space-y-1.5">
          <p className="font-mono text-[9px] text-slate-600 leading-relaxed">
            By continuing, you accept the{' '}
            <Link href="/terms" className="text-purple-500 hover:text-purple-400">
              USER_AGREEMENT
            </Link>{' '}
            &amp;{' '}
            <Link href="/privacy" className="text-purple-500 hover:text-purple-400">
              PRIVACY_PROTOCOL
            </Link>
          </p>
          <p className="font-mono text-[8px] text-slate-700 tracking-widest uppercase">
            256-BIT ENCRYPTED SESSION &bull; TLS 1.3
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
