import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getConceptContent, getNextConcept, getPreviousConcept, getSprintById } from '@/lib/content-loader'
import { getConceptProgress, trackConceptView } from '@/lib/progress-tracker'
import { serialize } from 'next-mdx-remote/serialize'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import ConceptViewer from '@/components/learning/ConceptViewer'
import Link from 'next/link'

interface ConceptPageProps {
  params: Promise<{
    sprintId: string
    conceptId: string
  }>
}

export default async function ConceptPage({ params }: ConceptPageProps) {
  const { sprintId, conceptId } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const [sprint, conceptContent] = await Promise.all([
    getSprintById(sprintId),
    getConceptContent(sprintId, conceptId),
  ])

  if (!sprint || !conceptContent) {
    notFound()
  }

  // Track that user viewed this concept
  await trackConceptView(user.id, sprintId, conceptId)

  // Get progress
  const progress = await getConceptProgress(user.id, sprintId, conceptId)

  // Get navigation concepts
  const [nextConcept, previousConcept] = await Promise.all([
    getNextConcept(sprintId, conceptId),
    getPreviousConcept(sprintId, conceptId),
  ])

  // Serialize MDX
  const mdxSource = await serialize(conceptContent.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight],
    },
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <span>/</span>
        <Link href={`/learn/${sprintId}`} className="hover:underline">
          {sprint.title}
        </Link>
        <span>/</span>
        <span>{conceptContent.metadata.title}</span>
      </div>

      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {conceptContent.metadata.title}
            </h1>
            <p className="text-slate-600 mt-2">
              {conceptContent.metadata.description}
            </p>
          </div>
          {progress?.status === 'completed' && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              ✓ Completed
            </span>
          )}
        </div>

        <div className="flex gap-4 mt-4 text-sm text-slate-600">
          <span>⏱️ {conceptContent.metadata.estimatedMinutes} min</span>
          <span
            className={`px-2 py-0.5 rounded ${
              conceptContent.metadata.difficulty === 'beginner'
                ? 'bg-green-100 text-green-700'
                : conceptContent.metadata.difficulty === 'intermediate'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {conceptContent.metadata.difficulty}
          </span>
          {conceptContent.metadata.tags && conceptContent.metadata.tags.length > 0 && (
            <span>🏷️ {conceptContent.metadata.tags.join(', ')}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <ConceptViewer
        mdxSource={mdxSource}
        sprintId={sprintId}
        conceptId={conceptId}
        conceptTitle={conceptContent.metadata.title}
        nextConceptId={nextConcept?.id}
        previousConceptId={previousConcept?.id}
        isCompleted={progress?.status === 'completed'}
      />
    </div>
  )
}
