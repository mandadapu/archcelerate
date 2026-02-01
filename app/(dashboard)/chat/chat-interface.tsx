'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageSquare,
  Send,
  Plus,
  Shield,
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface Props {
  userId: string
  initialConversations: Conversation[]
}

export function ChatInterface({ userId, initialConversations }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [governanceMetrics, setGovernanceMetrics] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load conversation messages
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId)
    }
  }, [currentConversationId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversation(conversationId: string) {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  async function startNewConversation() {
    setCurrentConversationId(null)
    setMessages([])
    setError(null)
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)

    // Optimistically add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userMessage,
          conversationId: currentConversationId
        })
      })

      const data = await res.json()

      if (!res.ok) {
        // Handle errors
        if (res.status === 429) {
          const resetDate = new Date(data.resetAt)
          setError(`Rate limit exceeded. Try again at ${resetDate.toLocaleTimeString()}`)
        } else if (res.status === 402) {
          setError('Monthly budget exceeded. Please upgrade your plan.')
        } else if (res.status === 400) {
          setError(data.error || 'Invalid request')
        } else {
          setError('Failed to send message. Please try again.')
        }

        // Remove optimistic user message on error
        setMessages(prev => prev.slice(0, -1))
        setInput(userMessage) // Restore input
        return
      }

      // Add assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }])

      // Update conversation ID if this was a new conversation
      if (!currentConversationId && data.conversationId) {
        setCurrentConversationId(data.conversationId)

        // Fetch updated conversations list
        const convRes = await fetch('/api/conversations')
        if (convRes.ok) {
          const convData = await convRes.json()
          setConversations(convData.conversations || [])
        }
      }

      // Update governance metrics
      setGovernanceMetrics({
        usage: data.usage,
        rateLimit: data.rateLimit,
        budget: data.budget
      })

    } catch (error) {
      console.error('Send message error:', error)
      setError('Network error. Please check your connection.')
      setMessages(prev => prev.slice(0, -1))
      setInput(userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Sidebar - Conversations */}
      <Card className="w-64 flex flex-col">
        <div className="p-4 border-b">
          <Button
            onClick={startNewConversation}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setCurrentConversationId(conv.id)}
                className={`w-full text-left p-3 rounded-lg hover:bg-accent transition-colors ${
                  currentConversationId === conv.id ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conv.title || 'New Conversation'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Governance Metrics */}
        {governanceMetrics && (
          <div className="p-4 border-t space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              Governance
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Activity className="h-3 w-3" />
                  Rate Limit
                </span>
                <span className="font-medium">
                  {governanceMetrics.rateLimit.remaining}/10
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  Budget
                </span>
                <span className="font-medium">
                  ${governanceMetrics.budget.remaining.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  Cost
                </span>
                <span className="font-medium">
                  ${governanceMetrics.usage.cost.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Production Chat Assistant
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            With comprehensive governance: validation, moderation, rate limiting, cost tracking
          </p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Start a new conversation</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ask anything - all requests are governed and monitored
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse">Thinking...</div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Governed chat: Rate limited (10 msg/min) • Budget tracked • Content moderated
          </p>
        </div>
      </Card>
    </div>
  )
}
