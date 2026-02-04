'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

export interface Citation {
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

interface ChatContainerProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
  userName?: string
  placeholder?: string
}

export function ChatContainer({
  messages,
  onSendMessage,
  isLoading = false,
  userName,
  placeholder = 'Ask a question...',
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white">
      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              Start a conversation...
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                userName={userName}
                citations={message.citations}
              />
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 mb-4">
              <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <ChatInput
          onSend={onSendMessage}
          disabled={isLoading}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
