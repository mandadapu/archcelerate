export interface AISuggestion {
  type: 'improve' | 'expand' | 'simplify' | 'example'
  content: string
}

export async function getAISuggestion(
  selectedText: string,
  suggestionType: AISuggestion['type']
): Promise<string> {
  const prompts = {
    improve: `Improve the following educational content for clarity and engagement:\n\n${selectedText}`,
    expand: `Expand the following educational content with more details and examples:\n\n${selectedText}`,
    simplify: `Simplify the following educational content to make it easier to understand:\n\n${selectedText}`,
    example: `Provide a practical example to illustrate the following concept:\n\n${selectedText}`,
  }

  const response = await fetch('/api/editor/ai-suggest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: selectedText,
      prompt: prompts[suggestionType],
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get AI suggestion')
  }

  const data = await response.json()
  return data.suggestion
}
