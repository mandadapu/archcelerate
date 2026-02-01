import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/rag/embeddings'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export interface AgentMemoryContext {
  shortTerm: Record<string, any>
  longTerm: Array<{
    summary: string
    relevanceScore: number
    metadata?: Record<string, any>
  }>
  working: Record<string, any>
}

export class AgentMemory {
  constructor(
    private userId: string,
    private agentDefinitionId: string
  ) {}

  // Short-term memory: Context within a single execution
  async storeShortTermMemory(
    executionId: string,
    context: Record<string, any>
  ): Promise<void> {
    const supabase = createClient()

    const entries = Object.entries(context).map(([key, value]) => ({
      execution_id: executionId,
      key,
      value: JSON.stringify(value)
    }))

    await supabase.from('agent_short_term_memory').insert(entries)
  }

  async getShortTermMemory(executionId: string): Promise<Record<string, any>> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('agent_short_term_memory')
      .select('key, value')
      .eq('execution_id', executionId)

    if (error) throw error

    return data.reduce((acc, { key, value }) => {
      acc[key] = JSON.parse(value)
      return acc
    }, {} as Record<string, any>)
  }

  // Long-term memory: Consolidated knowledge across executions
  async consolidateToLongTerm(
    executionId: string,
    summary: string,
    importanceScore: number = 0.5,
    metadata?: Record<string, any>
  ): Promise<void> {
    const supabase = createClient()
    const embedding = await generateEmbedding(summary)

    await supabase.from('agent_long_term_memory').insert({
      user_id: this.userId,
      agent_definition_id: this.agentDefinitionId,
      summary,
      embedding: JSON.stringify(embedding),
      importance_score: importanceScore,
      metadata
    })
  }

  async retrieveLongTermMemory(
    query: string,
    limit: number = 5
  ): Promise<Array<{ summary: string; relevanceScore: number; metadata?: any }>> {
    const supabase = createClient()
    const queryEmbedding = await generateEmbedding(query)

    const { data, error } = await supabase.rpc('match_agent_long_term_memory', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.7,
      match_count: limit,
      p_user_id: this.userId,
      p_agent_id: this.agentDefinitionId
    })

    if (error) throw error

    // Update access tracking
    if (data && data.length > 0) {
      const memoryIds = data.map((m: any) => m.id)
      await supabase
        .from('agent_long_term_memory')
        .update({
          last_accessed_at: new Date().toISOString()
        })
        .in('id', memoryIds)
    }

    return data.map((m: any) => ({
      summary: m.summary,
      relevanceScore: m.similarity,
      metadata: m.metadata
    }))
  }

  // Working memory: Current execution context (ephemeral, stored in Redis)
  async getWorkingMemory(executionId: string): Promise<Record<string, any>> {
    const key = `agent:working:${executionId}`
    const data = await redis.get(key)
    return data ? JSON.parse(data as string) : {}
  }

  async updateWorkingMemory(
    executionId: string,
    updates: Record<string, any>
  ): Promise<void> {
    const key = `agent:working:${executionId}`
    const current = await this.getWorkingMemory(executionId)
    const updated = { ...current, ...updates }

    // Working memory expires after 1 hour
    await redis.set(key, JSON.stringify(updated), { ex: 3600 })
  }

  async clearWorkingMemory(executionId: string): Promise<void> {
    const key = `agent:working:${executionId}`
    await redis.del(key)
  }

  // Assemble complete context for agent execution
  async assembleContext(query: string): Promise<AgentMemoryContext> {
    const [longTerm] = await Promise.all([
      this.retrieveLongTermMemory(query, 3)
    ])

    return {
      shortTerm: {}, // Will be populated during execution
      longTerm,
      working: {} // Will be populated during execution
    }
  }

  // Cleanup old memories
  async pruneMemories(maxMemories: number = 1000): Promise<number> {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('prune_agent_long_term_memory', {
      p_user_id: this.userId,
      p_agent_id: this.agentDefinitionId,
      max_memories: maxMemories
    })

    if (error) throw error
    return data
  }
}
