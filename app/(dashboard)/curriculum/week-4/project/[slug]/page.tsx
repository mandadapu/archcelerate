import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CheckCircle2, Circle, ArrowLeft, ExternalLink, Github } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await prisma.weekProject.findUnique({
    where: { slug: params.slug }
  })

  return {
    title: project?.title || 'Project',
    description: project?.description || 'Submit your project'
  }
}

export default async function ProjectPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) return null

  // Fetch project
  const project = await prisma.weekProject.findUnique({
    where: { slug: params.slug },
    include: { week: true }
  })

  if (!project) notFound()

  const requirements = project.requirements as string[]
  const successCriteria = project.successCriteria as string[]

  // Fetch user's project submission
  const submission = await prisma.weekProjectSubmission.findFirst({
    where: {
      userId: user.id,
      projectId: project.id
    }
  })

  // Capture values for server action
  const projectId = project.id
  const weekId = project.weekId

  // Submit or update project
  async function submitProject(formData: FormData) {
    'use server'
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) return

    const githubUrl = formData.get('githubUrl') as string
    const deployedUrl = formData.get('deployedUrl') as string
    const writeupContent = formData.get('writeupContent') as string
    const action = formData.get('action') as string

    const status = action === 'submit' ? 'submitted' : 'draft'

    await prisma.weekProjectSubmission.upsert({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId
        }
      },
      create: {
        userId: user.id,
        projectId: projectId,
        githubUrl,
        deployedUrl,
        writeupContent,
        status,
        submittedAt: status === 'submitted' ? new Date() : null
      },
      update: {
        githubUrl,
        deployedUrl,
        writeupContent,
        status,
        submittedAt: status === 'submitted' ? new Date() : null,
        updatedAt: new Date()
      }
    })

    // If submitted, update week progress
    if (status === 'submitted') {
      await prisma.userWeekProgress.upsert({
        where: {
          userId_weekId: {
            userId: user.id,
            weekId: weekId
          }
        },
        create: {
          userId: user.id,
          weekId: weekId,
          conceptsTotal: 3,
          projectCompleted: true
        },
        update: {
          projectCompleted: true
        }
      })
    }

    redirect(`/curriculum/week-4/project/${params.slug}`)
  }

  const isSubmitted = submission?.status === 'submitted'

  return (
    <div className="container max-w-4xl py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/curriculum/week-4" className="hover:text-foreground">
          Week 4
        </Link>
        <span>/</span>
        <span>Project</span>
        <span>/</span>
        <span className="text-foreground">{project.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-4xl font-bold">{project.title}</h1>
          {isSubmitted && (
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          )}
        </div>
        <p className="text-lg text-muted-foreground">{project.description}</p>
      </div>

      {/* Requirements & Success Criteria */}
      <Card className="mb-8">
        <CardContent className="p-0">
          <Accordion type="multiple" className="w-full">
            {/* Requirements */}
            <AccordionItem value="requirements">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="text-left">
                  <div className="font-semibold">Requirements</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    Complete all requirements to successfully finish this project
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6">
                <ul className="space-y-2">
                  {requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Circle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Success Criteria */}
            <AccordionItem value="success-criteria">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="text-left">
                  <div className="font-semibold">Success Criteria</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    Your project will be evaluated based on these criteria
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6">
                <ul className="space-y-2">
                  {successCriteria.map((criterion, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isSubmitted ? 'Your Submission' : 'Submit Your Project'}
          </CardTitle>
          <CardDescription>
            {isSubmitted
              ? 'Project submitted! You can update your submission at any time.'
              : 'Fill in the details below to submit your project. You can save as draft and come back later.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitProject} className="space-y-6">
            {/* GitHub URL */}
            <div className="space-y-2">
              <Label htmlFor="githubUrl">
                GitHub Repository URL *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  placeholder="https://github.com/username/repo"
                  defaultValue={submission?.githubUrl || ''}
                  required
                />
                {submission?.githubUrl && (
                  <Link href={submission.githubUrl} target="_blank">
                    <Button type="button" variant="outline" size="icon">
                      <Github className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Deployed URL */}
            <div className="space-y-2">
              <Label htmlFor="deployedUrl">
                Deployed Application URL *
              </Label>
              <p className="text-sm text-muted-foreground">
                Your application should be deployed and publicly accessible (Vercel, Cloud Run, Railway, etc.)
              </p>
              <div className="flex gap-2">
                <Input
                  id="deployedUrl"
                  name="deployedUrl"
                  type="url"
                  placeholder="https://your-app.vercel.app"
                  defaultValue={submission?.deployedUrl || ''}
                  required
                />
                {submission?.deployedUrl && (
                  <Link href={submission.deployedUrl} target="_blank">
                    <Button type="button" variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Project Writeup */}
            <div className="space-y-2">
              <Label htmlFor="writeupContent">
                Project Documentation *
              </Label>
              <p className="text-sm text-muted-foreground">
                Document your production deployment: architecture, monitoring setup, caching strategy,
                performance metrics, cost tracking, and any challenges you encountered.
              </p>
              <Textarea
                id="writeupContent"
                name="writeupContent"
                placeholder="Describe your deployment architecture, monitoring implementation, caching strategy, and key metrics..."
                rows={12}
                defaultValue={submission?.writeupContent || ''}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button type="submit" name="action" value="submit">
                {isSubmitted ? 'Update Submission' : 'Submit Project'}
              </Button>
              <Button type="submit" name="action" value="draft" variant="outline">
                Save as Draft
              </Button>
              <Link href="/curriculum/week-4">
                <Button type="button" variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Week 4
                </Button>
              </Link>
            </div>

            {/* Status */}
            {submission && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isSubmitted
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {isSubmitted ? 'Submitted' : 'Draft'}
                  </span>
                  <span>
                    Last updated: {new Date(submission.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Completion Card */}
      {isSubmitted && (
        <Card className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Project Submitted!
            </CardTitle>
            <CardDescription>
              Congratulations! You&apos;ve completed Week 4 - Observability + Production. You&apos;ve successfully deployed a production-ready AI application with monitoring, caching, and reliability features!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
