'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { QuickHelpSuggestions } from '@/components/mentor/QuickHelpSuggestions'

interface Citation {
  id: number
  title: string
  type: string
  weekNumber: number | null
  heading: string | null
  isUserContent: boolean
  author?: {
    name: string | null
    email: string | null
  }
  similarity: number
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  citations?: Citation[]
}

interface MentorContext {
  sprintId?: string
  conceptId?: string
  conceptTitle?: string
  conversationId?: string
}

export default function MentorConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const isNew = conversationId === 'new'

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState<string>()
  const [context, setContext] = useState<MentorContext>()

  // Load context from session storage or existing conversation
  useEffect(() => {
    if (isNew) {
      const storedContext = sessionStorage.getItem('mentor_context')
      if (storedContext) {
        const parsed = JSON.parse(storedContext)
        setContext(parsed)
        sessionStorage.removeItem('mentor_context')
      }
    } else {
      loadConversation()
    }
    loadUserName()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isNew])

  async function loadConversation() {
    try {
      const response = await fetch(`/api/mentor/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])

        // Load context from conversation
        if (data.contextSprint) {
          setContext({
            sprintId: data.contextSprint,
            conceptId: data.contextConcept,
          })
        }
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  async function loadUserName() {
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
          conversationId: context?.conversationId || conversationId,
          sprintId: context?.sprintId,
          conceptId: context?.conceptId,
        }),
      })

      if (response.status === 429) {
        const data = await response.json()
        const resetTime = new Date(data.reset).toLocaleTimeString()
        toast.error('Rate limit reached', {
          description: `Please try again after ${resetTime}`,
        })
        setIsLoading(false)
        return
      }

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
      if (isNew && context?.conversationId) {
        router.push(`/mentor/${context.conversationId}`)
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isNew ? 'New Conversation' : 'AI Mentor Chat'}
          </h1>
          {context?.conceptTitle && (
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {context.sprintId?.replace('-', ' ').toUpperCase()}
              </span>
              <span className="text-sm text-slate-600">
                About: {context.conceptTitle}
              </span>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => router.push('/mentor')}>
          Back to Conversations
        </Button>
      </div>

      {context?.conceptTitle && messages.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💡 I&apos;m aware you&apos;re learning about <strong>{context.conceptTitle}</strong>{' '}
            {context.sprintId && `in ${context.sprintId.replace('-', ' ')}`}.
            Feel free to ask me anything about this concept!
          </p>
        </div>
      )}

      {messages.length === 0 && (
        <QuickHelpSuggestions
          onSelect={handleSendMessage}
          conceptTitle={context?.conceptTitle}
        />
      )}

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
