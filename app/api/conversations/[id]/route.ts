// app/api/conversations/[id]/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const conversationId = id

  // Verify conversation belongs to user
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', session.user.id)
    .single()

  if (convError || !conversation) {
    return Response.json({ error: 'Conversation not found' }, { status: 404 })
  }

  // Fetch messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (messagesError) {
    console.error('Failed to fetch messages:', messagesError)
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }

  return Response.json({
    conversation,
    messages: messages || []
  })
}
