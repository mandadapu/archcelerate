'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface ArchitectTelemetryCardProps {
  recommendedPath: string | null | undefined
  skillScores: Record<string, number> | undefined
}

const skillDomains = [
  { key: 'llm_fundamentals', label: 'LLM Fundamentals' },
  { key: 'prompt_engineering', label: 'Prompt Engineering' },
  { key: 'rag', label: 'RAG Systems' },
  { key: 'agents', label: 'AI Agents' },
  { key: 'multimodal', label: 'Multimodal AI' },
  { key: 'production_ai', label: 'Production AI' },
]

export function ArchitectTelemetryCard({ recommendedPath, skillScores }: ArchitectTelemetryCardProps) {
  const formattedPath = recommendedPath?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="telemetry" className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="text-left">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-500 mb-1">
                Skill Gap Radar
              </p>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                Architect&apos;s Telemetry
              </h2>
            </div>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-cyan-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
              {formattedPath}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-8 pb-6">
          {/* 7-Domain Mini Bars */}
          <div className="space-y-3 mb-6">
            {skillDomains.map(({ key, label }) => {
              const score = skillScores?.[key] ?? 0
              const pct = Math.round(score * 100)
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-40 flex-shrink-0 truncate">{label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        pct >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                        pct >= 50 ? 'bg-gradient-to-r from-purple-500 to-cyan-400' :
                        'bg-gradient-to-r from-amber-500 to-orange-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-10 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <Link href="/diagnosis/results">
              <Button className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-semibold">
                View Full Report
              </Button>
            </Link>
            <Link href="/curriculum/week-1">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                Continue Curriculum
              </Button>
            </Link>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
