'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function MentorConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const isNew = conversationId === 'new'

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState<string>()

  // Load existing conversation
  useEffect(() => {
    if (!isNew) {
      loadConversation()
    }
    loadUserName()
  }, [conversationId])

  const loadConversation = async () => {
    try {
      const response = await fetch(`/api/mentor/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const loadUserName = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserName(data.name)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemPrompt: MENTOR_SYSTEM_PROMPT,
          conversationId: isNew ? generateId() : conversationId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          aiResponse += chunk

          // Update UI with streaming response
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage?.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: aiResponse },
              ]
            } else {
              return [
                ...prev,
                {
                  role: 'assistant',
                  content: aiResponse,
                  timestamp: new Date().toISOString(),
                },
              ]
            }
          })
        }
      }

      // If this was a new conversation, redirect to the saved one
      if (isNew) {
        const newId = generateId()
        router.push(`/mentor/${newId}`)
      }
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {isNew ? 'New Conversation' : 'AI Mentor Chat'}
        </h1>
        <Button variant="outline" onClick={() => router.push('/mentor')}>
          Back to Conversations
        </Button>
      </div>

      <ChatContainer
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        userName={userName}
        placeholder="Ask me anything about AI development..."
      />
    </div>
  )
}

const MENTOR_SYSTEM_PROMPT = `You are an AI mentor for the AI Architect Accelerator program. Your role is to help learners understand concepts, debug code, and complete projects.

Guidelines:
- Provide guidance without giving away complete solutions
- Ask probing questions to help learners think through problems
- Be encouraging and supportive
- Keep responses concise and actionable
- Use examples when explaining concepts
- If you don&apos;t know something, say so honestly`

function generateId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
