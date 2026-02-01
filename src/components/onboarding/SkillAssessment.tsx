'use client'

import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const questions = [
  {
    id: 'experience',
    question: 'What is your programming experience?',
    options: [
      { value: 'beginner', label: 'Beginner (< 1 year)' },
      { value: 'intermediate', label: 'Intermediate (1-3 years)' },
      { value: 'advanced', label: 'Advanced (3+ years)' },
    ],
  },
  {
    id: 'ai_exposure',
    question: 'Have you worked with AI/LLMs before?',
    options: [
      { value: 'none', label: 'No experience' },
      { value: 'some', label: 'Played with ChatGPT/Claude' },
      { value: 'api', label: 'Used AI APIs in projects' },
      { value: 'production', label: 'Built production AI apps' },
    ],
  },
  {
    id: 'goal',
    question: 'What is your primary goal?',
    options: [
      { value: 'learn', label: 'Learn AI engineering fundamentals' },
      { value: 'build', label: 'Build specific AI applications' },
      { value: 'career', label: 'Career transition to AI engineering' },
      { value: 'business', label: 'Integrate AI into my business' },
    ],
  },
]

interface SkillAssessmentProps {
  answers: Record<string, string>
  onAnswersChange: (answers: Record<string, string>) => void
}

export function SkillAssessment({ answers, onAnswersChange }: SkillAssessmentProps) {
  const handleAnswerChange = (questionId: string, value: string) => {
    onAnswersChange({ ...answers, [questionId]: value })
  }

  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <Card key={question.id} className="p-4">
          <h3 className="font-medium mb-3">{question.question}</h3>
          <RadioGroup
            value={answers[question.id]}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <div className="space-y-2">
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                  <Label htmlFor={`${question.id}-${option.value}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </Card>
      ))}
    </div>
  )
}
