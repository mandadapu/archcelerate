// app/(dashboard)/workflows/page.tsx
import { WorkflowList } from '@/components/workflows/workflow-list'

export const metadata = {
  title: 'AI Workflows | AI Architect Accelerator',
  description: 'Build, run, and manage AI-powered workflows',
}

export default function WorkflowsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">AI Workflows</h1>
        <p className="text-slate-600 mt-2">
          Build, run, and scale AI-powered workflows. Connect data, APIs, and models
          in a visual builder.
        </p>
      </div>

      <WorkflowList />
    </div>
  )
}
