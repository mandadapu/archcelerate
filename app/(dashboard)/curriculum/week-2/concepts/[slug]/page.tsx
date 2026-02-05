import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { loadMDXContent } from '@/lib/mdx'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const concept = await prisma.concept.findUnique({
    where: { slug: params.slug }
  })

  return {
    title: concept?.title || 'Concept',
    description: `Learn about ${concept?.title}`
  }
}

export default async function ConceptPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  // Fetch concept
  const concept = await prisma.concept.findUnique({
    where: { slug: params.slug },
    include: {
      week: true
    }
  })

  if (!concept) notFound()

  // Load MDX content
  let content = null
  try {
    const { content: mdxContent } = await loadMDXContent(concept.contentPath)
    content = mdxContent
  } catch (error) {
    console.error('Failed to load concept content:', error)
  }

  // Find next/previous concepts
  const concepts = await prisma.concept.findMany({
    where: { weekId: concept.weekId },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, slug: true, title: true, orderIndex: true }
  })

  const currentIndex = concepts.findIndex(c => c.slug === params.slug)
  const previousConcept = currentIndex > 0 ? concepts[currentIndex - 1] : null
  const nextConcept = currentIndex < concepts.length - 1 ? concepts[currentIndex + 1] : null

  // Capture values for server action
  const weekId = concept.weekId
  const conceptsCount = concepts.length
  const nextSlug = nextConcept?.slug

  // Mark as completed action
  async function markComplete() {
    'use server'
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) return

    // Update or create progress
    const progress = await prisma.userWeekProgress.findUnique({
      where: {
        userId_weekId: {
          userId: user.id,
          weekId: weekId
        }
      }
    })

    if (progress) {
      await prisma.userWeekProgress.update({
        where: { id: progress.id },
        data: { conceptsCompleted: progress.conceptsCompleted + 1 }
      })
    } else {
      await prisma.userWeekProgress.create({
        data: {
          userId: user.id,
          weekId: weekId,
          conceptsCompleted: 1,
          conceptsTotal: conceptsCount
        }
      })
    }

    // Redirect to next concept or back to week overview
    if (nextSlug) {
      redirect(`/curriculum/week-2/concepts/${nextSlug}`)
    } else {
      redirect('/curriculum/week-2')
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/curriculum/week-2" className="hover:text-foreground">
          Week 2
        </Link>
        <span>/</span>
        <Link href="/curriculum/week-2" className="hover:text-foreground">
          Concepts
        </Link>
        <span>/</span>
        <span className="text-foreground">{concept.title}</span>
      </div>

      {/* Content */}
      {content ? (
        <article className="prose prose-lg dark:prose-invert max-w-none">
          {content}
        </article>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load concept content</p>
        </div>
      )}

      {/* Complete Button & Navigation */}
      <div className="mt-12 flex items-center justify-between border-t pt-8">
        <form action={markComplete}>
          <Button type="submit">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark as Complete & Continue
          </Button>
        </form>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          {previousConcept && (
            <Link href={`/curriculum/week-2/concepts/${previousConcept.slug}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            </Link>
          )}
          {nextConcept && (
            <Link href={`/curriculum/week-2/concepts/${nextConcept.slug}`}>
              <Button variant="outline">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
