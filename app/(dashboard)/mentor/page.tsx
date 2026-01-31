import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function MentorPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect('/login')
  }

  // Get recent conversations
  const conversations = await prisma.mentorConversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Mentor</h1>
          <p className="text-slate-600 mt-2">
            Your 24/7 AI learning assistant
          </p>
        </div>
        <Link href="/mentor/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            New Conversation
          </Button>
        </Link>
      </div>

      {conversations && conversations.length > 0 ? (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const messages = conv.messages as any[]
            const firstUserMessage = messages.find(m => m.role === 'user')
            const title = conv.title || firstUserMessage?.content.slice(0, 60) + '...' || 'Untitled'

            return (
              <Link key={conv.id} href={`/mentor/${conv.id}`}>
                <Card className="hover:border-blue-300 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>
                      {messages.length} messages • Last updated{' '}
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">
                No conversations yet. Start chatting with your AI mentor!
              </p>
              <Link href="/mentor/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Start First Conversation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
