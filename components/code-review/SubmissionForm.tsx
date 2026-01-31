'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface SubmissionFormProps {
  projectNumber: number
  projectTitle: string
}

export function SubmissionForm({
  projectNumber,
  projectTitle,
}: SubmissionFormProps) {
  const router = useRouter()
  const [repoUrl, setRepoUrl] = useState('')
  const [deployedUrl, setDeployedUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repositoryUrl: repoUrl,
          deployedUrl: deployedUrl || undefined,
          projectNumber,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Submission failed')
      }

      const { feedbackId } = await response.json()

      toast.success('Code review complete!')
      router.push(`/project/${projectNumber}/review/${feedbackId}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Project</CardTitle>
        <CardDescription>
          Submit your GitHub repository for AI-powered code review
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo">GitHub Repository URL *</Label>
            <Input
              id="repo"
              type="url"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
            />
            <p className="text-xs text-slate-500">
              Make sure your repository is public
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deployed">Deployed URL (optional)</Label>
            <Input
              id="deployed"
              type="url"
              placeholder="https://yourapp.vercel.app"
              value={deployedUrl}
              onChange={(e) => setDeployedUrl(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              Link to your deployed application
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
              <li>We&apos;ll fetch your code from GitHub (up to 20 files)</li>
              <li>AI will analyze your code against the project rubric</li>
              <li>You&apos;ll receive detailed feedback in 30-60 seconds</li>
              <li>You can submit revisions (max 3 per day)</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !repoUrl}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Reviewing your code...' : 'Submit for Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
