'use client'

import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { Card } from '@/components/ui/card'

interface RadarChartDataPoint {
  domain: string
  score: number
  fullMark: number
}

interface SkillRadarChartProps {
  data: RadarChartDataPoint[]
  proficiencyLevel?: 'junior' | 'mid' | 'lead' | 'architect'
}

const proficiencyColors = {
  junior: '#94a3b8', // slate-400
  mid: '#60a5fa', // blue-400
  lead: '#34d399', // emerald-400
  architect: '#a78bfa' // violet-400
}

export function SkillRadarChart({ data, proficiencyLevel = 'mid' }: SkillRadarChartProps) {
  const fillColor = proficiencyColors[proficiencyLevel]

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Skill Proficiency Radar</h3>
          <p className="text-sm text-muted-foreground">
            7 Core Domains of AI Architecture
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <PolarAngleAxis
              dataKey="domain"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
            />

            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
            />

            <Radar
              name="Proficiency"
              dataKey="score"
              stroke={fillColor}
              fill={fillColor}
              fillOpacity={0.3}
              strokeWidth={2}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: fillColor }}
            />
            <span className="text-muted-foreground capitalize">
              {proficiencyLevel} Level
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
