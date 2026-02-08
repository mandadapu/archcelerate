import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EvaluationDashboard } from '@/components/rag/evaluation-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'RAG Evaluation | AI Architect Accelerator',
  description: 'Evaluate RAG system performance',
}

export default async function EvaluationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
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
