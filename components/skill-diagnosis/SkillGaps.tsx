'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { SkillGap } from '@/lib/skill-scoring'

interface SkillGapsProps {
  gaps: SkillGap[]
}

const priorityInfo = {
  high: {
    label: 'High Priority',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: AlertTriangle,
    iconColor: 'text-red-600'
  },
  medium: {
    label: 'Medium Priority',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: TrendingUp,
    iconColor: 'text-amber-600'
  },
  low: {
    label: 'Low Priority',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: CheckCircle2,
    iconColor: 'text-blue-600'
  }
}

export function SkillGaps({ gaps }: SkillGapsProps) {
  if (gaps.length === 0) {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="skill-gaps" className="border rounded-lg bg-[#f8f9fa] dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-900/70 rounded-t-lg transition-colors">
            <span className="text-base font-semibold">Skill Gap Analysis</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4">
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">All Domains at Target Level!</h3>
              <p className="text-sm text-muted-foreground">
                You've achieved 80%+ proficiency across all domains
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="skill-gaps" className="border rounded-lg bg-[#f8f9fa] dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-900/70 rounded-t-lg transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold">Skill Gap Analysis</span>
            <Badge variant="secondary" className="text-xs">
              {gaps.length} {gaps.length === 1 ? 'gap' : 'gaps'}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-4">
          <p className="text-sm text-muted-foreground mb-4 mt-2">
            Recommendations to reach Technical Lead level (80% across all domains)
          </p>

          <div className="space-y-4">
            {gaps.map((gap) => {
              const info = priorityInfo[gap.priority]
              const Icon = info.icon

              return (
                <div
                  key={gap.domainSlug}
                  className="border rounded-lg p-4 bg-white dark:bg-slate-900 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-4 w-4 ${info.iconColor}`} />
                        <h4 className="font-semibold">{gap.domainName}</h4>
                        <Badge variant="outline" className={info.color}>
                          {info.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Current: {gap.currentLevel.toFixed(1)}%
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          Target: {gap.targetLevel}%
                        </span>
                        <span className="text-muted-foreground">
                          Gap: {gap.gap.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {gap.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Recommended Activities:
                      </p>
                      <ul className="space-y-1.5">
                        {gap.recommendations.map((rec, index) => (
                          <li
                            key={index}
                            className="text-sm flex items-start gap-2 pl-4"
                          >
                            <span className="text-muted-foreground mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
