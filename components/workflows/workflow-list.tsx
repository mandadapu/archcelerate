'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface WorkflowSummary {
  id: string
  name: string
  description: string | null
  status: string
  is_template: boolean
  created_at: string
  updated_at: string
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  definition: unknown
}

export function WorkflowList() {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([])
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingFrom, setCreatingFrom] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [wfRes, tplRes] = await Promise.all([
          fetch('/api/workflows'),
          fetch('/api/workflows/templates'),
        ])
        if (wfRes.ok) {
          const data = await wfRes.json()
          setWorkflows(data.workflows || [])
        }
        if (tplRes.ok) {
          const data = await tplRes.json()
          setTemplates(data.templates || [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const createFromTemplate = async (template: WorkflowTemplate) => {
    setCreatingFrom(template.id)
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          definition: template.definition,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        window.location.href = `/workflows/${data.workflow.id}`
      }
    } finally {
      setCreatingFrom(null)
    }
  }

  const deleteWorkflow = async (id: string) => {
    const res = await fetch(`/api/workflows/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setWorkflows((wfs) => wfs.filter((w) => w.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* User's Workflows */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">My Workflows</h2>
          <Link href="/workflows/builder">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              + New Workflow
            </Button>
          </Link>
        </div>

        {workflows.length === 0 ? (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-slate-500 mb-2">No workflows yet</p>
              <p className="text-sm text-slate-400">
                Create a new workflow or start from a template below
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((wf) => (
              <Card key={wf.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{wf.name}</CardTitle>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      wf.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {wf.status}
                    </span>
                  </div>
                  {wf.description && (
                    <CardDescription className="line-clamp-2">
                      {wf.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400 mb-3">
                    Updated {new Date(wf.updated_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/workflows/${wf.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteWorkflow(wf.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Templates */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Templates</h2>
        <p className="text-sm text-slate-500 mb-4">
          Start from a pre-built template to learn common AI workflow patterns
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="border-blue-100 bg-blue-50/30 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    TEMPLATE
                  </span>
                  {tpl.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {tpl.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => createFromTemplate(tpl)}
                  disabled={creatingFrom === tpl.id}
                >
                  {creatingFrom === tpl.id ? 'Creating...' : 'Use Template'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
