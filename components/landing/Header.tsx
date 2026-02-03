'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HeaderProps {
  onLoginClick: () => void
}

export function Header({ onLoginClick }: HeaderProps) {
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
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
              {/* Architectural arch icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                {/* Pillars */}
                <rect x="5" y="9" width="2" height="10" rx="0.5" fill="url(#headerGrad)"/>
                <rect x="17" y="9" width="2" height="10" rx="0.5" fill="url(#headerGrad)"/>
                {/* Top beam */}
                <rect x="5" y="8" width="14" height="1.5" rx="0.5" fill="url(#headerGrad)"/>
                {/* Center arch */}
                <path d="M7 19 Q7 13 12 13 Q17 13 17 19" fill="none" stroke="url(#headerGrad)" strokeWidth="1.2"/>
                {/* AI chip */}
                <rect x="10.5" y="11" width="3" height="3" rx="0.5" fill="#06b6d4"/>
                <circle cx="12" cy="12.5" r="0.7" fill="white" opacity="0.8"/>
                <defs>
                  <linearGradient id="headerGrad" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#9333ea"/>
                    <stop offset="100%" stopColor="#06b6d4"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Archcelerate</span>
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
            <a
              href="https://github.com/mandadapu/archcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              GitHub
            </a>
          </nav>

          {/* CTA Button */}
          <button
            onClick={onLoginClick}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold rounded-full hover:shadow-lg transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  )
}
