import { Progress } from '@/components/ui/progress'

interface QuizProgressProps {
  current: number
  total: number
  answered: number
}

export function QuizProgress({ current, total, answered }: QuizProgressProps) {
  const percentComplete = (current / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-slate-600">
        <span>Question {current} of {total}</span>
        <span>{answered} answered</span>
      </div>
      <Progress value={percentComplete} />
    </div>
  )
}
