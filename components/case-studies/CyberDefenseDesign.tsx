'use client'

import { useState } from 'react'

interface Agent {
  id: string
  name: string
  icon: string
  model: string
  modelColor: 'emerald' | 'blue' | 'purple'
  cost: string
  latency: string
  purpose: string
  inputs: string[]
  outputs: string[]
  capabilities: string[]
  whyThisModel: string
  failureMode: string
}

const agents: Agent[] = [
  {
    id: 'ingest',
    name: 'Ingest Agent',
    icon: '\u{1F4E5}',
    model: 'Haiku 4.5',
    modelColor: 'emerald',
    cost: '$0.25/MTok',
    latency: '~130ms',
    purpose: 'Reads raw security logs and validates data quality',
    inputs: ['Raw security logs (syslog, JSON, CSV, Windows Event Log)'],
    outputs: ['Parsed & validated log entries', 'Data quality report', 'Invalid entry flags'],
    capabilities: [
      'Multi-format log parsing (syslog, JSON, CSV)',
      'Timestamp normalization across timezones',
      'Field extraction (source IP, dest IP, event type)',
      'Data quality scoring per entry',
      'Malformed entry flagging (keeps but marks)',
      'Deduplication of repeated entries',
    ],
    whyThisModel:
      'High-volume parsing is simple, repetitive work. Haiku is 60x cheaper than Opus and handles structured extraction perfectly.',
    failureMode:
      'If parsing fails \u2192 entry kept as raw with is_valid=false. Pipeline continues with valid entries only.',
  },
  {
    id: 'detect',
    name: 'Detect Agent',
    icon: '\u{1F50D}',
    model: 'Sonnet 4.5',
    modelColor: 'blue',
    cost: '$3.00/MTok',
    latency: '~800ms',
    purpose: 'Finds threats and anomalies in validated logs',
    inputs: ['Validated & parsed log entries from Ingest Agent'],
    outputs: ['Detected threats with confidence scores', 'Anomaly list', 'Detection statistics'],
    capabilities: [
      'Layer 1: Rule-based pattern matching (free, instant)',
      'Layer 2: AI-powered novel threat detection',
      'Brute force attack detection',
      'Data exfiltration pattern recognition',
      'Port scanning & reconnaissance detection',
      'Lateral movement identification',
      'Low-and-slow attack correlation',
      'Living-off-the-land technique spotting',
    ],
    whyThisModel:
      'Detection requires reasoning about patterns across multiple log entries. Sonnet balances cost with the analytical depth needed.',
    failureMode:
      'If AI detection fails \u2192 fall back to rule-based results only. Never blocks pipeline.',
  },
  {
    id: 'classify',
    name: 'Classify Agent',
    icon: '\u2696\uFE0F',
    model: 'Sonnet 4.5',
    modelColor: 'blue',
    cost: '$3.00/MTok',
    latency: '~800ms',
    purpose: 'Assesses risk levels and enriches threats with context',
    inputs: ['Detected threats from Detect Agent', 'Original log context'],
    outputs: ['Risk-scored threats', 'MITRE ATT&CK mappings', 'Priority rankings'],
    capabilities: [
      'Risk scoring: likelihood \u00D7 impact \u00D7 exploitability',
      '5-level classification (Critical \u2192 Informational)',
      'MITRE ATT&CK technique mapping',
      'Kill chain stage identification',
      'Business impact assessment',
      'Affected systems identification',
      'Contextual enrichment from log patterns',
      'Priority ranking for response teams',
    ],
    whyThisModel:
      'Classification needs structured reasoning and domain knowledge mapping. Sonnet handles MITRE framework mapping well without Opus cost.',
    failureMode:
      'If classification fails \u2192 auto-assign MEDIUM risk. Ensures all threats reach Report Agent.',
  },
  {
    id: 'report',
    name: 'Report Agent',
    icon: '\u{1F4CB}',
    model: 'Opus 4.6',
    modelColor: 'purple',
    cost: '$15.00/MTok',
    latency: '~2200ms',
    purpose: 'Generates incident reports and action plans',
    inputs: ['Classified & prioritized threats', 'Detection statistics', 'Log timeline'],
    outputs: [
      'Executive summary',
      'Detailed incident report',
      'Ordered action plan',
      'Strategic recommendations',
    ],
    capabilities: [
      'Executive summary for leadership (2-3 sentences)',
      'Attack timeline reconstruction',
      'Ordered remediation steps with owners & urgency',
      'Specific, actionable instructions (not vague advice)',
      'Dual-audience writing (technical + executive)',
      'Strategic prevention recommendations',
      'IOC (Indicators of Compromise) summary',
      'Compliance-ready documentation format',
    ],
    whyThisModel:
      'This is the highest-stakes output. Bad reports = bad incident response = breaches worsen. Opus ensures nuanced, actionable, dual-audience writing.',
    failureMode:
      'If report generation fails \u2192 produce structured template with raw classified data. Human analyst can complete manually.',
  },
]

