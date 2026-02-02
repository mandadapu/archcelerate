'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/landing/Header'
import { VideoDemo } from '@/components/landing/VideoDemo'
import { TechStack } from '@/components/landing/TechStack'
import { SocialProof } from '@/components/landing/SocialProof'
import { ProjectShowcase } from '@/components/landing/ProjectShowcase'
import { Testimonials } from '@/components/landing/Testimonials'
import { LoginModal } from '@/components/auth/LoginModal'

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Navigation Header */}
      <Header onLoginClick={() => setShowLoginModal(true)} />

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex flex-col items-center justify-center min-h-screen py-20">
          {/* Metrics Badge */}
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-100 rounded-full">
            <span className="text-sm font-semibold text-gray-900">
              Join 500+ engineers building AI products
            </span>
          </div>

          {/* Headline - Action focused */}
          <div className="text-center mb-8 max-w-4xl">
            <h1 className="font-display text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              Build AI products.
              <br />
              Ship faster.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Transform from software engineer to AI product builder in <span className="font-semibold text-gray-900">12 weeks</span>.
              {' '}<span className="font-semibold text-gray-900">38+ hands-on lessons</span> with Claude Code.
            </p>
          </div>

          {/* Video Demo */}
          <VideoDemo />

          {/* CTA Button */}
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Start Building Now
          </button>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                12
              </div>
              <div className="text-sm text-gray-600 mt-1">Weeks</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                38+
              </div>
              <div className="text-sm text-gray-600 mt-1">Lessons</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                7
              </div>
              <div className="text-sm text-gray-600 mt-1">Projects</div>
            </div>
          </div>
        </div>
      </main>

      {/* Tech Stack Carousel - 80px spacing */}
      <TechStack />

      {/* What You Get - Core Features - 80px spacing */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What You Get
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to build and ship production AI systems
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 - Projects */}
            <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent hover:bg-gradient-to-br hover:from-purple-50 hover:to-cyan-50">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              <div className="relative">
                <div className="aspect-video rounded-lg mb-6 overflow-hidden">
                  <img
                    src="/images/cards/projects.svg"
                    alt="7 Hands-on Projects"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                  7
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">
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

            {/* Feature 2 - AI Mentor */}
            <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent hover:bg-gradient-to-br hover:from-purple-50 hover:to-cyan-50">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              <div className="relative">
                <div className="aspect-video rounded-lg mb-6 overflow-hidden">
                  <img
                    src="/images/cards/mentor.svg"
                    alt="24/7 AI Mentor"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                  24/7
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">
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

            {/* Feature 3 - Deploy */}
            <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent hover:bg-gradient-to-br hover:from-purple-50 hover:to-cyan-50">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              <div className="relative">
                <div className="aspect-video rounded-lg mb-6 overflow-hidden">
                  <img
                    src="/images/cards/deploy.svg"
                    alt="Deploy to Production"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                  Deploy
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">
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

      {/* Project Showcase - 80px spacing */}
      <section id="projects" className="py-20">
        <ProjectShowcase />
      </section>

      {/* Final CTA Section - 80px spacing */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Ready to Build AI Products?
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Start with your first project today. No AI experience required.
          </p>

          <button
            onClick={() => setShowLoginModal(true)}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Start Building Now
          </button>

          {/* Additional trust signals */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Open source</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Self-paced</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - 80px spacing */}
      <section id="testimonials" className="py-20">
        <Testimonials />
      </section>

      {/* Social Proof Strip - 80px spacing */}
      <div className="py-20">
        <SocialProof />
      </div>

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
