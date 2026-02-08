import * as React from 'react'
import { cn } from '@/lib/utils'

export type AuthProvider = 'google' | 'facebook' | 'linkedin' | 'github' | 'email'
export type AuthButtonVariant = 'primary' | 'secondary' | 'utility' | 'default'

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: AuthProvider
  variant?: AuthButtonVariant
  children?: React.ReactNode
}

const providerIcons: Record<AuthProvider, React.ReactNode> = {
  google: (
    <svg viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="#181717">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
}

const providerLabels: Record<AuthProvider, string> = {
  google: 'AUTHORIZE: GOOGLE',
  facebook: 'AUTHORIZE: FACEBOOK',
  linkedin: 'AUTHORIZE: LINKEDIN',
  github: 'AUTHORIZE: GITHUB',
  email: 'AUTHORIZE: EMAIL',
}

const utilityLabels: Record<AuthProvider, string> = {
  google: 'CONTINUE VIA: GOOGLE',
  facebook: 'CONTINUE VIA: FACEBOOK',
  linkedin: 'CONTINUE VIA: LINKEDIN',
  github: 'CONTINUE VIA: GITHUB',
  email: 'CONTINUE VIA: EMAIL',
}

const iconSizeClasses: Record<AuthButtonVariant, string> = {
  default: 'w-4 h-4',
  primary: 'w-5 h-5',
  secondary: 'w-4 h-4',
  utility: 'w-3.5 h-3.5',
}

const buttonClasses: Record<AuthButtonVariant, string> = {
  default: cn(
    'h-10 px-4',
    'bg-white border-[1.5px] border-gray-300 rounded-md',
    'text-sm font-medium text-gray-700',
    'shadow-sm',
    'hover:bg-gradient-to-r hover:from-purple-50 hover:to-cyan-50 hover:border-purple-400',
  ),
  primary: cn(
    'h-12 px-5',
    'bg-slate-800 border border-slate-600 rounded-lg',
    'font-mono text-[11px] font-medium tracking-widest text-slate-400 uppercase',
    'hover:border-purple-500/70 hover:text-slate-200 hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]',
  ),
  secondary: cn(
    'h-10 px-4',
    'bg-slate-800/60 border border-slate-600 rounded-md',
    'font-mono text-[11px] font-medium tracking-widest text-slate-500 uppercase',
    'hover:border-slate-500 hover:text-slate-300 hover:bg-[#111]/80',
  ),
  utility: cn(
    'h-8 px-3',
    'bg-transparent border-0 rounded',
    'font-mono text-[10px] text-slate-600 uppercase tracking-widest',
    'hover:text-slate-400',
  ),
}

export const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ provider, variant = 'default', children, className, ...props }, ref) => {
    const useGhostIcons = variant !== 'default'
    const label = variant === 'utility'
      ? utilityLabels[provider]
      : (children || providerLabels[provider])

    return (
      <button
        ref={ref}
        className={cn(
          'group relative',
          'flex items-center justify-center',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-600',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          buttonClasses[variant],
          className
        )}
        {...props}
      >
        <span className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex-shrink-0 transition-all duration-300',
              iconSizeClasses[variant],
              useGhostIcons && 'grayscale brightness-[2] group-hover:grayscale-0 group-hover:brightness-100',
            )}
          >
            {providerIcons[provider]}
          </span>
          <span className="whitespace-nowrap">
            {label}
          </span>
        </span>
      </button>
    )
  }
)

AuthButton.displayName = 'AuthButton'
