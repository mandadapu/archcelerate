'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { SkillRadarChart } from '@/components/skill-diagnosis/SkillRadarChart'
import { DomainBreakdown } from '@/components/skill-diagnosis/DomainBreakdown'
import { CertificationCard } from '@/components/skill-diagnosis/CertificationCard'
import { SkillGaps } from '@/components/skill-diagnosis/SkillGaps'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, FileText } from 'lucide-react'
import type { OverallScore, CertificationStatus, SkillGap } from '@/lib/skill-scoring'

interface RadarChartDataPoint {
  domain: string
  score: number
  fullMark: number
}

interface SkillDiagnosisData extends OverallScore {
  radarChartData: RadarChartDataPoint[]
}

export default function VerificationReportPage() {
  const [skillData, setSkillData] = useState<SkillDiagnosisData | null>(null)
  const [certificationData, setCertificationData] = useState<CertificationStatus | null>(null)
  const [gapsData, setGapsData] = useState<SkillGap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const [skillResponse, certResponse, gapsResponse] = await Promise.all([
          fetch('/api/skill-diagnosis'),
          fetch('/api/skill-diagnosis/certification'),
          fetch('/api/skill-diagnosis/gaps')
        ])

        if (!skillResponse.ok || !certResponse.ok || !gapsResponse.ok) {
          throw new Error('Failed to fetch verification data')
        }

        const [skillResult, certResult, gapsResult] = await Promise.all([
          skillResponse.json(),
          certResponse.json(),
          gapsResponse.json()
        ])

        setSkillData(skillResult.data)
        setCertificationData(certResult.data)
        setGapsData(gapsResult.data)
      } catch (err) {
        console.error('Error fetching verification data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
        </div>
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[300px]" />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!skillData || !certificationData) {
    return (
      <div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No verification data available. Complete activities to generate your report.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Report Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 p-8 text-white">
        <div className="flex items-start gap-4">
          <FileText className="h-10 w-10 flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Verification Report</h1>
            <p className="text-lg text-white/90">7-Axis Mastery Metrics</p>
            <p className="text-sm text-white/70">
              Report Date: {reportDate}
            </p>
          </div>
        </div>
      </div>

      {/* Radar Chart + Certification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillRadarChart
          data={skillData.radarChartData}
          proficiencyLevel={skillData.proficiencyLevel}
        />
        <CertificationCard certificationStatus={certificationData} />
      </div>

      {/* Skill Gaps */}
      {gapsData.length > 0 && <SkillGaps gaps={gapsData} />}

      {/* Domain Breakdown */}
      <DomainBreakdown domains={skillData.domains} />

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Activities Completed</p>
          <p className="text-2xl font-bold">
            {skillData.completedActivities} / {skillData.totalActivities}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Overall Proficiency</p>
          <p className="text-2xl font-bold">
            {skillData.overallProficiency.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Domains Mastered (80%+)</p>
          <p className="text-2xl font-bold">
            {skillData.domains.filter((d) => d.percentage >= 80).length} / 7
          </p>
        </div>
      </div>

      {/* Verification Statement */}
      <div className="rounded-lg border bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {certificationData.verificationSummary}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Archcelerate AI Architect Accelerator
        </p>
      </div>
    </div>
  )
}
