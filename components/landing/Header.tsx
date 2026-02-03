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
            <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Architectural arch icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="relative z-10">
                {/* Pillars */}
                <path d="M5 19 L5 10 L7 9 L7 19 Z" fill="url(#headerGrad)" opacity="0.9"/>
                <path d="M17 19 L17 10 L19 9 L19 19 Z" fill="url(#headerGrad)" opacity="0.9"/>
                {/* Top beam */}
                <rect x="6" y="8" width="12" height="2" rx="0.5" fill="#e5e7eb" opacity="0.8"/>
                {/* Center arch */}
                <path d="M8 19 Q8 12 12 12 Q16 12 16 19" fill="none" stroke="url(#headerGrad)" strokeWidth="1.5" opacity="0.6"/>
                {/* AI chip */}
                <rect x="10" y="10" width="4" height="4" rx="0.5" fill="#06b6d4"/>
                <defs>
                  <linearGradient id="headerGrad" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#8b5cf6"/>
                    <stop offset="50%" stopColor="#06b6d4"/>
                    <stop offset="100%" stopColor="#f59e0b"/>
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
