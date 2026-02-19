import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from './chat-interface'

export const metadata: Metadata = {
  title: 'Chat - Production Chat Assistant',
  description: 'Chat with production-ready AI assistant with full governance'
}

export default async function ChatPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/')
  }

  const supabase = await createClient()

  // Fetch user's conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })
    .limit(20)

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatInterface
        userId={session.user.id}
        initialConversations={conversations || []}
      />
    </div>
  )
}