const pipelineSteps = [
  { from: 'ingest', to: 'detect', label: 'Validated logs', condition: 'Valid logs > 0' },
  { from: 'detect', to: 'classify', label: 'Detected threats', condition: 'Threats found > 0' },
  { from: 'classify', to: 'report', label: 'Classified threats', condition: 'Always proceeds' },
]

const modelColors = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-400',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-400',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800',
    dot: 'bg-purple-400',
  },
}

const tabs = [
  { id: 'pipeline', label: 'Pipeline Design', icon: '\u{1F504}' },
  { id: 'agents', label: 'Agent Details', icon: '\u{1F916}' },
  { id: 'dashboard', label: 'Dashboard Layout', icon: '\u{1F4CA}' },
  { id: 'data', label: 'Data Flow', icon: '\u{1F4BE}' },
  { id: 'cost', label: 'Cost Model', icon: '\u{1F4B0}' },
]

function PipelineView({ onSelectAgent }: { onSelectAgent: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-1 text-sm font-semibold text-gray-700">End-to-End Pipeline</h3>
        <p className="mb-5 text-xs text-gray-400">
          LangGraph orchestrates four specialized agents in sequence with conditional routing
        </p>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2">
            <span className="text-lg">{'\u{1F4C4}'}</span>
            <div>
              <div className="text-xs font-semibold text-gray-700">Raw Security Logs</div>
              <div className="text-xs text-gray-400">
                syslog &middot; JSON &middot; CSV &middot; Windows Event Log
              </div>
            </div>
          </div>

          <div className="text-lg text-gray-300">{'\u25BC'}</div>

          {agents.map((agent, i) => {
            const mc = modelColors[agent.modelColor]
            return (
              <div key={agent.id} className="w-full max-w-lg">
                <button
                  type="button"
                  onClick={() => onSelectAgent(agent.id)}
                  className={`${mc.bg} ${mc.border} w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-shadow hover:shadow-md`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{agent.icon}</span>
                      <div>
                        <span className="text-sm font-bold text-gray-800">{agent.name}</span>
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${mc.badge}`}
                        >
                          {agent.model}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{agent.cost}</div>
                      <div className="text-xs text-gray-400">{agent.latency}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{agent.purpose}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {agent.outputs.map((o, j) => (
                      <span
                        key={j}
                        className="rounded bg-white/70 px-1.5 py-0.5 text-xs text-gray-500"
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                </button>

                {i < agents.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <div className="rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs text-gray-400">
                      {'\u26A1'} {pipelineSteps[i].condition}
                    </div>
                    <div className="text-sm text-gray-300">{'\u25BC'}</div>
                  </div>
                )}
              </div>
            )
          })}

          <div className="text-lg text-gray-300">{'\u25BC'}</div>

          <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2">
            <span className="text-lg">{'\u{1F6E1}\uFE0F'}</span>
            <div>
              <div className="text-xs font-semibold text-gray-700">
                Incident Report + Action Plan
              </div>
              <div className="text-xs text-gray-400">
                Executive summary &middot; Remediation steps &middot; MITRE mappings
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Conditional Routing Logic</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3 text-xs">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
              1
            </span>
            <div>
              <span className="font-medium text-gray-700">Ingest &rarr; Detect:</span>{' '}
              <span className="text-gray-500">
                Only if valid parsed logs &gt; 0. If all logs are malformed, pipeline returns an
                empty report immediately &mdash; no wasted API calls.
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              2
            </span>
            <div>
              <span className="font-medium text-gray-700">Detect &rarr; Classify:</span>{' '}
              <span className="text-gray-500">
                Only if threats found &gt; 0. Clean logs get a &quot;no threats detected&quot;
                report without invoking Classify or Report agents.
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
              3
            </span>
            <div>
              <span className="font-medium text-gray-700">Classify &rarr; Report:</span>{' '}
              <span className="text-gray-500">
                Always proceeds. Even low-risk findings get documented for audit trail and
                compliance.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentDetail({ agentId }: { agentId: string }) {
  const agent = agents.find((a) => a.id === agentId)
  if (!agent) return null
  const mc = modelColors[agent.modelColor]

  return (
    <div className="space-y-4">
      <div className={`${mc.bg} ${mc.border} rounded-xl border-2 p-5`}>
        <div className="mb-3 flex items-center gap-3">
          <span className="text-3xl">{agent.icon}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{agent.name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${mc.badge}`}>
              {agent.model} &middot; {agent.cost} &middot; {agent.latency}
            </span>
          </div>
        </div>
        <p className="mb-4 text-sm text-gray-600">{agent.purpose}</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Inputs
            </div>
            <div className="space-y-1">
              {agent.inputs.map((inp, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="mt-0.5 text-gray-400">&rarr;</span>
                  {inp}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Outputs
            </div>
            <div className="space-y-1">
              {agent.outputs.map((out, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="mt-0.5 text-gray-400">&larr;</span>
                  {out}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Capabilities
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {agent.capabilities.map((cap, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${mc.dot}`}></span>
              <span className="text-gray-700">{cap}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Why {agent.model}?
          </div>
          <p className="text-xs leading-relaxed text-gray-600">{agent.whyThisModel}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Failure Mode
          </div>
          <p className="text-xs leading-relaxed text-gray-600">{agent.failureMode}</p>
        </div>
      </div>
    </div>
  )
}

function DashboardLayout() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-1 text-sm font-semibold text-gray-700">Gradio Dashboard Layout</h3>
        <p className="mb-4 text-xs text-gray-400">
          Four-panel interface for the complete cyber defense workflow
        </p>

        <div className="space-y-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-3">
          <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{'\u{1F6E1}\uFE0F'}</span>
              <span className="text-sm font-bold text-white">AI Cyber-Defense System</span>
            </div>
            <div className="flex gap-2">
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                Pipeline: Ready
              </span>
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                4 Agents Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-2 text-xs font-semibold text-gray-600">
                {'\u{1F4C4}'} Panel 1 &mdash; Log Input
              </div>
              <div className="h-24 overflow-hidden rounded bg-gray-900 p-2 font-mono text-xs leading-relaxed text-green-400">
                <div>Jan 10 03:14:22 sshd: Failed password...</div>
                <div>Jan 10 03:14:23 sshd: Failed password...</div>
                <div>Jan 10 03:14:24 sshd: Failed password...</div>
                <div>Jan 10 03:15:01 sudo: admin : USER=root</div>
                <div>Jan 10 03:17:30 scp: large transfer 2.3GB</div>
              </div>
              <div className="mt-2 flex gap-2">
                <div className="flex h-7 flex-1 items-center justify-center rounded bg-indigo-600 text-xs font-medium text-white">
                  {'\u{1F50D}'} Analyze Threats
                </div>
                <div className="flex h-7 items-center justify-center rounded bg-gray-100 px-2 text-xs text-gray-500">
                  Upload File
                </div>
              </div>
            </div>

            <div className="col-span-3 rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-2 text-xs font-semibold text-gray-600">
                {'\u{1F50D}'} Panel 2 &mdash; Threat Detection (Live)
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between rounded border border-red-200 bg-red-50 px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                    <span className="text-xs font-medium text-red-800">Brute Force Attack</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-xs text-red-600">95% conf</span>
                    <span className="rounded bg-red-200 px-1.5 py-0.5 text-xs font-bold text-red-800">
                      CRITICAL
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded border border-orange-200 bg-orange-50 px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    <span className="text-xs font-medium text-orange-800">
                      Privilege Escalation
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-xs text-orange-600">88% conf</span>
                    <span className="rounded bg-orange-200 px-1.5 py-0.5 text-xs font-bold text-orange-800">
                      HIGH
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded border border-orange-200 bg-orange-50 px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-400"></span>
                    <span className="text-xs font-medium text-orange-700">Data Exfiltration</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-xs text-orange-600">82% conf</span>
                    <span className="rounded bg-orange-200 px-1.5 py-0.5 text-xs font-bold text-orange-800">
                      HIGH
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded border border-yellow-200 bg-yellow-50 px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                    <span className="text-xs font-medium text-yellow-800">Port Scanning</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-xs text-yellow-600">71% conf</span>
                    <span className="rounded bg-yellow-200 px-1.5 py-0.5 text-xs font-bold text-yellow-800">
                      MEDIUM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-2 text-xs font-semibold text-gray-600">
                {'\u2696\uFE0F'} Panel 3 &mdash; Risk Classification
              </div>
              <div className="mb-2 grid grid-cols-4 gap-1.5">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">1</div>
                  <div className="text-xs text-gray-400">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-500">2</div>
                  <div className="text-xs text-gray-400">High</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-500">1</div>
                  <div className="text-xs text-gray-400">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-400">0</div>
                  <div className="text-xs text-gray-400">Low</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-gray-400">MITRE:</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">T1110</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">T1548</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">T1041</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-gray-400">Stages:</span>
                  <span className="text-gray-600">
                    Initial Access &rarr; Priv Esc &rarr; Exfil
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-2 text-xs font-semibold text-gray-600">
                {'\u{1F4CB}'} Panel 4 &mdash; Incident Report
              </div>
              <div className="space-y-1.5 rounded bg-gray-50 p-2 text-xs text-gray-600">
                <div>
                  <span className="font-semibold">Summary:</span> Active brute-force campaign from
                  203.0.113.50 resulted in compromised admin credentials...
                </div>
                <div className="border-t border-gray-200 pt-1.5">
                  <span className="font-semibold">Action Plan:</span>
                  <div className="mt-1 space-y-0.5">
                    <div className="flex gap-1">
                      <span className="font-bold text-red-500">1.</span> Block IP 203.0.113.50 at
                      firewall <span className="text-red-400">[IMMEDIATE]</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="font-bold text-red-500">2.</span> Revoke admin credentials{' '}
                      <span className="text-red-400">[IMMEDIATE]</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="font-bold text-orange-500">3.</span> Audit all root sessions{' '}
                      <span className="text-orange-400">[1HR]</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <div className="flex h-6 items-center rounded bg-gray-100 px-2 text-xs text-gray-500">
                  {'\u{1F4E5}'} Export PDF
                </div>
                <div className="flex h-6 items-center rounded bg-gray-100 px-2 text-xs text-gray-500">
                  {'\u{1F4E7}'} Send to Team
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 text-xs text-gray-500">
            <div className="flex gap-4">
              <span>
                Logs analyzed:{' '}
                <span className="font-mono font-medium text-gray-700">10</span>
              </span>
              <span>
                Threats found:{' '}
                <span className="font-mono font-medium text-red-600">4</span>
              </span>
              <span>
                Invalid entries:{' '}
                <span className="font-mono font-medium text-yellow-600">0</span>
              </span>
            </div>
            <div className="flex gap-4">
              <span>
                Pipeline cost:{' '}
                <span className="font-mono font-medium text-emerald-600">$0.0032</span>
              </span>
              <span>
                Total time:{' '}
                <span className="font-mono font-medium text-gray-700">4.2s</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DataFlow() {
  const stages = [
    {
      agent: '\u{1F4E5} Ingest',
      color: 'emerald',
      bgColor: '#ecfdf5',
      input: 'Raw text: "Jan 10 03:14:22 sshd: Failed password for admin..."',
      output:
        '{ timestamp: "Jan 10 03:14:22", source: "sshd", event: "failed_auth", source_ip: "203.0.113.50", is_valid: true }',
    },
    {
      agent: '\u{1F50D} Detect',
      color: 'blue',
      bgColor: '#eff6ff',
      input: 'Array of validated LogEntry objects',
      output:
        '{ threat_id: "RULE-BRUTE-001", type: "brute_force", confidence: 0.95, source_logs: [0,1,2,3,4], method: "rule_based" }',
    },
    {
      agent: '\u2696\uFE0F Classify',
      color: 'blue',
      bgColor: '#eff6ff',
      input: 'Array of Threat objects',
      output:
        '{ threat_id: "RULE-BRUTE-001", risk: "critical", score: 9.2, mitre: "T1110", stage: "initial_access", impact: "Credential compromise" }',
    },
    {
      agent: '\u{1F4CB} Report',
      color: 'purple',
      bgColor: '#faf5ff',
      input: 'Array of ClassifiedThreat objects',
      output:
        '{ summary: "Active brute-force...", action_plan: [{ step: 1, action: "Block IP", urgency: "immediate" }], recommendations: [...] }',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-1 text-sm font-semibold text-gray-700">LangGraph Shared State</h3>
        <p className="mb-4 text-xs text-gray-400">
          All agents read from and write to a single PipelineState object &mdash; LangGraph manages
          the flow
        </p>

        <div className="overflow-x-auto rounded-xl bg-gray-900 p-4 font-mono text-xs leading-relaxed">
          <div className="text-gray-400"># LangGraph PipelineState (Pydantic model)</div>
          <div className="mt-2 text-purple-300">
            class <span className="text-yellow-300">PipelineState</span>(BaseModel):
          </div>
          <div className="ml-4 mt-1 text-gray-500"># &mdash; Ingest Agent writes &mdash;</div>
          <div className="ml-4 text-emerald-300">raw_logs: list[str]</div>
          <div className="ml-4 text-emerald-300">parsed_logs: list[LogEntry]</div>
          <div className="ml-4 text-emerald-300">invalid_count: int</div>
          <div className="ml-4 text-emerald-300">total_count: int</div>
          <div className="ml-4 mt-2 text-gray-500"># &mdash; Detect Agent writes &mdash;</div>
          <div className="ml-4 text-blue-300">threats: list[Threat]</div>
          <div className="ml-4 text-blue-300">anomalies: list[Anomaly]</div>
          <div className="ml-4 text-blue-300">detection_stats: dict</div>
          <div className="ml-4 mt-2 text-gray-500"># &mdash; Classify Agent writes &mdash;</div>
          <div className="ml-4 text-blue-300">classified_threats: list[ClassifiedThreat]</div>
          <div className="ml-4 mt-2 text-gray-500"># &mdash; Report Agent writes &mdash;</div>
          <div className="ml-4 text-purple-300">report: IncidentReport</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Data Transformation at Each Stage
        </h3>
        <div className="space-y-3">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-20 shrink-0 pt-1 text-sm font-medium text-gray-700">
                {stage.agent}
              </div>
              <div className="grid flex-1 grid-cols-2 gap-2">
                <div className="rounded-lg bg-gray-50 p-2">
                  <div className="mb-1 text-xs text-gray-400">Input</div>
                  <div className="break-all font-mono text-xs text-gray-600">{stage.input}</div>
                </div>
                <div className="rounded-lg p-2" style={{ backgroundColor: stage.bgColor }}>
                  <div className="mb-1 text-xs text-gray-400">Output</div>
                  <div className="break-all font-mono text-xs text-gray-600">{stage.output}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CostModel() {
  const scenarios = [
    {
      name: 'Small batch',
      logs: 50,
      threats: 3,
      ingestCost: 0.0001,
      detectCost: 0.0015,
      classifyCost: 0.0008,
      reportCost: 0.004,
      opusCost: 0.025,
    },
    {
      name: 'Medium batch',
      logs: 500,
      threats: 12,
      ingestCost: 0.0008,
      detectCost: 0.012,
      classifyCost: 0.005,
      reportCost: 0.006,
      opusCost: 0.18,
    },
    {
      name: 'Large batch',
      logs: 5000,
      threats: 45,
      ingestCost: 0.006,
      detectCost: 0.09,
      classifyCost: 0.035,
      reportCost: 0.008,
      opusCost: 1.4,
    },
    {
      name: 'Enterprise daily',
      logs: 50000,
      threats: 200,
      ingestCost: 0.05,
      detectCost: 0.72,
      classifyCost: 0.28,
      reportCost: 0.012,
      opusCost: 12.5,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
        <h3 className="mb-1 text-sm font-semibold text-emerald-800">
          Multi-Model Routing = Massive Savings
        </h3>
        <p className="text-xs text-emerald-600">
          By using Haiku for ingestion, Sonnet for detection/classification, and Opus only for final
          reports, we achieve 80%+ cost reduction vs. an all-Opus approach.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Cost per Model per Agent</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-2 py-2 text-left font-medium text-gray-500">Agent</th>
                <th className="px-2 py-2 text-left font-medium text-gray-500">Model</th>
                <th className="px-2 py-2 text-right font-medium text-gray-500">Input $/MTok</th>
                <th className="px-2 py-2 text-right font-medium text-gray-500">Output $/MTok</th>
                <th className="px-2 py-2 text-right font-medium text-gray-500">vs Opus</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  agent: '\u{1F4E5} Ingest',
                  model: 'Haiku 4.5',
                  inp: 0.25,
                  out: 1.25,
                  savings: '60x cheaper',
                },
                {
                  agent: '\u{1F50D} Detect',
                  model: 'Sonnet 4.5',
                  inp: 3.0,
                  out: 15.0,
                  savings: '5x cheaper',
                },
                {
                  agent: '\u2696\uFE0F Classify',
                  model: 'Sonnet 4.5',
                  inp: 3.0,
                  out: 15.0,
                  savings: '5x cheaper',
                },
                {
                  agent: '\u{1F4CB} Report',
                  model: 'Opus 4.6',
                  inp: 15.0,
                  out: 75.0,
                  savings: 'baseline',
                },
              ].map((r, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-2 py-2 font-medium text-gray-700">{r.agent}</td>
                  <td className="px-2 py-2 text-gray-600">{r.model}</td>
                  <td className="px-2 py-2 text-right font-mono">${r.inp.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-mono">${r.out.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-mono text-emerald-600">{r.savings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Cost Scenarios</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-2 py-2 text-left font-medium text-gray-500">Scenario</th>
                <th className="px-2 py-2 text-right font-medium text-gray-500">Logs</th>
                <th className="px-2 py-2 text-right font-medium text-gray-500">Threats</th>
                <th className="px-2 py-2 text-right font-medium text-gray-500">Routed Cost</th>
                <th className="px-2 py-2 text-right font-medium text-gray-500">All-Opus Cost</th>
                <th className="px-2 py-2 text-right font-medium text-gray-500">Savings</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, i) => {
                const routed = s.ingestCost + s.detectCost + s.classifyCost + s.reportCost
                const pct = (1 - routed / s.opusCost) * 100
                return (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-2 py-2 font-medium text-gray-700">{s.name}</td>
                    <td className="px-2 py-2 text-right font-mono text-gray-600">
                      {s.logs.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-right font-mono text-gray-600">{s.threats}</td>
                    <td className="px-2 py-2 text-right font-mono text-emerald-600">
                      ${routed.toFixed(4)}
                    </td>
                    <td className="px-2 py-2 text-right font-mono text-gray-500">
                      ${s.opusCost.toFixed(4)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <span className="font-mono font-bold text-emerald-600">
                        {pct.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Why This Cost Model Matters for the Accelerator
        </h3>
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            This project is a{' '}
            <span className="font-semibold text-gray-800">living demonstration</span> of the
            multi-model routing pattern taught in the curriculum. Learners don&apos;t just read about
            cost optimization &mdash; they build a system where:
          </p>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <div className="mb-1 font-semibold text-emerald-800">Haiku handles volume</div>
              <div className="text-emerald-600">
                60x cheaper for parsing work that doesn&apos;t need reasoning
              </div>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <div className="mb-1 font-semibold text-blue-800">Sonnet handles analysis</div>
              <div className="text-blue-600">
                5x cheaper than Opus with sufficient reasoning for detection
              </div>
            </div>
            <div className="rounded-lg border border-purple-100 bg-purple-50 p-3">
              <div className="mb-1 font-semibold text-purple-800">Opus handles stakes</div>
              <div className="text-purple-600">
                Used only where quality failure has real consequences
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CyberDefenseDesign() {
  const [activeTab, setActiveTab] = useState('pipeline')
  const [selectedAgent, setSelectedAgent] = useState('ingest')

  return (
    <div className="not-prose my-8 rounded-xl border border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-3 rounded-t-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{'\u{1F6E1}\uFE0F'}</span>
            <div>
              <h4 className="text-lg font-bold text-gray-900">AI Cyber-Defense System</h4>
              <p className="text-xs text-gray-500">
                Interactive Design &mdash; LangGraph + LangChain + Anthropic + Gradio
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'pipeline' && (
          <PipelineView
            onSelectAgent={(id) => {
              setSelectedAgent(id)
              setActiveTab('agents')
            }}
          />
        )}
        {activeTab === 'agents' && (
          <div className="space-y-4">
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
              {agents.map((a) => {
                const mc = modelColors[a.modelColor]
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAgent(a.id)}
                    className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition ${
                      selectedAgent === a.id
                        ? `${mc.bg} ${mc.text} border ${mc.border} shadow-sm`
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {a.icon} {a.name}
                  </button>
                )
              })}
            </div>
            <AgentDetail agentId={selectedAgent} />
          </div>
        )}
        {activeTab === 'dashboard' && <DashboardLayout />}
        {activeTab === 'data' && <DataFlow />}
        {activeTab === 'cost' && <CostModel />}
      </div>
    </div>
  )
}
