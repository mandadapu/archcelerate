import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Citations, Citation } from '@/components/mentor/Citations'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  userName?: string
  citations?: Citation[]
}

export function ChatMessage({ role, content, timestamp, userName, citations }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className={cn(
          isUser ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
        )}>
          {isUser ? (userName?.[0]?.toUpperCase() || 'U') : 'AI'}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex flex-col max-w-[80%]', isUser && 'items-end')}>
        <div className={cn(
          'rounded-lg px-4 py-2',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-900'
        )}>
          <div className="prose prose-sm max-w-none">
            {content.split('\n').map((line, i) => (
              <p key={i} className={cn('mb-2 last:mb-0', isUser && 'text-white')}>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Show citations for assistant messages */}
        {!isUser && citations && citations.length > 0 && (
          <div className="mt-2 w-full">
            <Citations citations={citations} />
          </div>
        )}

        {timestamp && (
          <span className="text-xs text-slate-500 mt-1">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}
