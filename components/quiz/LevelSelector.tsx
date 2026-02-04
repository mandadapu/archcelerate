import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DifficultyLevel } from '@/types/diagnosis'

interface LevelSelectorProps {
  onLevelSelect: (level: DifficultyLevel) => void
  onQuickStart: () => void
}

interface LevelCardProps {
  level: DifficultyLevel
  icon: string
  title: string
  description: string
  features: string[]
  onSelect: () => void
  recommended?: boolean
}

function LevelCard({
  level,
  icon,
  title,
  description,
  features,
  onSelect,
  recommended = false,
}: LevelCardProps) {
  const colorClasses = {
    beginner: 'border-green-200 hover:border-green-400 hover:bg-green-50',
    intermediate: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    advanced: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50',
  }

  return (
    <Card
      className={`relative cursor-pointer transition-all ${colorClasses[level]} ${
        recommended ? 'ring-2 ring-blue-400 shadow-lg' : ''
      }`}
      onClick={onSelect}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white">Recommended</Badge>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center space-x-3">
          <span className="text-4xl">{icon}</span>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm text-slate-600">
              <span className="mr-2">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full" variant={recommended ? 'default' : 'outline'}>
          Start {title} Quiz
        </Button>
      </CardContent>
    </Card>
  )
}

export function LevelSelector({ onLevelSelect, onQuickStart }: LevelSelectorProps) {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Quick Start CTA */}
      <Card className="border-primary bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">⚡</span>
            <div>
              <CardTitle className="text-2xl">Quick Start</CardTitle>
              <CardDescription className="text-base">
                Not sure where to start? We recommend the Intermediate level for most learners.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Skip the selection and jump right into a balanced assessment that covers practical AI skills.
            Takes about 15 minutes.
          </p>
          <Button size="lg" className="w-full sm:w-auto" onClick={onQuickStart}>
            Start Intermediate Quiz (Recommended)
          </Button>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-500">Or choose your difficulty level</span>
        </div>
      </div>

      {/* Manual Level Selection */}
      <div className="grid md:grid-cols-3 gap-6">
        <LevelCard
          level="beginner"
          icon="🌱"
          title="Beginner"
          description="New to AI and LLMs"
          features={[
            'Basic concepts and terminology',
            'Fundamental use cases',
            'Getting started with APIs',
            'Perfect if you\'re just starting out',
          ]}
          onSelect={() => onLevelSelect('beginner')}
        />

        <LevelCard
          level="intermediate"
          icon="🚀"
          title="Intermediate"
          description="Built prototypes or explored AI tools"
          features={[
            'Best practices and patterns',
            'Practical implementation scenarios',
            'API integration strategies',
            'Ideal for most developers',
          ]}
          onSelect={() => onLevelSelect('intermediate')}
          recommended
        />

        <LevelCard
          level="advanced"
          icon="⚡"
          title="Advanced"
          description="Production AI experience"
          features={[
            'Architecture and scaling',
            'Performance optimization',
            'Complex production challenges',
            'For experienced practitioners',
          ]}
          onSelect={() => onLevelSelect('advanced')}
        />
      </div>

      {/* Help text */}
      <div className="text-center text-sm text-slate-500">
        <p>
          Don't worry - you can retake the quiz at different levels anytime. Choose the level that best
          matches your current experience.
        </p>
      </div>
    </div>
  )
}
