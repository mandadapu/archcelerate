import { Button } from '@/components/ui/button'

interface QuizNavigationProps {
  canGoPrevious: boolean
  canGoNext: boolean
  isLastQuestion: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  isAnswered: boolean
}

export function QuizNavigation({
  canGoPrevious,
  canGoNext,
  isLastQuestion,
  onPrevious,
  onNext,
  onSubmit,
  isAnswered,
}: QuizNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoPrevious}
      >
        Previous
      </Button>

      {isLastQuestion ? (
        <Button
          onClick={onSubmit}
          disabled={!isAnswered}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Submit Quiz
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canGoNext || !isAnswered}
        >
          Next
        </Button>
      )}
    </div>
  )
}
