export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export interface ChatOptions {
  systemPrompt: string
  messages: Message[]
  context?: Record<string, any>
  temperature?: number
  maxTokens?: number
  stream?: boolean
  userId?: string
  cacheKey?: string
}

export interface ChatResponse {
  content: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
  cached?: boolean
}

export interface StreamChatOptions extends ChatOptions {
  onChunk: (chunk: string) => void
  onComplete: (fullResponse: string) => void
  onError: (error: Error) => void
}
