// lib/memory/memory-manager.ts
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/rag/embeddings'

export class MemoryManager {
  constructor(private userId: string) {}

  // Episodic Memory: Store conversation exchanges
  async storeEpisodicMemory(
    conversationId: string,
    messageId: string,
    summary: string,
    importanceScore: number = 0.5
  ) {
    const supabase = createClient()
    const embedding = await generateEmbedding(summary)

    await supabase.from('memory_episodic').insert({
      user_id: this.userId,
      conversation_id: conversationId,
      message_id: messageId,
      summary,
      embedding: JSON.stringify(embedding),
      importance_score: importanceScore
    })
  }

  // Retrieve relevant episodic memories
  async retrieveEpisodicMemory(query: string, limit: number = 3): Promise<any[]> {
    const supabase = createClient()
    const queryEmbedding = await generateEmbedding(query)

    const { data } = await supabase.rpc('match_episodic_memory', {
      query_embedding: queryEmbedding,
      match_count: limit,
      p_user_id: this.userId
    })

    return data || []
  }

  // Semantic Memory: Store facts extracted from conversations
  async storeSemanticMemory(
    fact: string,
    sourceConversationId: string,
    confidence: number = 0.8
  ) {
    const supabase = createClient()
    const embedding = await generateEmbedding(fact)

    await supabase.from('memory_semantic').insert({
      user_id: this.userId,
      fact,
      source_conversation_id: sourceConversationId,
      embedding: JSON.stringify(embedding),
      confidence
    })
  }

  // Retrieve relevant semantic memories
  async retrieveSemanticMemory(query: string, limit: number = 3): Promise<any[]> {
    const supabase = createClient()
    const queryEmbedding = await generateEmbedding(query)

    const { data } = await supabase.rpc('match_semantic_memory', {
      query_embedding: queryEmbedding,
      match_count: limit,
      p_user_id: this.userId
    })

    // Update access count
    if (data) {
      const ids = data.map((m: any) => m.id)
      await supabase
        .from('memory_semantic')
        .update({
          access_count: supabase.rpc('increment', { x: 1 }),
          last_accessed: new Date().toISOString()
        })
        .in('id', ids)
    }

    return data || []
  }

  // Procedural Memory: Update user preferences
  async updateProceduralMemory(preferences: Record<string, any>) {
    const supabase = createClient()

    const { data: existing } = await supabase
      .from('memory_procedural')
      .select('*')
      .eq('user_id', this.userId)
      .single()

    if (existing) {
      await supabase
        .from('memory_procedural')
        .update({
          preferences: { ...existing.preferences, ...preferences },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', this.userId)
    } else {
      await supabase.from('memory_procedural').insert({
        user_id: this.userId,
        preferences,
        patterns: {}
      })
    }
  }

  // Get procedural memory (preferences)
  async getProceduralMemory(): Promise<any> {
    const supabase = createClient()

    const { data } = await supabase
      .from('memory_procedural')
      .select('*')
      .eq('user_id', this.userId)
      .single()

    return data || { preferences: {}, patterns: {} }
  }

  // Memory pruning: Remove low-importance episodic memories
  async pruneEpisodicMemory(threshold: number = 0.3, maxAge: number = 90) {
    const supabase = createClient()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - maxAge)

    await supabase
      .from('memory_episodic')
      .delete()
      .eq('user_id', this.userId)
      .lt('importance_score', threshold)
      .lt('created_at', cutoffDate.toISOString())
  }

  // Assemble context from all memory types
  async assembleContext(query: string): Promise<string> {
    const [episodic, semantic, procedural] = await Promise.all([
      this.retrieveEpisodicMemory(query, 2),
      this.retrieveSemanticMemory(query, 3),
      this.getProceduralMemory()
    ])

    let context = ''

    if (episodic.length > 0) {
      context += 'Recent relevant conversations:\n'
      episodic.forEach((m: any) => {
        context += `- ${m.summary}\n`
      })
      context += '\n'
    }

    if (semantic.length > 0) {
      context += 'Known facts about you:\n'
      semantic.forEach((m: any) => {
        context += `- ${m.fact}\n`
      })
      context += '\n'
    }

    if (Object.keys(procedural.preferences).length > 0) {
      context += 'Your preferences:\n'
      Object.entries(procedural.preferences).forEach(([key, value]) => {
        context += `- ${key}: ${value}\n`
      })
    }

    return context
  }
}
