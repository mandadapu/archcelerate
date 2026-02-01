'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'
import { recommendPath } from '@/lib/onboarding/personalization'

const paths = [
  {
    id: 'full',
    name: 'Full Curriculum',
    description: 'Complete 8-module journey from fundamentals to production',
    duration: '12 weeks',
    modules: 8,
    recommended: false,
  },
  {
    id: 'rapid',
    name: 'Rapid Builder',
    description: 'Fast-track to building AI applications (skips theory)',
    duration: '6 weeks',
    modules: 5,
    recommended: false,
  },
  {
    id: 'rag-specialist',
    name: 'RAG Specialist',
    description: 'Deep dive into RAG systems and document processing',
    duration: '4 weeks',
    modules: 3,
    recommended: false,
  },
  {
    id: 'agent',
    name: 'Agent Developer',
    description: 'Focus on building autonomous AI agents',
    duration: '4 weeks',
    modules: 3,
    recommended: false,
  },
]

interface LearningPathSelectorProps {
  answers: Record<string, string>
  selectedPath: string
  onPathChange: (path: string) => void
}

export function LearningPathSelector({
  answers,
  selectedPath,
  onPathChange,
}: LearningPathSelectorProps) {
  // Auto-recommend path based on assessment answers
  useEffect(() => {
    if (answers.experience && answers.ai_exposure && answers.goal) {
      const recommended = recommendPath({
        experience: answers.experience as any,
        ai_exposure: answers.ai_exposure as any,
        goal: answers.goal as any,
      })
      onPathChange(recommended.id)
    }
  }, [answers, onPathChange])

  // Mark the selected path as recommended
  const pathsWithRecommendation = paths.map((path) => ({
    ...path,
    recommended: path.id === selectedPath,
  }))

  return (
    <div className="space-y-4">
      {pathsWithRecommendation.map((path) => (
        <Card
          key={path.id}
          className={`cursor-pointer transition-all ${
            selectedPath === path.id
              ? 'border-purple-600 border-2 shadow-md'
              : 'hover:border-slate-400'
          }`}
          onClick={() => onPathChange(path.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {path.name}
                  {path.recommended && (
                    <Badge variant="secondary">Recommended</Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {path.description}
                </CardDescription>
              </div>
              {selectedPath === path.id && (
                <CheckCircle2 className="h-6 w-6 text-purple-600 flex-shrink-0" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm text-slate-600">
              <span>⏱️ {path.duration}</span>
              <span>📚 {path.modules} modules</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
