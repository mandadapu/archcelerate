'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AskMentorButtonProps {
  sprintId: string
  conceptId: string
  conceptTitle: string
}

export function AskMentorButton({
  sprintId,
  conceptId,
  conceptTitle,
}: AskMentorButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    // Create new conversation with context
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store context in session storage for the mentor page
    sessionStorage.setItem('mentor_context', JSON.stringify({
      sprintId,
      conceptId,
      conceptTitle,
      conversationId,
    }))

    router.push(`/mentor/${conversationId}`)
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className="gap-2"
    >
      <MessageCircle className="h-4 w-4" />
      Ask AI Mentor about this concept
    </Button>
  )
}
