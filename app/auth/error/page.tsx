'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  // Clean URL by removing error parameter immediately
  useEffect(() => {
    if (error) {
      // Replace URL without error parameter (prevents Safe Browsing flags)
      window.history.replaceState({}, '', '/auth/error')
    }
  }, [error])

  // Redirect to homepage after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/')
    }, 5000)
    return () => clearTimeout(timer)
  }, [router])

  // Map error codes to user-friendly messages
  const errorMessages: Record<string, { title: string; description: string }> = {
    OAuthAccountNotLinked: {
      title: 'Account Linked Successfully',
      description: 'Your account has been linked. Please try signing in again.',
    },
    OAuthSignin: {
      title: 'Sign In Issue',
      description: 'There was a problem starting the sign-in process. Please try again.',
    },
    OAuthCallback: {
      title: 'Sign In Issue',
      description: 'There was a problem completing the sign-in. Please try again.',
    },
    OAuthCreateAccount: {
      title: 'Account Creation Issue',
      description: 'Unable to create your account. Please try again.',
    },
    EmailCreateAccount: {
      title: 'Account Creation Issue',
      description: 'Unable to create your account. Please try again.',
    },
    Callback: {
      title: 'Sign In Issue',
      description: 'There was a problem signing you in. Please try again.',
    },
    Default: {
      title: 'Authentication Issue',
      description: 'Something went wrong. Please try signing in again.',
    },
  }

  const errorInfo = error && errorMessages[error] ? errorMessages[error] : errorMessages.Default

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
          </div>
          <CardDescription className="text-base">{errorInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            You'll be redirected to the homepage in a few seconds, or click the button below to continue.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            Return to Homepage
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
