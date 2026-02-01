// app/api/agents/execute/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { executeResearchAgent } from '@/lib/agents/patterns/research-agent'
import { executeCodeReviewAgent } from '@/lib/agents/patterns/code-review-agent'
import { executeSupportAgent } from '@/lib/agents/patterns/support-agent'
import { checkRateLimit } from '@/lib/governance/rate-limiter'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { agentType, input } = await request.json()

    // Check rate limit (3 agent runs per hour)
    const rateLimit = await checkRateLimit(user.id, 3, 3600)
    if (!rateLimit.allowed) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    let result

    switch (agentType) {
      case 'research':
        result = await executeResearchAgent(user.id, input.topic)
        break

      case 'code-review':
        result = await executeCodeReviewAgent(
          user.id,
          input.repoUrl,
          input.filePaths
        )
        break

      case 'support':
        result = await executeSupportAgent(user.id, input.message)
        break

      default:
        return Response.json({ error: 'Invalid agent type' }, { status: 400 })
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
