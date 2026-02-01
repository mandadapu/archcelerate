'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, Code } from 'lucide-react'
import { submitLabExercise } from './actions'

interface Props {
  labId: string
  exerciseNumber: number
  initialSubmission?: { text?: string; code?: string }
  isCompleted: boolean
}

export function LabExerciseClient({
  labId,
  exerciseNumber,
  initialSubmission,
  isCompleted
}: Props) {
  const [submission, setSubmission] = useState(
    initialSubmission?.text || initialSubmission?.code || ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  async function handleSubmit() {
    setIsSubmitting(true)
    setShowSuccess(false)

    try {
      await submitLabExercise(labId, exerciseNumber, submission)
      setShowSuccess(true)

      // Reload page to update completion status
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Your Implementation / Answer
        </label>
        <Textarea
          value={submission}
          onChange={(e) => setSubmission(e.target.value)}
          placeholder="Paste your code implementation, GitHub link, or describe your solution..."
          className="min-h-[150px] font-mono text-sm"
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground mt-1">
          You can paste code, provide a GitHub link to your implementation, or describe your approach
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!submission.trim() || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : isCompleted ? 'Update Submission' : 'Submit Exercise'}
        </Button>

        {showSuccess && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Saved successfully!</span>
          </div>
        )}

        {isCompleted && !showSuccess && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </div>

      {/* Helpful resources */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Code className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Reference Implementation
            </p>
            <p className="text-blue-800 dark:text-blue-200">
              You can review the governance code we built earlier in this week:
            </p>
            <ul className="mt-2 space-y-1 text-blue-700 dark:text-blue-300 list-disc list-inside">
              <li>lib/governance/input-validator.ts</li>
              <li>lib/governance/content-moderator.ts</li>
              <li>lib/governance/logger.ts</li>
              <li>lib/governance/rate-limiter.ts</li>
              <li>lib/governance/cost-tracker.ts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
