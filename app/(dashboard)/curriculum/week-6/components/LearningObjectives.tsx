'use client'

import { CheckCircle2 } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface LearningObjectivesProps {
  objectives: string[]
}

export function LearningObjectives({ objectives }: LearningObjectivesProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="objectives" className="border rounded-lg bg-[#f8f9fa] dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-900/70 rounded-t-lg transition-colors">
          <span className="text-base font-semibold">Technical Milestones</span>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-4">
          <ul className="space-y-3 mt-2">
            {objectives.map((objective, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm leading-relaxed">{objective}</span>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
