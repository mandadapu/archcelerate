// lib/rag/types.ts
import { SearchResult } from './retrieval'

// Citation types
export interface Citation {
  chunkId: string
  documentId: string
  documentName: string
  pageNumber?: number
  content: string
  relevanceScore: number
}

export interface CitationRecord {
  query_id: string
  chunk_id: string
  document_id: string
  page_number: number | null
  relevance_score: number
  used_in_response: boolean
}

// Synthesis types
export interface SynthesisResult {
  answer: string
  confidence: number
  sources: string[]
  contradictions?: string[]
}

export interface DocumentGroup {
  [documentId: string]: SearchResult[]
}

// Evaluation types
export interface EvaluationMetrics {
  faithfulness: number // Answer grounded in sources (0-1)
  relevance: number // Retrieved chunks match query (0-1)
  coverage: number // All aspects addressed (0-1)
  overall: number // Average of above
}

export interface EvaluationQuestion {
  id: string
  dataset_id: string
  question: string
  ground_truth_answer: string
  relevant_document_ids?: string[]
  metadata?: Record<string, any>
}

export interface EvaluationResult {
  question: string
  answer: string
  metrics: EvaluationMetrics
  passed: boolean
}

export interface EvaluationSummary {
  totalQuestions: number
  passed: number
  passRate: number
  avgFaithfulness: number
  avgRelevance: number
  avgCoverage: number
}

// Memory types (imported from memory system)
export interface EpisodicMemory {
  id: string
  summary: string
  importance: number
  created_at: string
}

export interface SemanticMemory {
  id: string
  fact: string
  confidence: number
  created_at: string
}

export interface ProceduralMemory {
  preferences: Record<string, any>
  skills: string[]
}

// Memory-aware RAG types
export interface MemoryAwareResponse {
  answer: string
  sources: SearchResult[]
  memoryContext: string
  conversationId?: string
}

export interface MemoryContext {
  documents: SearchResult[]
  episodic: EpisodicMemory[]
  semantic: SemanticMemory[]
  procedural: ProceduralMemory
}

// API response types
export interface QueryResponse {
  answer: string
  sources: SearchResult[]
  hasMemoryContext: boolean
  conversationId?: string
  metadata: {
    sourcesUsed: number
    avgRelevance: number
    latencyMs: number
    cost: number
  }
}

export interface EvaluationResponse {
  results: EvaluationResult[]
  summary: EvaluationSummary
}

// Error types
export type ErrorType = 'auth' | 'validation' | 'rate_limit' | 'budget' | 'server'

export interface APIError {
  error: string
  type?: ErrorType
  details?: any
}
