'use client'

import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface WeekHeaderProps {
  title: string
  description: string
}

export function WeekHeader({ title, description }: WeekHeaderProps) {
  return (
    <div>
      <div className="text-sm text-muted-foreground mb-2">Week 7</div>
      <div className="flex items-center gap-2">
        <h1 className="text-4xl font-bold">{title}</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-amber-600 hover:text-amber-700 transition-colors">
                <Info className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="max-w-md p-4 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 shadow-lg"
              sideOffset={8}
            >
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    Phase 1: Visibility (Concept 1) - Observability
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    Can you see what's happening? Master OpenTelemetry tracing, automated evaluations, and cost-per-token monitoring for complete system visibility.
                  </p>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                    Where production systems start: Full observability
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    Phase 2: Protection (Concept 2) - Guardrails
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    Can you prevent failures? Deploy input/output validation to block prompt injection, jailbreaks, and hallucinations with minimal latency overhead.
                  </p>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                    Where systems become unbreakable: Defense in depth
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    Phase 3: Assurance (Concept 3) - Automated Evaluation
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    Can you prove quality? Implement LLM-as-a-Judge patterns for continuous validation, measuring faithfulness, relevance, and safety at scale.
                  </p>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                    Where trust is earned: Continuous quality assurance
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-lg text-muted-foreground mt-2">
        {description}
      </p>
    </div>
  )
}
