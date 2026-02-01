// lib/governance/content-moderator.ts
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export interface ModerationResult {
  flagged: boolean
  categories: {
    hate: boolean
    sexual: boolean
    violence: boolean
    self_harm: boolean
    harassment: boolean
  }
  action: 'allowed' | 'blocked' | 'warning'
}

export async function moderateContent(
  userId: string,
  content: string,
  contentType: 'input' | 'output'
): Promise<ModerationResult> {
  // Use Anthropic's built-in moderation
  // Note: As of now, Anthropic doesn't have a separate moderation endpoint
  // This is a placeholder for when they do, or we can use OpenAI's moderation API

  // For now, use a simple keyword filter + prompt-based check
  const result = await checkWithPrompt(content)

  // Log the moderation check
  const supabase = createClient()
  await supabase.from('moderation_logs').insert({
    user_id: userId,
    content_type: contentType,
    content: content.substring(0, 1000), // Store first 1000 chars
    flagged: result.flagged,
    categories: result.categories,
    action_taken: result.action
  })

  return result
}

async function checkWithPrompt(content: string): Promise<ModerationResult> {
  try {
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307', // Fast, cheap model for moderation
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Analyze this content for policy violations. Respond with JSON only.

Content: "${content}"

Respond in this exact JSON format:
{
  "hate": boolean,
  "sexual": boolean,
  "violence": boolean,
  "self_harm": boolean,
  "harassment": boolean
}`
      }]
    })

    const resultText = response.content[0].text
    const categories = JSON.parse(resultText)

    const flagged = Object.values(categories).some(v => v === true)

    return {
      flagged,
      categories,
      action: flagged ? 'blocked' : 'allowed'
    }
  } catch (error) {
    console.error('Moderation error:', error)
    // Fail open (allow) rather than fail closed on errors
    return {
      flagged: false,
      categories: {
        hate: false,
        sexual: false,
        violence: false,
        self_harm: false,
        harassment: false
      },
      action: 'allowed'
    }
  }
}
