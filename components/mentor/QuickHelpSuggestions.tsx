'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface QuickHelpSuggestionsProps {
  onSelect: (prompt: string) => void
  conceptTitle?: string
}

export function QuickHelpSuggestions({
  onSelect,
  conceptTitle,
}: QuickHelpSuggestionsProps) {
  const suggestions = conceptTitle
    ? [
        `Explain ${conceptTitle} in simple terms`,
        `Give me a real-world example of ${conceptTitle}`,
        `What are common mistakes with ${conceptTitle}?`,
        `How does ${conceptTitle} work under the hood?`,
      ]
    : [
        'What should I focus on learning right now?',
        'Review my progress and suggest next steps',
        'Explain the difference between prompting and fine-tuning',
        'How do I debug LLM API errors?',
      ]

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-slate-700 mb-3">
        💡 Quick help:
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {suggestions.map((suggestion, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            onClick={() => onSelect(suggestion)}
            className="text-left h-auto py-2 px-3 whitespace-normal"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </Card>
  )
}
