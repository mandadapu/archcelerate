'use client'

export function SystemDiagram() {
  return (
    <div className="w-full px-4 mx-auto my-12">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            The Archcelerate Command Center
          </h3>
          <p className="text-slate-400 text-sm">
            A production request flowing through an enterprise AI stack
          </p>
        </div>

        {/* System Diagram */}
        <div className="relative">
          <svg viewBox="0 0 1200 450" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Gradient definitions */}
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
              </linearGradient>

              {/* Arrow marker */}
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="url(#flowGradient)" />
              </marker>
            </defs>

            {/* Flow lines with gradient */}
            <path
              d="M 150 200 L 280 200"
              stroke="url(#flowGradient)"
              strokeWidth="3"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
            <path
              d="M 440 200 L 570 200"
              stroke="url(#flowGradient)"
              strokeWidth="3"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
            <path
              d="M 730 200 L 860 200"
              stroke="url(#flowGradient)"
              strokeWidth="3"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
            <path
              d="M 1020 200 L 1100 200"
              stroke="url(#flowGradient)"
              strokeWidth="3"
              fill="none"
              markerEnd="url(#arrowhead)"
            />

            {/* Stage 1: User Query */}
            <g>
              <rect x="30" y="160" width="120" height="80" rx="8" fill="#1e293b" stroke="#9333ea" strokeWidth="2" />
              <text x="90" y="195" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600">
                User Query
              </text>
              <text x="90" y="215" textAnchor="middle" fill="#94a3b8" fontSize="11">
                "Analyze patient"
              </text>
              <text x="90" y="230" textAnchor="middle" fill="#94a3b8" fontSize="11">
                "records..."
              </text>
            </g>

            {/* Stage 2: PII Redaction Gateway (Week 2) */}
            <g>
              <rect x="290" y="140" width="150" height="120" rx="8" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
              <circle cx="365" cy="175" r="15" fill="#06b6d4" opacity="0.2" />
              <text x="365" y="180" textAnchor="middle" fill="#06b6d4" fontSize="18">🔒</text>

              <text x="365" y="205" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">
                PII Redaction
              </text>
              <text x="365" y="222" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">
                Gateway
              </text>
              <text x="365" y="242" textAnchor="middle" fill="#94a3b8" fontSize="10">
                Week 2: Hardened Proxy
              </text>
            </g>

            {/* Stage 3: Hybrid RAG Index (Week 6) */}
            <g>
              <rect x="580" y="140" width="150" height="120" rx="8" fill="#1e293b" stroke="#9333ea" strokeWidth="2" />
              <circle cx="655" cy="175" r="15" fill="#9333ea" opacity="0.2" />
              <text x="655" y="180" textAnchor="middle" fill="#9333ea" fontSize="18">🔍</text>

              <text x="655" y="205" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">
                Hybrid RAG
              </text>
              <text x="655" y="222" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">
                Index
              </text>
              <text x="655" y="242" textAnchor="middle" fill="#94a3b8" fontSize="10">
                Week 6: RRF + Vector DB
              </text>
            </g>

            {/* Stage 4: Agent Supervisor (Week 5) */}
            <g>
              <rect x="870" y="140" width="150" height="120" rx="8" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
              <circle cx="945" cy="175" r="15" fill="#06b6d4" opacity="0.2" />
              <text x="945" y="180" textAnchor="middle" fill="#06b6d4" fontSize="18">🤖</text>

              <text x="945" y="205" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">
                Agent
              </text>
              <text x="945" y="222" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">
                Supervisor
              </text>
              <text x="945" y="242" textAnchor="middle" fill="#94a3b8" fontSize="10">
                Week 5: Multi-Agent
              </text>
            </g>

            {/* Stage 5: Response */}
            <g>
              <rect x="1110" y="160" width="80" height="80" rx="8" fill="#1e293b" stroke="#9333ea" strokeWidth="2" />
              <text x="1150" y="195" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600">
                Response
              </text>
              <text x="1150" y="215" textAnchor="middle" fill="#94a3b8" fontSize="11">
                Validated
              </text>
              <text x="1150" y="230" textAnchor="middle" fill="#94a3b8" fontSize="11">
                Output
              </text>
            </g>

            {/* Monitoring Layer (Week 7) */}
            <g>
              <rect x="200" y="280" width="600" height="80" rx="8" fill="#1e293b" stroke="#a855f7" strokeWidth="2" strokeDasharray="5,5" />
              <circle cx="500" cy="305" r="15" fill="#a855f7" opacity="0.2" />
              <text x="500" y="310" textAnchor="middle" fill="#a855f7" fontSize="18">📊</text>

              <text x="500" y="335" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">
                OpenTelemetry Observability Pipeline
              </text>
              <text x="500" y="352" textAnchor="middle" fill="#94a3b8" fontSize="10">
                Week 7: Metrics, Traces, Logs | LLM-as-a-Judge | Cost Attribution
              </text>
            </g>

            {/* Infrastructure Layer Labels */}
            <text x="100" y="380" fill="#64748b" fontSize="11" fontWeight="600">
              INFRASTRUCTURE:
            </text>
            <text x="100" y="400" fill="#94a3b8" fontSize="10">
              Next.js 14 • PostgreSQL • Redis • Pinecone
            </text>
            <text x="100" y="415" fill="#94a3b8" fontSize="10">
              Docker • Vercel • GitHub Actions
            </text>

            <text x="550" y="380" fill="#64748b" fontSize="11" fontWeight="600">
              COMPLIANCE:
            </text>
            <text x="550" y="400" fill="#94a3b8" fontSize="10">
              HIPAA • GDPR • SOC2
            </text>
            <text x="550" y="415" fill="#94a3b8" fontSize="10">
              99.97% Uptime | E2E Encryption
            </text>

            {/* Curriculum Coverage - next to Observability Pipeline */}
            <g>
              <rect x="820" y="280" width="160" height="160" rx="8" fill="#1e293b" stroke="#9333ea" strokeWidth="1" opacity="0.8" />
              <text x="900" y="305" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">
                Curriculum
              </text>
              <text x="900" y="322" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">
                Coverage
              </text>

              <circle cx="840" cy="345" r="3" fill="#06b6d4" />
              <text x="850" y="350" fill="#94a3b8" fontSize="10">Week 2: Security</text>

              <circle cx="840" cy="365" r="3" fill="#9333ea" />
              <text x="850" y="370" fill="#94a3b8" fontSize="10">Week 5: Agents</text>

              <circle cx="840" cy="385" r="3" fill="#06b6d4" />
              <text x="850" y="390" fill="#94a3b8" fontSize="10">Week 6: RAG</text>

              <circle cx="840" cy="405" r="3" fill="#a855f7" />
              <text x="850" y="410" fill="#94a3b8" fontSize="10">Week 7: Observability</text>

              <circle cx="840" cy="425" r="3" fill="#9333ea" />
              <text x="850" y="430" fill="#94a3b8" fontSize="10">Week 12: Production</text>
            </g>

            {/* Title decoration */}
            <text x="600" y="50" textAnchor="middle" fill="url(#flowGradient)" fontSize="16" fontWeight="700">
              Enterprise-Grade AI Architecture
            </text>
          </svg>
        </div>

        {/* Footer metrics */}
        <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
              87.5%
            </div>
            <div className="text-xs text-slate-400 mt-1">Cost Reduction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
              99.97%
            </div>
            <div className="text-xs text-slate-400 mt-1">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
              410x
            </div>
            <div className="text-xs text-slate-400 mt-1">Faster Testing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
              90%+
            </div>
            <div className="text-xs text-slate-400 mt-1">RAG Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  )
}
