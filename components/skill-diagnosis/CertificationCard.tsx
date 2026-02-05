'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Share2, Award, CheckCircle2, XCircle } from 'lucide-react'
import { CertificationStatus } from '@/lib/skill-scoring'

interface CertificationCardProps {
  certificationStatus: CertificationStatus
}

const levelInfo = {
  none: {
    label: 'Not Certified',
    color: 'bg-slate-100 text-slate-700',
    icon: XCircle,
    description: 'Continue building your skills'
  },
  junior: {
    label: 'Junior AI Engineer',
    color: 'bg-blue-100 text-blue-700',
    icon: Award,
    description: 'Foundation established'
  },
  mid: {
    label: 'Mid-Level AI Engineer',
    color: 'bg-emerald-100 text-emerald-700',
    icon: Award,
    description: 'Solid competency demonstrated'
  },
  lead: {
    label: 'Technical Lead',
    color: 'bg-violet-100 text-violet-700',
    icon: Award,
    description: 'Lead-level proficiency achieved'
  },
  architect: {
    label: 'AI Architect',
    color: 'bg-amber-100 text-amber-700',
    icon: Award,
    description: 'Distinguished architectural authority'
  }
}

export function CertificationCard({ certificationStatus }: CertificationCardProps) {
  const info = levelInfo[certificationStatus.level]
  const Icon = info.icon

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">AI Architect Certification Status</h3>
            <Badge className={`${info.color} border`}>
              <Icon className="h-3 w-3 mr-1" />
              {info.label}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">
              {certificationStatus.overallProficiency.toFixed(0)}
              <span className="text-lg text-muted-foreground">/100</span>
            </p>
            <p className="text-sm text-muted-foreground">Overall Proficiency</p>
          </div>
        </div>

        {/* Current Level Description */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">{info.description}</p>
          <p className="text-sm text-muted-foreground">
            {certificationStatus.verificationSummary}
          </p>
        </div>

        {/* Requirements */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Certification Requirements</h4>

          <div className="space-y-2">
            <RequirementItem
              label="All domains above 70%"
              met={certificationStatus.requirementsMet.allDomainsAbove70}
            />
            <RequirementItem
              label="Four domains above 85%"
              met={certificationStatus.requirementsMet.fourDomainsAbove85}
            />
            <RequirementItem
              label="Overall proficiency above 80%"
              met={certificationStatus.requirementsMet.overallAbove80}
            />
          </div>
        </div>

        {/* Actions */}
        {certificationStatus.isEligible && (
          <div className="flex gap-3 pt-4 border-t">
            <Button className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Technical Brief PDF
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        )}

        {!certificationStatus.isEligible && certificationStatus.level !== 'none' && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Complete more activities to unlock certification
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

function RequirementItem({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
      )}
      <span className={met ? 'text-foreground' : 'text-muted-foreground'}>
        {label}
      </span>
    </div>
  )
}
