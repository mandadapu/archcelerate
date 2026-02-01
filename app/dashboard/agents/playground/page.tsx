import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AgentPlayground } from './agent-playground'

export const metadata: Metadata = {
  title: 'Agent Playground',
  description: 'Test AI agent patterns interactively'
}

export default async function PlaygroundPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Agent Playground</h1>
          <p className="text-muted-foreground mt-2">
            Test the three agent patterns you learned in Week 5
          </p>
        </div>

        <AgentPlayground />
      </div>
    </div>
  )
}
