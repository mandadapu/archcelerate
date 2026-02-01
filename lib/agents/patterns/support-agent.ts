// lib/agents/patterns/support-agent.ts
import { AgentExecutor } from '../agent-executor'
import { getTools } from '../tools'

const SUPPORT_AGENT_PROMPT = `You are a customer support agent. Your job is to:
1. Understand the customer's issue
2. Search the knowledge base for relevant information
3. Provide a helpful response OR escalate to a human

Escalation rules:
- Escalate if confidence < 70%
- Escalate for account/billing issues
- Escalate for bugs/technical issues
- Escalate if customer is frustrated

Available tools:
- kb_search: Search knowledge base for information
- ticket_create: Create a support ticket
- human_escalate: Escalate to human agent

When you can provide a confident answer, use finish() with your response.
If you need to escalate, use human_escalate() first, then finish().`

export async function executeSupportAgent(
  userId: string,
  customerMessage: string
): Promise<any> {
  const tools = getTools(['kb_search', 'ticket_create', 'human_escalate'])

  const executor = new AgentExecutor(
    userId,
    'support-agent',
    SUPPORT_AGENT_PROMPT,
    tools,
    { maxIterations: 5 }
  )

  return await executor.execute(`Customer message: ${customerMessage}`)
}
