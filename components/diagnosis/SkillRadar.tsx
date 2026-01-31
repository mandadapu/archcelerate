'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { SkillScores } from '@/types/diagnosis'

interface SkillRadarProps {
  scores: SkillScores
}

export function SkillRadar({ scores }: SkillRadarProps) {
  const data = [
    { skill: 'LLM Basics', value: scores.llm_fundamentals * 100 },
    { skill: 'Prompting', value: scores.prompt_engineering * 100 },
    { skill: 'RAG', value: scores.rag * 100 },
    { skill: 'Agents', value: scores.agents * 100 },
    { skill: 'Multimodal', value: scores.multimodal * 100 },
    { skill: 'Production', value: scores.production_ai * 100 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis domain={[0, 100]} />
        <Radar
          name="Skills"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
