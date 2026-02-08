'use client'

const layers = [
  {
    name: 'SHIELD',
    title: 'Governance Gateway',
    metric: '98%',
    metricLabel: 'blocked',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    name: 'BRAIN',
    title: 'Multi-Agent DAG',
    metric: '87%',
    metricLabel: 'cost reduced',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    name: 'LIBRARY',
    title: 'Hybrid Search + Rerank',
    metric: '94%',
    metricLabel: 'precision',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    name: 'MUSCLE',
    title: 'Model Router + Distill',
    metric: '90%',
    metricLabel: 'savings',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

const pipelineStages = ['Query', 'Scrub', 'Plan', 'Retrieve', 'Execute', 'Audit']

interface ArchitectureTourProps {
  onCTAClick?: () => void
}

export function ArchitectureTour({ onCTAClick }: ArchitectureTourProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            The Architecture Behind the{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Architect
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            4 layers. 6 stages. One production-grade system.
          </p>
        </div>

        {/* Layer Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {layers.map((layer, index) => (
            <div key={layer.name} className="relative">
              <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 transition-all duration-300 hover:border-slate-500 h-full">
                <div className="w-12 h-12 mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  {layer.icon}
                </div>

                <div className="text-xs font-bold text-purple-400 tracking-wider uppercase mb-2">
                  {layer.name}
                </div>

                <h3 className="font-display text-lg font-semibold text-white mb-3">
                  {layer.title}
                </h3>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {layer.metric}
                  </span>
                  <span className="text-sm text-slate-400">{layer.metricLabel}</span>
                </div>
              </div>

              {/* Arrow connector between cards (lg only) */}
              {index < layers.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <svg className="w-8 h-8 text-purple-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Query Flow Pipeline */}
        <div className="mb-12">
          <div className="flex items-center justify-center flex-wrap gap-2 md:gap-0">
            {pipelineStages.map((stage, index) => (
              <div key={stage} className="flex items-center">
                <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-white">
                  {stage}
                </div>
                {index < pipelineStages.length - 1 && (
                  <svg className="w-6 h-6 text-purple-500/50 mx-1 hidden md:block flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Sample Query Result */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              <span className="text-white font-mono">&quot;Summarize cardiac history&quot;</span>
              <span className="mx-3 text-slate-600">&mdash;</span>
              <span className="text-purple-400 font-semibold">340ms</span>
              <span className="mx-2 text-slate-600">|</span>
              <span className="text-cyan-400 font-semibold">$0.001</span>
              <span className="mx-2 text-slate-600">|</span>
              <span className="text-green-400 font-semibold">auditable</span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onCTAClick}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Watch the Full Architecture Tour
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
