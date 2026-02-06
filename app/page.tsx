'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/landing/Header'
import { SystemDiagram } from '@/components/landing/SystemDiagram'
import { TechStack } from '@/components/landing/TechStack'
import { ProjectShowcase } from '@/components/landing/ProjectShowcase'
import { Testimonials } from '@/components/landing/Testimonials'
import { LoginModal } from '@/components/auth/LoginModal'

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      const errorMessages: Record<string, string> = {
        'OAuthAccountNotLinked': 'This email is already registered. Please sign in with your original provider.',
        'OAuthSignin': 'Error signing in with OAuth provider.',
        'OAuthCallback': 'Error in OAuth callback.',
        'Configuration': 'Server configuration error.',
        'AccessDenied': 'Access denied.',
        'Verification': 'Verification error.',
        'Default': 'An error occurred during sign in.'
      }
      setErrorMessage(errorMessages[error] || errorMessages['Default'])

      // Clear error from URL after 5 seconds
      setTimeout(() => {
        setErrorMessage(null)
        window.history.replaceState({}, '', '/')
      }, 5000)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Navigation Header */}
      <Header onLoginClick={() => setShowLoginModal(true)} />

      {/* Error Banner */}
      {errorMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="ml-auto flex-shrink-0 text-red-400 hover:text-red-500"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
            {/* Metrics Badge */}
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-100 rounded-full">
              <span className="text-sm font-semibold text-gray-900">
                Joined by 500+ Senior/Lead Engineers from Stripe, Google, and Meta
              </span>
            </div>

            {/* Headline - The "Architect" Hook */}
            <div className="text-center mb-8 max-w-3xl">
              <h1 className="font-display text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.3]">
                <span className="whitespace-nowrap block mb-2">Build AI Products. Harden Systems.</span>
                <span className="inline-block bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent pb-2">
                  Become an AI Architect.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
                The <span className="font-semibold text-gray-900">comprehensive roadmap</span> for software engineers to master the <span className="font-semibold text-gray-900">physics of LLMs</span>, build <span className="font-semibold text-gray-900">sovereign security frameworks</span>, and ship a <span className="font-semibold text-gray-900">complete portfolio</span> of production-grade systems.
              </p>

              {/* Dual-Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {/* Primary Action: Start Skill Diagnosis */}
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  Start Skill Diagnosis
                </button>

                {/* Secondary Action: Watch Architecture Tour */}
                <Link href="#features">
                  <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-full hover:border-purple-500 hover:text-purple-600 transition-all duration-200">
                    Watch Architecture Tour
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* System Diagram - Full Width */}
        <div className="w-full px-4">
          <SystemDiagram />
        </div>

        {/* Quick Stats */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="mt-12 mb-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                12
              </div>
              <div className="text-sm text-gray-600 mt-1">Weeks</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                10
              </div>
              <div className="text-sm text-gray-600 mt-1">Enterprise Scenarios</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                7
              </div>
              <div className="text-sm text-gray-600 mt-1">Production Systems</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Command Center - System Modules */}
      <section id="features" className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The Command Center
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Production-grade system modules that prove your mastery to CTOs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Module 1 - Skill Diagnosis */}
            <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent hover:bg-gradient-to-br hover:from-purple-50 hover:to-cyan-50">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              <div className="relative">
                <div className="w-12 h-12 mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>

                <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">
                  Skill Diagnosis
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  A 7-axis telemetry report that proves your mastery to CTOs. Track your progression across Systematic Prompting, Sovereign Governance, and 5 other core domains.
                </p>
                <Link href="/diagnosis" className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center">
                  Generate My Report
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Module 2 - Architect's Toolkit */}
            <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent hover:bg-gradient-to-br hover:from-purple-50 hover:to-cyan-50">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              <div className="relative">
                <div className="w-12 h-12 mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">
                  Architect's Toolkit
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  Access to Claude 4.5/GPT-5 playgrounds and local vLLM templates. Test model cascades, compare providers, and prototype at production scale.
                </p>
                <button className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center">
                  Explore toolkit
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Module 3 - The Safety Proxy */}
            <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent hover:bg-gradient-to-br hover:from-purple-50 hover:to-cyan-50">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              <div className="relative">
                <div className="w-12 h-12 mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>

                <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">
                  The Safety Proxy
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  Engineer the "Hardened Shell"—a middle-tier service that intercepts all traffic to enforce Sovereign Governance. Features pre-built middleware for PII Redaction, reversible tokenization, and structured audit logging to meet HIPAA and SOC2 standards.
                </p>

                {/* Trust Badges - Compliance Sandwich */}
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded border border-green-200">
                    HIPAA
                  </span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-200">
                    GDPR
                  </span>
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded border border-purple-200">
                    SOC2
                  </span>
                </div>

                <Link href="/security" className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center">
                  View Security Specs
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Module 4 - Agentic Registry */}
            <div className="group relative bg-white p-8 rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent hover:bg-gradient-to-br hover:from-purple-50 hover:to-cyan-50">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              <div className="relative">
                <div className="w-12 h-12 mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>

                <h3 className="font-display text-xl font-semibold text-gray-900 mb-3">
                  Agentic Registry
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  A library of autonomous supervisor and collaborative swarm patterns. Hierarchical orchestration, semantic circuit breakers, and persistent checkpointing.
                </p>
                <button className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center">
                  Browse patterns
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Showcase */}
      <section id="projects" className="py-8">
        <ProjectShowcase />
      </section>

      {/* The 12-Week Production Roadmap - Visual Timeline */}
      <section className="py-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The 12-Week Production Roadmap
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform from engineer to architect through boardroom-level scenarios
            </p>
          </div>

          <div className="space-y-8">
            {/* Phase 1: Weeks 1-4 */}
            <div className="group relative bg-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-400 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">1-4</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-display text-2xl font-bold text-gray-900">
                      The Engine & The Interface
                    </h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                      Foundation
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Master tokenization physics, model cascades, and type-safe extraction. Build PII redaction middleware and self-healing JSON systems.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded flex items-center justify-center mt-0.5">
                        <span className="text-purple-700 text-xs font-bold">W1</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Multi-Tier Health Triage</div>
                        <div className="text-xs text-gray-600">87.5% cost reduction with model cascade</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded flex items-center justify-center mt-0.5">
                        <span className="text-purple-700 text-xs font-bold">W2</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">HIPAA-Compliant Gateway</div>
                        <div className="text-xs text-gray-600">100% compliance, $1M+ fines prevented</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-200 rounded flex items-center justify-center mt-0.5">
                        <span className="text-purple-700 text-xs font-bold">W4</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Support Orchestrator</div>
                        <div className="text-xs text-gray-600">60x faster triage, 800% ROI</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2: Weeks 5-8 */}
            <div className="group relative bg-white p-8 rounded-2xl border-2 border-cyan-200 hover:border-cyan-300 transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">5-8</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-display text-2xl font-bold text-gray-900">
                      Logic & Launch
                    </h3>
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-sm font-semibold rounded-full">
                      Production
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Deploy multi-agent swarms with persistent checkpointing. Implement hybrid retrieval, LLM-as-a-Judge evaluation, and system design portfolios.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-cyan-200 rounded flex items-center justify-center mt-0.5">
                        <span className="text-cyan-700 text-xs font-bold">W5</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Medical Research Swarm</div>
                        <div className="text-xs text-gray-600">96% time reduction, $533K/year savings</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-cyan-200 rounded flex items-center justify-center mt-0.5">
                        <span className="text-cyan-700 text-xs font-bold">W6</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Clinical RAG System</div>
                        <div className="text-xs text-gray-600">94% precision with hybrid retrieval</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-cyan-200 rounded flex items-center justify-center mt-0.5">
                        <span className="text-cyan-700 text-xs font-bold">W7</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Auto-Eval Pipeline</div>
                        <div className="text-xs text-gray-600">410x faster testing, 98% cost reduction</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-cyan-200 rounded flex items-center justify-center mt-0.5">
                        <span className="text-cyan-700 text-xs font-bold">W8</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Portfolio Launch</div>
                        <div className="text-xs text-gray-600">Director-level system design docs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 3: Weeks 9-12 */}
            <div className="group relative bg-white p-8 rounded-2xl border-2 border-indigo-200 hover:border-indigo-300 transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">9-12</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-display text-2xl font-bold text-gray-900">
                      Advanced Enterprise
                    </h3>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                      Architect-Level
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Master GraphRAG knowledge graphs, QLoRA fine-tuning, hierarchical agent swarms, and global multi-region AI gateways at 1M+ user scale.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-200 rounded flex items-center justify-center mt-0.5">
                        <span className="text-indigo-700 text-xs font-bold">W9</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Life Sciences GraphRAG</div>
                        <div className="text-xs text-gray-600">333x ROI, 99.9% time reduction</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-200 rounded flex items-center justify-center mt-0.5">
                        <span className="text-indigo-700 text-xs font-bold">W10</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Legal QLoRA Fine-Tuning</div>
                        <div className="text-xs text-gray-600">70% cost reduction, 1,400x ROI</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-200 rounded flex items-center justify-center mt-0.5">
                        <span className="text-indigo-700 text-xs font-bold">W11</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Oncology Research Swarm</div>
                        <div className="text-xs text-gray-600">20x coverage, 94% cost reduction</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-200 rounded flex items-center justify-center mt-0.5">
                        <span className="text-indigo-700 text-xs font-bold">W12</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Global AI Gateway</div>
                        <div className="text-xs text-gray-600">1,480% ROI, 99.97% uptime</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Social Proof: The Hiring Brief */}
      <section className="py-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Don't just get a certificate.{' '}
              <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Get Verified.
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your Architect's Verification Report proves mastery to hiring managers with quantified skill metrics
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left: Visual - Radar Chart Representation */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-purple-100">
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
                    Architect's Verification Report
                  </h3>
                  <p className="text-sm text-gray-600">
                    7-Axis Skill Telemetry | ID: ARCH-2024-7891
                  </p>
                </div>

                {/* Simplified Radar Chart Visualization */}
                <div className="relative w-full aspect-square mb-6 bg-gradient-to-br from-purple-50 to-cyan-50 rounded-xl p-8 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    {/* Background hexagon grid */}
                    <defs>
                      <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.3 }} />
                      </linearGradient>
                    </defs>

                    {/* Concentric hexagons */}
                    <polygon points="100,20 170,55 170,130 100,165 30,130 30,55" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                    <polygon points="100,40 150,65 150,120 100,145 50,120 50,65" fill="none" stroke="#d1d5db" strokeWidth="1" />
                    <polygon points="100,60 130,75 130,110 100,125 70,110 70,75" fill="none" stroke="#9ca3af" strokeWidth="1" />

                    {/* Filled skill area - High scores */}
                    <polygon points="100,25 165,58 160,125 100,155 40,122 35,60" fill="url(#radarGradient)" stroke="#9333ea" strokeWidth="2" />

                    {/* Axis lines */}
                    <line x1="100" y1="92" x2="100" y2="20" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="100" y1="92" x2="170" y2="55" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="100" y1="92" x2="170" y2="130" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="100" y1="92" x2="100" y2="165" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="100" y1="92" x2="30" y2="130" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="100" y1="92" x2="30" y2="55" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2" />

                    {/* Center dot */}
                    <circle cx="100" cy="92" r="3" fill="#9333ea" />
                  </svg>
                </div>

                {/* Skill Scores */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Systematic Prompting</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">96%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Sovereign Governance</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Knowledge Architecture</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">91%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Context Engineering</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">89%</span>
                  </div>
                  <div className="w-full border-t border-gray-200 my-3"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">Architect Tier Achieved</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-bold rounded-full">
                      96%+
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-center">
                  <Link href="/diagnosis">
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200">
                      Generate Your Report
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Testimonial */}
            <div className="space-y-8">
              <div className="relative bg-white p-8 rounded-2xl shadow-xl border-2 border-purple-100">
                {/* Quote Icon */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                <blockquote className="mt-4">
                  <p className="text-xl text-gray-800 leading-relaxed mb-6 font-medium">
                    "Archcelerate didn't teach me how to prompt; it taught me how to{' '}
                    <span className="font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                      architect a $1M/year AI system that doesn't break
                    </span>."
                  </p>
                  <footer className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">JD</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Senior AI Lead</div>
                      <div className="text-sm text-gray-600">Stripe</div>
                    </div>
                  </footer>
                </blockquote>
              </div>

              {/* Key Differentiators */}
              <div className="space-y-4">
                <h4 className="font-display text-xl font-bold text-gray-900">
                  What CTOs Look For:
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Quantified Mastery</div>
                      <div className="text-sm text-gray-600">7-axis skill metrics, not buzzwords</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Production Systems</div>
                      <div className="text-sm text-gray-600">7 deployed projects with ROI documentation</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Architect-Level Portfolio</div>
                      <div className="text-sm text-gray-600">Director-tier system design documentation</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Enterprise Battle-Testing</div>
                      <div className="text-sm text-gray-600">HIPAA, GDPR, SOC2 compliance patterns</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-8">
        <Testimonials />
      </section>

      {/* Tech Stack Carousel */}
      <TechStack />

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4">
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
