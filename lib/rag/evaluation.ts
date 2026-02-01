// lib/rag/evaluation.ts
import Anthropic from '@anthropic-ai/sdk'
import { SearchResult } from './retrieval'
import { EvaluationMetrics } from './types'
import { RAG_CONFIG } from './constants'
import { sanitizeForPrompt, retryLLMCall } from './utils'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function evaluateFaithfulness(
  answer: string,
  sources: SearchResult[]
): Promise<number> {
  const sourceText = sources.map((s) => s.content).join('\n\n')
  const sanitizedAnswer = sanitizeForPrompt(answer)

  const evaluateFn = async () => {
    const response = await client.messages.create({
      model: RAG_CONFIG.models.evaluation,
      max_tokens: 100,
      temperature: RAG_CONFIG.evaluation.temperature,
      messages: [
        {
          role: 'user',
          content: `Rate how well this answer is grounded in the provided sources (0.0 to 1.0).

Answer: "${sanitizedAnswer}"

Sources:
${sourceText}

Respond with only a number between 0.0 and 1.0.`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const score = parseFloat(text.trim())
    return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score))
  }

  return retryLLMCall(evaluateFn)
}

export async function evaluateRelevance(
  query: string,
  chunks: SearchResult[]
): Promise<number> {
  if (chunks.length === 0) return 0

  // Use average relevance score from retrieval
  const avgRelevance = chunks.reduce((sum, c) => sum + c.relevanceScore, 0) / chunks.length
  return avgRelevance
}

export async function evaluateCoverage(
  question: string,
  answer: string,
  groundTruth?: string
): Promise<number> {
  const sanitizedQuestion = sanitizeForPrompt(question)
  const sanitizedAnswer = sanitizeForPrompt(answer)

  const evaluateFn = async () => {
    if (!groundTruth) {
      // Without ground truth, check if answer addresses the question
      const response = await client.messages.create({
        model: RAG_CONFIG.models.evaluation,
        max_tokens: 100,
        temperature: RAG_CONFIG.evaluation.temperature,
        messages: [
          {
            role: 'user',
            content: `Rate how well this answer addresses all aspects of the question (0.0 to 1.0).

Question: "${sanitizedQuestion}"

Answer: "${sanitizedAnswer}"

Respond with only a number between 0.0 and 1.0.`,
          },
        ],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const score = parseFloat(text.trim())
      return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score))
    }

    // With ground truth, compare coverage
    const sanitizedGroundTruth = sanitizeForPrompt(groundTruth)
    const response = await client.messages.create({
      model: RAG_CONFIG.models.evaluation,
      max_tokens: 100,
      temperature: RAG_CONFIG.evaluation.temperature,
      messages: [
        {
          role: 'user',
          content: `Rate how well the generated answer covers the same points as the ground truth (0.0 to 1.0).

Question: "${sanitizedQuestion}"

Ground Truth: "${sanitizedGroundTruth}"

Generated Answer: "${sanitizedAnswer}"

Respond with only a number between 0.0 and 1.0.`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const score = parseFloat(text.trim())
    return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score))
  }

  return retryLLMCall(evaluateFn)
}

export async function evaluateRAGResponse(
  question: string,
  answer: string,
  retrievedChunks: SearchResult[],
  groundTruth?: string
): Promise<EvaluationMetrics> {
  const [faithfulness, relevance, coverage] = await Promise.all([
    evaluateFaithfulness(answer, retrievedChunks),
    evaluateRelevance(question, retrievedChunks),
    evaluateCoverage(question, answer, groundTruth),
  ])

  return {
    faithfulness,
    relevance,
    coverage,
    overall: (faithfulness + relevance + coverage) / 3,
  }
}

export function createTestDataset(): Array<{
  question: string
  groundTruth: string
  expectedDocuments?: string[]
}> {
  return [
    {
      question: 'What is the main purpose of vector databases?',
      groundTruth:
        'Vector databases are designed to store and efficiently search high-dimensional vectors, enabling semantic similarity search for AI applications.',
      expectedDocuments: ['vector-database-guide.pdf'],
    },
    {
      question: 'How does RAG improve LLM responses?',
      groundTruth:
        'RAG (Retrieval-Augmented Generation) improves LLM responses by retrieving relevant context from external knowledge bases before generating answers, reducing hallucinations and enabling access to up-to-date information.',
      expectedDocuments: ['rag-fundamentals.pdf'],
    },
    {
      question: 'What are the main chunking strategies for RAG?',
      groundTruth:
        'The main chunking strategies are: fixed-size chunking with overlap, sentence-based chunking, and semantic chunking based on paragraphs or topics.',
      expectedDocuments: ['chunking-strategies.pdf'],
    },
    {
      question: 'What is the difference between semantic and keyword search?',
      groundTruth:
        'Semantic search uses vector embeddings to find results based on meaning and context, while keyword search uses exact or fuzzy text matching. Semantic search can find relevant results even when different words are used.',
      expectedDocuments: ['search-fundamentals.pdf'],
    },
    {
      question: 'How do you measure RAG system performance?',
      groundTruth:
        'RAG systems are measured using metrics like faithfulness (answer grounded in sources), relevance (retrieved chunks match query), and coverage (all aspects addressed). Other metrics include latency, cost, and user satisfaction.',
      expectedDocuments: ['rag-evaluation.pdf'],
    },
    {
      question: 'What is the purpose of re-ranking in RAG?',
      groundTruth:
        'Re-ranking improves retrieval quality by using a more sophisticated model to re-order initial search results, placing the most relevant chunks at the top before sending to the LLM.',
      expectedDocuments: ['advanced-rag-techniques.pdf'],
    },
    {
      question: 'How does hybrid search combine vector and keyword search?',
      groundTruth:
        'Hybrid search combines vector (semantic) and keyword (lexical) search results using techniques like Reciprocal Rank Fusion (RRF) to get the benefits of both approaches, improving recall and precision.',
      expectedDocuments: ['hybrid-search.pdf'],
    },
    {
      question: 'What are embeddings in the context of AI?',
      groundTruth:
        'Embeddings are dense vector representations of data (text, images, etc.) that capture semantic meaning in a high-dimensional space, allowing similarity comparisons through mathematical operations.',
      expectedDocuments: ['embeddings-explained.pdf'],
    },
  ]
}
