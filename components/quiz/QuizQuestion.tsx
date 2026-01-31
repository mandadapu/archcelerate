'use client'

import { QuizQuestion as QuizQuestionType } from '@/types/diagnosis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface QuizQuestionProps {
  question: QuizQuestionType
  selectedOptions: string[]
  onAnswerChange: (options: string[]) => void
}

export function QuizQuestion({
  question,
  selectedOptions,
  onAnswerChange
}: QuizQuestionProps) {
  const handleSingleChoice = (value: string) => {
    onAnswerChange([value])
  }

  const handleMultipleChoice = (optionId: string, checked: boolean) => {
    if (checked) {
      onAnswerChange([...selectedOptions, optionId])
    } else {
      onAnswerChange(selectedOptions.filter(id => id !== optionId))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-medium">
            {question.question}
          </CardTitle>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
            {question.type === 'multiple-choice' ? 'Select all that apply' : 'Select one'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {question.code && (
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4 text-sm overflow-x-auto">
            <code>{question.code}</code>
          </pre>
        )}

        {question.type === 'single-choice' || question.type === 'code-evaluation' ? (
          <RadioGroup
            value={selectedOptions[0] || ''}
            onValueChange={handleSingleChoice}
          >
            <div className="space-y-3">
              {question.options.map((option) => (
                <div key={option.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label
                    htmlFor={option.id}
                    className="font-normal cursor-pointer leading-relaxed"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-start space-x-3">
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) =>
                    handleMultipleChoice(option.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={option.id}
                  className="font-normal cursor-pointer leading-relaxed"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
