import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { fetchRepositoryFiles } from '@/lib/github/client'
import { reviewCode } from '@/lib/ai/code-review'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { repositoryUrl, deployedUrl, projectNumber } = await request.json()

    // Validate inputs
    if (!repositoryUrl || !projectNumber) {
      return NextResponse.json(
        { error: 'Repository URL and project number are required' },
        { status: 400 }
      )
    }

    // Check submission limit (max 3 per day per project)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const recentSubmissions = await prisma.projectSubmission.count({
      where: {
        userId: user.id,
        projectNumber,
        createdAt: {
          gte: oneDayAgo,
        },
      },
    })

    if (recentSubmissions >= 3) {
      return NextResponse.json(
        { error: 'Submission limit reached (3 per day)' },
        { status: 429 }
      )
    }

    // Fetch code from GitHub
    let files
    try {
      files = await fetchRepositoryFiles(repositoryUrl, 20, 100)
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch repository. Make sure it is public.' },
        { status: 400 }
      )
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No code files found in repository' },
        { status: 400 }
      )
    }

    // Get previous submission count for iteration
    const previousCount = await prisma.projectSubmission.count({
      where: {
        userId: user.id,
        projectNumber,
      },
    })

    const iteration = previousCount + 1

    // Create submission record
    const submission = await prisma.projectSubmission.create({
      data: {
        userId: user.id,
        projectNumber,
        githubRepoUrl: repositoryUrl,
        deployedUrl: deployedUrl || null,
        submissionData: {
          files_reviewed: files.length,
          total_size: files.reduce((sum, f) => sum + f.size, 0),
        } as any,
        reviewStatus: 'pending',
      },
    })

    // Perform AI code review
    const review = await reviewCode(files, projectNumber)

    // Store feedback
    const feedback = await prisma.codeReviewFeedback.create({
      data: {
        submissionId: submission.id,
        overallScore: review.overallScore / 100,
        functionalityScore: review.scores.functionality / 100,
        codeQualityScore: review.scores.codeQuality / 100,
        aiBestPracticesScore: review.scores.aiBestPractices / 100,
        architectureScore: review.scores.architecture / 100,
        suggestions: review.suggestions as any,
        goodPractices: review.goodPractices as any,
        criticalIssues: review.criticalIssues as any,
        improvementsNeeded: review.improvementsNeeded as any,
        reviewIteration: iteration,
      },
    })

    // Store individual comments
    if (review.suggestions.length > 0) {
      await prisma.reviewComment.createMany({
        data: review.suggestions.map(s => ({
          feedbackId: feedback.id,
          filePath: s.file,
          lineNumber: s.line || null,
          severity: s.severity,
          category: s.category,
          message: s.issue,
          suggestion: s.recommendation,
        })),
      })
    }

    // Update submission status
    await prisma.projectSubmission.update({
      where: { id: submission.id },
      data: {
        reviewStatus: 'reviewed',
        overallScore: review.overallScore / 100,
        reviewedAt: new Date(),
      },
    })

    // Log event
    await prisma.learningEvent.create({
      data: {
        userId: user.id,
        eventType: 'project.submitted',
        eventData: {
          project_number: projectNumber,
          score: review.overallScore,
          iteration,
        } as any,
      },
    })

    return NextResponse.json({
      submissionId: submission.id,
      feedbackId: feedback.id,
      review,
    })
  } catch (error) {
    console.error('Code review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
