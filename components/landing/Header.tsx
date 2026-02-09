'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArchcelerateLogo } from '@/components/brand/ArchcelerateLogo'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface HeaderProps {
  onLoginClick: () => void
}

export function Header({ onLoginClick }: HeaderProps) {
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <ArchcelerateLogo variant="compact" className="h-10 w-auto" />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('projects')}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Projects
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Testimonials
            </button>
          </nav>

          {/* Auth Area */}
          {session ? (
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || 'User'} />
                <AvatarFallback className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-semibold">
                  {(session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                {session.user?.name?.split(' ')[0] || 'My Account'}
              </span>
            </Link>
          ) : (
            <button
              onClick={onLoginClick}
              className="font-mono text-[11px] font-semibold tracking-[1px] uppercase text-slate-600 hover:text-slate-900 transition-colors"
            >
              AUTHORIZE ACCESS
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
