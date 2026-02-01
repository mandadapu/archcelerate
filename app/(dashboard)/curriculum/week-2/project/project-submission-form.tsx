'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Github, ExternalLink, FileText } from 'lucide-react'
import { submitProject } from './actions'

interface Props {
  projectId: string
  weekId: string
  initialData: {
    githubUrl: string
    deployedUrl: string
    writeupContent: string
  }
  isSubmitted: boolean
}

export function ProjectSubmissionForm({
  projectId,
  weekId,
  initialData,
  isSubmitted
}: Props) {
  const [githubUrl, setGithubUrl] = useState(initialData.githubUrl)
  const [deployedUrl, setDeployedUrl] = useState(initialData.deployedUrl)
  const [writeupContent, setWriteupContent] = useState(initialData.writeupContent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  async function handleSubmit(action: 'draft' | 'submit') {
    setIsSubmitting(true)
    setShowSuccess(false)

    try {
      await submitProject({
        projectId,
        weekId,
        githubUrl,
        deployedUrl,
        writeupContent,
        action
      })

      setShowSuccess(true)

      // Reload page to update status
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
    <div className="space-y-6">
      {/* GitHub URL */}
      <div className="space-y-2">
        <Label htmlFor="githubUrl" className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          GitHub Repository *
        </Label>
        <Input
          id="githubUrl"
          type="url"
          placeholder="https://github.com/username/project"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <p className="text-xs text-muted-foreground">
          Link to your public GitHub repository with the source code
        </p>
      </div>

      {/* Deployed URL */}
      <div className="space-y-2">
        <Label htmlFor="deployedUrl" className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          Deployed Application *
        </Label>
        <Input
          id="deployedUrl"
          type="url"
          placeholder="https://your-app.vercel.app"
          value={deployedUrl}
          onChange={(e) => setDeployedUrl(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <p className="text-xs text-muted-foreground">
          Link to your live deployed application (Vercel, Netlify, etc.)
        </p>
      </div>

      {/* Writeup */}
      <div className="space-y-2">
        <Label htmlFor="writeup" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Implementation Notes
        </Label>
        <Textarea
          id="writeup"
          placeholder="Describe your implementation approach, challenges faced, and how you implemented governance features..."
          value={writeupContent}
          onChange={(e) => setWriteupContent(e.target.value)}
          disabled={isSubmitting}
          className="min-h-[200px]"
        />
        <p className="text-xs text-muted-foreground">
          Optional: Share your insights, trade-offs, and learnings from this project
        </p>
      </div>

      {/* Test Credentials */}
      <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-sm mb-2">⚠️ Important: Test Credentials</h4>
        <p className="text-sm text-muted-foreground">
          If your deployed app requires authentication, include test credentials in your README.md or implementation notes.
          We need to be able to test your governance features without creating an account.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          onClick={() => handleSubmit('draft')}
          variant="outline"
          disabled={!githubUrl.trim() || !deployedUrl.trim() || isSubmitting}
        >
          Save as Draft
        </Button>

        <Button
          onClick={() => handleSubmit('submit')}
          disabled={!githubUrl.trim() || !deployedUrl.trim() || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : isSubmitted ? 'Update Submission' : 'Submit Project'}
        </Button>

        {showSuccess && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Saved successfully!</span>
          </div>
        )}
      </div>

      {/* Submission Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-sm mb-2">📋 Submission Guidelines</h4>
        <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
          <li>Ensure your GitHub repository is public</li>
          <li>Include a comprehensive README.md with setup instructions</li>
          <li>Add screenshots of the governance dashboard</li>
          <li>Document all environment variables needed</li>
          <li>Deployed app must be accessible and functional</li>
          <li>Test all governance features before submitting</li>
        </ul>
      </div>
    </div>
  )
}
