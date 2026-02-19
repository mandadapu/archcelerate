import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EvaluationDashboard } from '@/components/rag/evaluation-dashboard'

export const metadata: Metadata = {
  title: 'RAG Evaluation | AI Architect Accelerator',
  description: 'Evaluate RAG system performance',
}

export default async function EvaluationPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/')
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">RAG System Evaluation</h1>
          <p className="text-muted-foreground mt-2">
            Test your RAG system&apos;s performance with automated evaluation metrics
          </p>
        </div>

        <EvaluationDashboard />
      </div>
    </div>
  )
}
