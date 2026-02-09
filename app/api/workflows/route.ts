// app/api/workflows/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/workflows — List user's workflows
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: workflows, error } = await supabase
    .from('workflows')
    .select('id, name, description, status, is_template, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ workflows })
}

// POST /api/workflows — Create a new workflow
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, definition } = body

  if (!name || typeof name !== 'string' || name.length > 200) {
    return Response.json({ error: 'Invalid name' }, { status: 400 })
  }

  if (!definition || !Array.isArray(definition.nodes) || !Array.isArray(definition.edges)) {
    return Response.json({ error: 'Invalid workflow definition' }, { status: 400 })
  }

  // Limit definition size
  const defSize = JSON.stringify(definition).length
  if (defSize > 100000) {
    return Response.json({ error: 'Workflow definition too large' }, { status: 400 })
  }

  const { data: workflow, error } = await supabase
    .from('workflows')
    .insert({
      user_id: user.id,
      name,
      description: description || null,
      definition,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ workflow }, { status: 201 })
}
