// lib/rag/constants.ts
export const RAG_CONFIG = {
  // Model configuration
  models: {
    synthesis: process.env.RAG_SYNTHESIS_MODEL || 'claude-sonnet-4-5-20250929',
    evaluation: process.env.RAG_EVAL_MODEL || 'claude-haiku-4-5-20251001',
  },

  // Retrieval limits
  limits: {
    episodicMemoryResults: parseInt(process.env.RAG_EPISODIC_LIMIT || '2'),
    semanticMemoryResults: parseInt(process.env.RAG_SEMANTIC_LIMIT || '3'),
    documentChunks: parseInt(process.env.RAG_CHUNK_LIMIT || '5'),
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxQuestionsPerEval: 100,
    maxConcurrentEvals: 5,
  },

  // Evaluation settings
  evaluation: {
    temperature: 0, // Deterministic for consistency
    passThreshold: 0.7,
    maxRetries: 3,
  },

  // File upload settings
  upload: {
    allowedExtensions: ['.pdf', '.docx', '.txt', '.md'],
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ],
  },
} as const

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  RATE_LIMIT: 'Rate limit exceeded. Please try again later.',
  BUDGET_EXCEEDED: 'Budget limit exceeded',
  INVALID_INPUT: 'Invalid input provided',
  FILE_TOO_LARGE: 'File size exceeds 10MB limit',
  INVALID_FILE_TYPE: 'Invalid file type. Allowed: PDF, DOCX, TXT, MD',
  QUERY_FAILED: 'Query processing failed',
  EVALUATION_FAILED: 'Evaluation failed',
} as const
