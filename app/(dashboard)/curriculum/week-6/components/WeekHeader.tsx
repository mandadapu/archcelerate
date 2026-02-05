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
      <div className="text-sm text-muted-foreground mb-2">Week 6</div>
      <div className="flex items-center gap-2">
        <h1 className="text-4xl font-bold">{title}</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-teal-600 hover:text-teal-700 transition-colors">
                <Info className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="max-w-md p-4 bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 shadow-lg"
              sideOffset={8}
            >
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold text-teal-700 dark:text-teal-400 mb-1">
                    Phase 1: The Core (Concepts 1-3) - Precision
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    Reducing hallucinations through architectural decisions. Master hybrid search, query transformation, and context engineering to find the right information.
                  </p>
                  <div className="text-xs text-teal-600 dark:text-teal-400 mt-1 italic">
                    Where developers learn: How to architect retrieval systems
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-teal-700 dark:text-teal-400 mb-1">
                    Phase 2: The Governance (Concepts 4-6) - Reliability
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    Building production-grade systems with enterprise requirements. This is where most developers fail, but where architects excel.
                  </p>
                  <div className="text-xs text-teal-600 dark:text-teal-400 mt-1 italic">
                    Where architects excel: Evaluation, security, and monitoring
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-teal-700 dark:text-teal-400 mb-1">
                    Phase 3: The Scale (Concepts 7-8) - Commercial Viability
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    Making systems economically viable at scale. Low cost, low latency, and production deployment ensure commercial success.
                  </p>
                  <div className="text-xs text-teal-600 dark:text-teal-400 mt-1 italic">
                    Where businesses succeed: Performance optimization and infrastructure
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
