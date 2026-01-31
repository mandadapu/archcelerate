import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LearningPath } from '@/types/diagnosis'

interface LearningPathCardProps {
  path: LearningPath
  summary: string
}

export function LearningPathCard({ path, summary }: LearningPathCardProps) {
  const pathConfig = {
    'foundation-first': {
      title: 'Foundation First',
      description: 'Start with the basics and build a strong foundation',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '📚',
    },
    'standard': {
      title: 'Standard Track',
      description: 'Balanced pace covering all essential concepts',
      color: 'bg-blue-100 text-blue-800',
      icon: '🎯',
    },
    'fast-track': {
      title: 'Fast Track',
      description: 'Accelerated path, skip basics and dive deeper',
      color: 'bg-green-100 text-green-800',
      icon: '🚀',
    },
  }

  const config = pathConfig[path]

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <CardTitle>Your Recommended Path</CardTitle>
            <CardDescription>{config.title}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`${config.color} p-4 rounded-lg mb-4`}>
          <p className="font-medium">{config.description}</p>
        </div>
        <p className="text-slate-600">{summary}</p>
      </CardContent>
    </Card>
  )
}
