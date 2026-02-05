'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Clock } from 'lucide-react'
import { DomainScore } from '@/lib/skill-scoring'

interface DomainBreakdownProps {
  domains: DomainScore[]
}

const proficiencyInfo = {
  junior: {
    label: 'Junior',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Building foundational skills'
  },
  mid: {
    label: 'Mid-Level',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    description: 'Solid competency'
  },
  lead: {
    label: 'Technical Lead',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    description: 'Lead-level proficiency'
  },
  architect: {
    label: 'AI Architect',
    color: 'bg-violet-100 text-violet-700 border-violet-300',
    description: 'Distinguished authority'
  }
}

export function DomainBreakdown({ domains }: DomainBreakdownProps) {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)

  const toggleDomain = (domainId: string) => {
    setExpandedDomain(expandedDomain === domainId ? null : domainId)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Domain Breakdown</h3>
        <p className="text-sm text-muted-foreground">
          Click on each domain to see detailed activity scores
        </p>
      </div>

      <div className="space-y-3">
        {domains.map((domain) => {
          const isExpanded = expandedDomain === domain.domainId
          const profInfo = proficiencyInfo[domain.proficiencyLevel]

          return (
            <Card key={domain.domainId} className="overflow-hidden">
              {/* Domain Header */}
              <button
                onClick={() => toggleDomain(domain.domainId)}
                className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{domain.domainName}</h4>
                      <Badge variant="outline" className={profInfo.color}>
                        {profInfo.label}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {domain.totalPoints.toFixed(1)} / {domain.maxPoints} points
                        </span>
                        <span className="font-medium">
                          {domain.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={domain.percentage} className="h-2" />
                    </div>
                  </div>

                  <div className="text-muted-foreground">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Activity List */}
              {isExpanded && (
                <div className="border-t px-4 py-3 bg-muted/20">
                  <h5 className="font-medium text-sm mb-3">Activity Contributions</h5>
                  <div className="space-y-2">
                    {domain.activities.map((activity) => {
                      const isCompleted = activity.scorePercentage >= 70
                      const isInProgress = activity.scorePercentage > 0 && activity.scorePercentage < 70

                      return (
                        <div
                          key={activity.activityId}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-background transition-colors"
                        >
                          <div className="mt-0.5">
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : isInProgress ? (
                              <Clock className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                Week {activity.weekNumber}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {activity.activityType === 'lab' ? 'Lab' : 'Project'}
                              </Badge>
                            </div>

                            <p className="text-sm font-medium truncate">
                              {activity.activityTitle}
                            </p>

                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>
                                {activity.earnedPoints.toFixed(1)} / {activity.maxPoints} pts
                              </span>
                              {activity.scorePercentage > 0 && (
                                <span className="font-medium">
                                  {activity.scorePercentage.toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {domain.activities.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No activities recorded yet
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
