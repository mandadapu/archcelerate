'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sparkles, Target, Rocket, CheckCircle } from 'lucide-react'
import { SkillAssessment } from './SkillAssessment'
import { LearningPathSelector } from './LearningPathSelector'
import { useRouter } from 'next/navigation'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AI Architect Accelerator',
    description: 'Your journey to becoming an AI engineer starts here',
    icon: <Sparkles className="h-8 w-8 text-purple-600" />,
  },
  {
    id: 'assessment',
    title: 'Quick Skill Assessment',
    description: "Let's understand your current knowledge level",
    icon: <Target className="h-8 w-8 text-blue-600" />,
  },
  {
    id: 'path',
    title: 'Choose Your Learning Path',
    description: 'Personalized curriculum based on your goals',
    icon: <Rocket className="h-8 w-8 text-green-600" />,
  },
  {
    id: 'ready',
    title: "You're All Set!",
    description: 'Ready to start your first module',
    icon: <CheckCircle className="h-8 w-8 text-emerald-600" />,
  },
]

export function WelcomeFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedPath, setSelectedPath] = useState<string>('full')

  const progress = ((currentStep + 1) / steps.length) * 100

  const nextStep = async () => {
    if (currentStep === steps.length - 2) {
      // Save onboarding data before final step
      try {
        await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, selectedPath }),
        })
      } catch (error) {
        console.error('Failed to save onboarding:', error)
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Navigate to dashboard after completion
      router.push('/dashboard')
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = steps[currentStep]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {step.icon}
          </div>
          <CardTitle className="text-center text-2xl">{step.title}</CardTitle>
          <CardDescription className="text-center text-base">
            {step.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Progress value={progress} className="h-2" />

          <div className="min-h-[300px]">
            {step.id === 'welcome' && <WelcomeContent />}
            {step.id === 'assessment' && (
              <SkillAssessment answers={answers} onAnswersChange={setAnswers} />
            )}
            {step.id === 'path' && (
              <LearningPathSelector
                answers={answers}
                selectedPath={selectedPath}
                onPathChange={setSelectedPath}
              />
            )}
            {step.id === 'ready' && <ReadyContent selectedPath={selectedPath} />}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-2 rounded-full ${
                    idx === currentStep ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <Button onClick={nextStep}>
              {currentStep === steps.length - 1 ? 'Start Learning' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WelcomeContent() {
  return (
    <div className="space-y-4 text-center">
      <p className="text-lg">
        Transform from developer to AI engineer in 12 weeks
      </p>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">8</div>
          <div className="text-sm text-slate-600 mt-1">Learning Modules</div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">40+</div>
          <div className="text-sm text-slate-600 mt-1">Hands-on Projects</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">12</div>
          <div className="text-sm text-slate-600 mt-1">Weeks to Complete</div>
        </div>
      </div>
    </div>
  )
}

function ReadyContent({ selectedPath }: { selectedPath: string }) {
  const pathInfo: Record<string, { title: string; duration: string; lessons: number }> = {
    full: { title: 'Full Curriculum', duration: '12 weeks', lessons: 40 },
    rapid: { title: 'Rapid Builder', duration: '6 weeks', lessons: 25 },
    'rag-specialist': { title: 'RAG Specialist', duration: '4 weeks', lessons: 15 },
    agent: { title: 'Agent Developer', duration: '4 weeks', lessons: 15 },
  }

  const info = pathInfo[selectedPath] || pathInfo.full

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg">Your personalized learning path is ready!</p>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
        <p className="text-slate-600">Module 1: AI Engineering Foundations</p>
        <p className="text-sm text-slate-500 mt-1">
          Estimated: {info.duration} • {info.lessons} lessons
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
        <p className="font-medium text-blue-900 mb-2">What's Next:</p>
        <ul className="space-y-1 text-blue-800">
          <li>✓ Complete your first lesson</li>
          <li>✓ Build your first AI application</li>
          <li>✓ Join the community forum</li>
          <li>✓ Track your progress on the dashboard</li>
        </ul>
      </div>
    </div>
  )
}
