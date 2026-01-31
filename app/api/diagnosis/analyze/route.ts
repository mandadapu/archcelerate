import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeDiagnosis, DiagnosisAnalysisInput } from '@/lib/ai/client'
import { quizQuestions } from '@/lib/quiz/questions'
import { QuizAnswer } from '@/types/diagnosis'
import { validateQuizAnswers } from '@/lib/utils/validation'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const { answers }: { answers: QuizAnswer[] } = await request.json()

    // Validate answers
    const validation = validateQuizAnswers(answers)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid answers', details: validation.errors },
        { status: 400 }
      )
    }

    // Prepare data for AI analysis
    const analysisInput: DiagnosisAnalysisInput = {
      answers: answers.map(a => {
        const question = quizQuestions.find(q => q.id === a.questionId)!
        return {
          questionId: a.questionId,
          question: question.question,
          selectedOptions: a.selectedOptions,
          correctAnswers: question.correctAnswers,
          skillArea: question.skillArea,
          isCorrect: a.isCorrect,
        }
      }),
      totalQuestions: quizQuestions.length,
    }

    // Analyze with Claude AI
    const analysis = await analyzeDiagnosis(analysisInput)

    // Store results in database
    await prisma.skillDiagnosis.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        quizAnswers: answers,
        skillScores: analysis.skillScores,
        recommendedPath: analysis.recommendedPath,
        completedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        quizAnswers: answers,
        skillScores: analysis.skillScores,
        recommendedPath: analysis.recommendedPath,
      },
    })

    // Update user's diagnosis_completed flag
    await prisma.user.update({
      where: { id: session.user.id },
      data: { diagnosisCompleted: true },
    })

    // Log event
    await prisma.learningEvent.create({
      data: {
        userId: session.user.id,
        eventType: 'diagnosis.completed',
        eventData: {
          score: answers.filter(a => a.isCorrect).length,
          total: quizQuestions.length,
          recommended_path: analysis.recommendedPath,
        },
      },
    })

    return NextResponse.json({
      userId: session.user.id,
      analysis,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
