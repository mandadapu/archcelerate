// app/api/rag/evaluate/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { hybridSearch } from '@/lib/rag/retrieval'
import { synthesizeFromMultipleSources } from '@/lib/rag/synthesis'
import { evaluateRAGResponse } from '@/lib/rag/evaluation'
import { EvaluationQuestion, EvaluationResult } from '@/lib/rag/types'
import { RAG_CONFIG } from '@/lib/rag/constants'
import { createErrorResponse, chunkArray } from '@/lib/rag/utils'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return createErrorResponse('Unauthorized', 'auth')
  }
  const supabase = await createClient()

  try {

    const { datasetId } = await request.json()

    if (!datasetId) {
      return createErrorResponse('Dataset ID required', 'validation')
    }

    // Get all questions in dataset with pagination check
    const { data: questions, error: questionsError } = await supabase
      .from('rag_eval_questions')
      .select('*')
      .eq('dataset_id', datasetId)
      .limit(RAG_CONFIG.limits.maxQuestionsPerEval)

    if (questionsError) {
      console.error('Failed to fetch questions:', questionsError)
      return createErrorResponse('Failed to fetch questions', 'server')
    }

    if (!questions || questions.length === 0) {
      return createErrorResponse('No questions in dataset', 'validation')
    }

    const results: EvaluationResult[] = []
    const errors: Array<{ question: string; error: string }> = []

    // Process questions in batches with concurrency limit
    const batches = chunkArray(questions, RAG_CONFIG.limits.maxConcurrentEvals)

    for (const batch of batches) {
      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map((question) => evaluateQuestion(session.user.id, question, datasetId, supabase))
      )

      // Collect results and errors
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          errors.push({
            question: batch[index].question,
            error: result.reason?.message || 'Unknown error',
          })
        }
      })
    }

    // Calculate summary
    const passRate = results.length > 0 ? results.filter((r) => r.passed).length / results.length : 0

    const summary = {
      totalQuestions: questions.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.length - results.filter((r) => r.passed).length,
      errors: errors.length,
      passRate,
      avgFaithfulness:
        results.length > 0
          ? results.reduce((sum, r) => sum + r.metrics.faithfulness, 0) / results.length
          : 0,
      avgRelevance:
        results.length > 0 ? results.reduce((sum, r) => sum + r.metrics.relevance, 0) / results.length : 0,
      avgCoverage:
        results.length > 0 ? results.reduce((sum, r) => sum + r.metrics.coverage, 0) / results.length : 0,
    }

    return Response.json({
      results,
      errors,
      summary,
    })
  } catch (error: unknown) {
    console.error('Evaluation error:', error)
    const message = error instanceof Error ? error.message : 'Evaluation failed'
    return createErrorResponse(message, 'server')
  }
}

async function evaluateQuestion(
  userId: string,
  question: EvaluationQuestion,
  datasetId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<EvaluationResult> {
  // Retrieve relevant chunks
  const chunks = await hybridSearch(userId, question.question, RAG_CONFIG.limits.documentChunks)

  // Generate answer
  const synthesis = await synthesizeFromMultipleSources(question.question, chunks)

  // Evaluate
  const metrics = await evaluateRAGResponse(
    question.question,
    synthesis.answer,
    chunks,
    question.ground_truth_answer
  )

  const passed = metrics.overall >= RAG_CONFIG.evaluation.passThreshold

  // Store result
  await supabase.from('rag_eval_results').insert({
    dataset_id: datasetId,
    question_id: question.id,
    generated_answer: synthesis.answer,
    retrieved_chunks: chunks.map((c) => ({
      chunkId: c.chunkId,
      relevance: c.relevanceScore,
    })),
    metrics,
    passed,
  })

  return {
    question: question.question,
    answer: synthesis.answer,
    metrics,
    passed,
  }
}
