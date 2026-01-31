import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Github } from 'lucide-react'

interface ProjectCardProps {
  project: {
    number: number
    title: string
    description: string
    githubUrl?: string
    deployedUrl?: string
    score?: number
    techStack: string[]
    completedAt?: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-slate-600 mb-1">
              Project {project.number}
            </div>
            <CardTitle className="text-xl">{project.title}</CardTitle>
          </div>
          {project.score && (
            <div className="text-2xl font-bold text-blue-600">
              {project.score}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-700">{project.description}</p>

        <div className="flex gap-2 flex-wrap">
          {project.techStack.map(tech => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <Github className="h-4 w-4" />
              Code
            </a>
          )}
          {project.deployedUrl && (
            <a
              href={project.deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </a>
          )}
        </div>

        {project.completedAt && (
          <div className="text-xs text-slate-500">
            Completed {new Date(project.completedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
