'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { SkillScores } from '@/types/diagnosis'

interface SkillRadarProps {
  scores: SkillScores
  variant?: 'foundational' | 'architectural'
}

export function SkillRadar({ scores, variant = 'foundational' }: SkillRadarProps) {
  const foundationalData = [
    { skill: 'LLM Basics', value: (scores.llm_fundamentals || 0) * 100 },
    { skill: 'Prompting', value: (scores.prompt_engineering || 0) * 100 },
    { skill: 'RAG', value: (scores.rag || 0) * 100 },
    { skill: 'Agents', value: (scores.agents || 0) * 100 },
    { skill: 'Multimodal', value: (scores.multimodal || 0) * 100 },
    { skill: 'Production', value: (scores.production_ai || 0) * 100 },
  ]

  const architecturalData = [
    { skill: 'Systematic\nPrompting', value: (scores.systematic_prompting || 0) * 100 },
    { skill: 'Sovereign\nGovernance', value: (scores.sovereign_governance || 0) * 100 },
    { skill: 'Knowledge\nArchitecture', value: (scores.knowledge_architecture || 0) * 100 },
    { skill: 'Agentic\nSystems', value: (scores.agentic_systems || 0) * 100 },
    { skill: 'Context\nEngineering', value: (scores.context_engineering || 0) * 100 },
    { skill: 'Production\nSystems', value: (scores.production_systems || 0) * 100 },
    { skill: 'Model\nSelection', value: (scores.model_selection || 0) * 100 },
  ]

  const data = variant === 'architectural' ? architecturalData : foundationalData
  const color = variant === 'architectural' ? '#9333ea' : '#3b82f6'

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} />
        <Radar
          name="Skills"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
