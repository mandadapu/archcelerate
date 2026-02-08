import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export interface ActionItem {
  task: string
  assignee?: string
  deadline?: string
  priority?: 'low' | 'medium' | 'high'
}

export interface MeetingSummary {
  summary: string
  keyPoints: string[]
  decisions: string[]
  actionItems: ActionItem[]
  nextSteps: string[]
}

/**
 * Extract action items from meeting notes or transcript
 */
export async function extractActionItems(text: string): Promise<ActionItem[]> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Extract action items from this meeting text. For each action item, identify:
1. The task description
2. The person responsible (if mentioned)
3. The deadline (if mentioned)
4. The priority level (if it can be inferred)

Meeting text:
${text}

Return ONLY a JSON array of action items in this format:
[
  {
    "task": "description",
    "assignee": "person name",
    "deadline": "deadline",
    "priority": "low|medium|high"
  }
]

If no action items are found, return an empty array [].`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  try {
    // Extract JSON from the response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return []
    }

    const actionItems = JSON.parse(jsonMatch[0])
    return actionItems
  } catch (error: any) {
    console.error('Failed to parse action items:', error)
    return []
  }
}

/**
 * Generate a meeting summary
 */
export async function summarizeMeeting(
  text: string,
  format: 'brief' | 'detailed' | 'executive' = 'brief'
): Promise<string> {
  const instructions = {
    brief: 'Create a 2-3 sentence summary highlighting the main points',
    detailed: 'Create a comprehensive summary with key points, decisions, and action items',
    executive: `Create an executive summary with:
1. Key decisions made
2. Action items with owners
3. Next steps and timeline`
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `${instructions[format]}:

Meeting text:
${text}`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  return content.text
}

/**
 * Generate a comprehensive meeting summary with structured data
 */
export async function generateFullSummary(text: string): Promise<MeetingSummary> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `Analyze this meeting text and create a comprehensive summary in JSON format:

{
  "summary": "1-2 sentence overview of the meeting",
  "keyPoints": ["key point 1", "key point 2", ...],
  "decisions": ["decision 1", "decision 2", ...],
  "actionItems": [
    {
      "task": "task description",
      "assignee": "person name or null",
      "deadline": "deadline or null",
      "priority": "low|medium|high or null"
    }
  ],
  "nextSteps": ["next step 1", "next step 2", ...]
}

Meeting text:
${text}

Return ONLY the JSON object, no additional text.`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  try {
    // Extract JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const summary = JSON.parse(jsonMatch[0])
    return summary
  } catch (error: any) {
    console.error('Failed to parse meeting summary:', error)
    // Return a basic structure if parsing fails
    return {
      summary: 'Failed to parse meeting summary',
      keyPoints: [],
      decisions: [],
      actionItems: [],
      nextSteps: []
    }
  }
}

/**
 * Identify participants from meeting transcript
 */
export async function identifyParticipants(text: string): Promise<string[]> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Identify all participants/attendees mentioned in this meeting text.
Return ONLY a JSON array of names, like: ["Alice", "Bob", "Charlie"]

Meeting text:
${text}`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  try {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return []
    }

    return JSON.parse(jsonMatch[0])
  } catch (error: any) {
    console.error('Failed to parse participants:', error)
    return []
  }
}

/**
 * Extract key decisions from meeting
 */
export async function extractDecisions(text: string): Promise<string[]> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Extract all decisions made during this meeting.
Return ONLY a JSON array of decision strings, like: ["We will launch on June 1st", "Budget approved for $50k"]

Meeting text:
${text}`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  try {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return []
    }

    return JSON.parse(jsonMatch[0])
  } catch (error: any) {
    console.error('Failed to parse decisions:', error)
    return []
  }
}

/**
 * Generate meeting minutes (formal document)
 */
export async function generateMeetingMinutes(
  meetingTitle: string,
  date: string,
  attendees: string[],
  text: string
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `Generate formal meeting minutes for this meeting:

Title: ${meetingTitle}
Date: ${date}
Attendees: ${attendees.join(', ')}

Meeting content:
${text}

Format the minutes in a professional format with:
1. Meeting details (title, date, attendees)
2. Agenda items discussed
3. Key points and discussions
4. Decisions made
5. Action items with owners and deadlines
6. Next meeting date/time (if mentioned)

Use proper business document formatting.`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  return content.text
}
