// app/api/workflows/[workflowId]/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ workflowId: string }>
}

// GET /api/workflows/:id — Get workflow detail
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { workflowId } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const { data: workflow, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .single()

  if (error || !workflow) {
    return Response.json({ error: 'Workflow not found' }, { status: 404 })
  }

  // Check ownership (unless template)
  if (workflow.user_id !== session.user.id && !workflow.is_template) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  return Response.json({ workflow })
}

// PUT /api/workflows/:id — Update workflow
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { workflowId } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const body = await request.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.length > 200) {
      return Response.json({ error: 'Invalid name' }, { status: 400 })
    }
    updates.name = body.name
  }

  if (body.description !== undefined) {
    updates.description = body.description
  }

  if (body.definition !== undefined) {
    if (!Array.isArray(body.definition.nodes) || !Array.isArray(body.definition.edges)) {
      return Response.json({ error: 'Invalid definition' }, { status: 400 })
    }
    const defSize = JSON.stringify(body.definition).length
    if (defSize > 100000) {
      return Response.json({ error: 'Definition too large' }, { status: 400 })
    }
    updates.definition = body.definition
  }

  if (body.status !== undefined) {
    if (!['draft', 'published'].includes(body.status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 })
    }
    updates.status = body.status
  }

  const { data: workflow, error } = await supabase
    .from('workflows')
    .update(updates)
    .eq('id', workflowId)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error || !workflow) {
    return Response.json({ error: 'Workflow not found' }, { status: 404 })
  }

  return Response.json({ workflow })
}

// DELETE /api/workflows/:id — Delete workflow
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { workflowId } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', workflowId)
    .eq('user_id', session.user.id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
