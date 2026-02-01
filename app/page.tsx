'use client'

import { useState } from 'react'
import Link from 'next/link'
import { VideoDemo } from '@/components/landing/VideoDemo'
import { SocialProof } from '@/components/landing/SocialProof'
import { ProjectShowcase } from '@/components/landing/ProjectShowcase'
import { Testimonials } from '@/components/landing/Testimonials'
import { LoginModal } from '@/components/auth/LoginModal'

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen py-12 pb-16">
          {/* Headline - Action focused */}
          <div className="text-center mb-8 max-w-4xl">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              Build AI products.
              <br />
              Ship faster.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Transform from software engineer to AI product builder. 7 hands-on projects with Claude Code.
            </p>
          </div>

          {/* Video Demo */}
          <VideoDemo />

          {/* Log In Button */}
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </main>

      {/* Project Showcase */}
      <ProjectShowcase />

      {/* Testimonials */}
      <Testimonials />

      {/* How It Works - Enhanced Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn by building real AI products with guidance every step
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 - Enhanced */}
            <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent hover:bg-gradient-to-br hover:from-purple-50 hover:to-cyan-50">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              <div className="relative">
                {/* Screenshot placeholder */}
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-cyan-100 rounded-lg mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                  7
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Hands-On Projects
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Build real AI products from RAG systems to production agents. Each project ships to real users.
                </p>
                <a href="#projects" className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center">
                  See what you'll build
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 2 - Enhanced */}
            <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent hover:bg-gradient-to-br hover:from-purple-50 hover:to-cyan-50">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-cyan-100 rounded-lg mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>

                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                  24/7
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  AI Mentor
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Get instant help with code reviews, debugging, and architecture. Like having a senior AI engineer on call.
                </p>
                <button className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center">
                  Try the mentor
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Feature 3 - Enhanced */}
            <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent hover:bg-gradient-to-br hover:from-purple-50 hover:to-cyan-50">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-cyan-100 rounded-lg mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>

                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                  Deploy
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Ship to Production
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Every project goes live. Build a portfolio that proves you can ship AI products to real users.
                </p>
                <button className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center">
                  See example portfolios
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Ready to Build AI Products?
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Start with your first project today. No AI experience required.
          </p>

          <button
            onClick={() => setShowLoginModal(true)}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Social Proof Strip */}
      <SocialProof />

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <Link href="/terms" className="hover:text-gray-900 transition-colors">
              Terms of Service
            </Link>
            <span className="mx-3">·</span>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  )
}
