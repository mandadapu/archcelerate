// app/api/conversations/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Fetch user's conversations
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', session.user.id)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch conversations:', error)
    return Response.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }

  return Response.json({ conversations })
}
