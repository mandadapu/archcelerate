// lib/agents/patterns/research-agent.ts
import { AgentExecutor } from '../agent-executor'
import { getTools } from '../tools'

const RESEARCH_AGENT_PROMPT = `You are a research assistant. Your job is to:
1. Search the web for information about the given topic
2. Read relevant sources
3. Take notes on key findings
4. Synthesize information from multiple sources
5. Produce a comprehensive report with citations

Instructions:
- Search for at least 5 different sources
- Take notes as you read each source
- Look for consensus and contradictions across sources
- Cite sources using [Source N] notation
- Produce a well-structured report

Available tools:
- web_search: Search the web for information
- url_fetch: Fetch content from a specific URL
- note_taking: Record important findings

When you've gathered enough information, use finish() with your final report.`

export async function executeResearchAgent(
  userId: string,
  topic: string
): Promise<any> {
  const tools = getTools(['web_search', 'url_fetch', 'note_taking'])

  const executor = new AgentExecutor(
    userId,
    'research-agent', // agentDefinitionId
    RESEARCH_AGENT_PROMPT,
    tools,
    { maxIterations: 15, timeout: 300000 } // 5 min timeout
  )

  return await executor.execute(`Research topic: ${topic}`)
}
