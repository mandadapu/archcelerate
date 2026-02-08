// app/api/agents/execute/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { executeResearchAgent } from '@/lib/agents/patterns/research-agent'
import { executeCodeReviewAgent } from '@/lib/agents/patterns/code-review-agent'
import { executeSupportAgent } from '@/lib/agents/patterns/support-agent'
import { checkRateLimit } from '@/lib/governance/rate-limiter'

const VALID_AGENT_TYPES = ['research', 'code-review', 'support'] as const
type AgentType = (typeof VALID_AGENT_TYPES)[number]

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { agentType, input } = await request.json()

    // Validate agentType against allowlist
    if (typeof agentType !== 'string' || !VALID_AGENT_TYPES.includes(agentType as AgentType)) {
      return Response.json({ error: 'Invalid agent type' }, { status: 400 })
    }

    // Validate input is an object
    if (!input || typeof input !== 'object') {
      return Response.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Check rate limit (3 agent runs per hour)
    const rateLimit = await checkRateLimit(user.id, 3, 3600)
    if (!rateLimit.allowed) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    let result

    switch (agentType as AgentType) {
      case 'research':
        if (typeof input.topic !== 'string') {
          return Response.json({ error: 'Invalid input: topic must be a string' }, { status: 400 })
        }
        result = await executeResearchAgent(user.id, input.topic)
        break

      case 'code-review':
        if (typeof input.repoUrl !== 'string' || !Array.isArray(input.filePaths)) {
          return Response.json({ error: 'Invalid input: repoUrl must be a string and filePaths must be an array' }, { status: 400 })
        }
        result = await executeCodeReviewAgent(
          user.id,
          input.repoUrl,
          input.filePaths
        )
        break

      case 'support':
        if (typeof input.message !== 'string') {
          return Response.json({ error: 'Invalid input: message must be a string' }, { status: 400 })
        }
        result = await executeSupportAgent(user.id, input.message)
        break
    }

    return Response.json(result)

  } catch (error: any) {
    console.error('Agent execution error:', error)
    return Response.json(
      { error: 'Agent execution failed', message: error.message },
      { status: 500 }
    )
  }
}
