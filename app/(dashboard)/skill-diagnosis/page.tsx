'use client'

import React, { useEffect, useState } from 'react'
import { SkillRadarChart } from '@/components/skill-diagnosis/SkillRadarChart'
import { DomainBreakdown } from '@/components/skill-diagnosis/DomainBreakdown'
import { CertificationCard } from '@/components/skill-diagnosis/CertificationCard'
import { SkillGaps } from '@/components/skill-diagnosis/SkillGaps'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { OverallScore, CertificationStatus, SkillGap } from '@/lib/skill-scoring'

interface RadarChartDataPoint {
  domain: string
  score: number
  fullMark: number
}

interface SkillDiagnosisData extends OverallScore {
  radarChartData: RadarChartDataPoint[]
}

export default function SkillDiagnosisPage() {
  const [skillData, setSkillData] = useState<SkillDiagnosisData | null>(null)
  const [certificationData, setCertificationData] = useState<CertificationStatus | null>(null)
  const [gapsData, setGapsData] = useState<SkillGap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSkillDiagnosis() {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [skillResponse, certResponse, gapsResponse] = await Promise.all([
          fetch('/api/skill-diagnosis'),
          fetch('/api/skill-diagnosis/certification'),
          fetch('/api/skill-diagnosis/gaps')
        ])

        if (!skillResponse.ok || !certResponse.ok || !gapsResponse.ok) {
          throw new Error('Failed to fetch skill diagnosis data')
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
        console.error('Error fetching skill diagnosis:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSkillDiagnosis()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[500px]" />
            <Skeleton className="h-[500px]" />
          </div>

          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!skillData || !certificationData) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No skill diagnosis data available</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Architectural Skill Diagnosis</h1>
          <p className="text-muted-foreground">
            Real-time telemetry of your proficiency across the 7 core domains of AI Product
            Leadership.
          </p>
        </div>

        {/* Top Row: Radar Chart + Certification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkillRadarChart
            data={skillData.radarChartData}
            proficiencyLevel={skillData.proficiencyLevel}
          />

          <CertificationCard certificationStatus={certificationData} />
        </div>

        {/* Skill Gaps */}
        <SkillGaps gaps={gapsData} />

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
              {skillData.domains.filter((d) => d.percentage >= 80).length} / {skillData.domains.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
