import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) redirect('/login')

  // Get all project submissions for this user
  const submissions = await prisma.projectSubmission.findMany({
    where: { userId: user.id },
    orderBy: { projectNumber: 'asc' },
  })

  // Define available projects (could be loaded from content later)
  const availableProjects = [
    {
      number: 1,
      title: 'AI Chat Assistant',
      description: 'Build a conversational AI chatbot with streaming responses and conversation history',
      techStack: ['Next.js', 'Claude API', 'TypeScript', 'Tailwind'],
    },
    {
      number: 2,
      title: 'Document Q&A System',
      description: 'Create a RAG-based system to answer questions about uploaded documents',
      techStack: ['Next.js', 'Embeddings', 'Vector DB', 'Claude'],
    },
    {
      number: 3,
      title: 'Code Review AI',
      description: 'Automated code review tool that analyzes GitHub repositories',
      techStack: ['Next.js', 'GitHub API', 'Claude', 'TypeScript'],
    },
  ]

  const projects = availableProjects.map(project => {
    const submission = submissions.find(s => s.projectNumber === project.number)
    return {
      ...project,
      githubUrl: submission?.githubRepoUrl,
      deployedUrl: submission?.deployedUrl || undefined,
      score: submission?.overallScore ? Math.round(submission.overallScore * 100) : undefined,
      completedAt: submission?.createdAt ? submission.createdAt.toISOString() : undefined,
    }
  })

  const completedProjects = projects.filter(p => p.githubUrl)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          My Portfolio
        </h1>
        <p className="text-slate-600">
          Showcase of AI projects I&apos;ve built
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projects Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {completedProjects.length}/{projects.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {completedProjects.length > 0
                ? Math.round(
                    completedProjects.reduce((sum, p) => sum + (p.score || 0), 0) /
                      completedProjects.length
                  )
                : 0}
              /100
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map(project => (
          <ProjectCard key={project.number} project={project} />
        ))}
      </div>
    </div>
  )
}
