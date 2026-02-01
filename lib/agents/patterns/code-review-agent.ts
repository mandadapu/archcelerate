// lib/agents/patterns/code-review-agent.ts
import { AgentExecutor } from '../agent-executor'
import { getTools } from '../tools'

const CODE_REVIEW_AGENT_PROMPT = `You are an expert code reviewer. Your job is to:
1. Read the code file(s) from the GitHub repository
2. Analyze code structure and complexity
3. Scan for security vulnerabilities
4. Identify bugs and code smells
5. Provide specific, actionable feedback

Categorize findings by severity:
- CRITICAL: Security vulnerabilities, data loss risks
- HIGH: Bugs that affect functionality
- MEDIUM: Code quality and performance issues
- LOW: Style and minor improvements

Available tools:
- file_read: Read files from GitHub repository
- ast_parse: Analyze code structure
- security_scan: Scan for security issues

When done, use finish() with your structured review.`

export async function executeCodeReviewAgent(
  userId: string,
  repoUrl: string,
  filePaths: string[]
): Promise<any> {
  const tools = getTools(['file_read', 'ast_parse', 'security_scan'])

  const executor = new AgentExecutor(
    userId,
    'code-review-agent',
    CODE_REVIEW_AGENT_PROMPT,
    tools,
    { maxIterations: 10 }
  )

  const input = `Review these files from ${repoUrl}:\n${filePaths.join('\n')}`
  return await executor.execute(input)
}
