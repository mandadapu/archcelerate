import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from './chat-interface'

export const metadata: Metadata = {
  title: 'Chat - Production Chat Assistant',
  description: 'Chat with production-ready AI assistant with full governance'
}

export default async function ChatPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(20)

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatInterface
        userId={user.id}
        initialConversations={conversations || []}
      />
    </div>
  )
}
