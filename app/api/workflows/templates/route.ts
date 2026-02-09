// app/api/workflows/templates/route.ts
import { createClient } from '@/lib/supabase/server'
import { WORKFLOW_TEMPLATES } from '@/lib/workflows/templates'

// GET /api/workflows/templates — List template workflows
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Return in-memory templates (no DB dependency needed)
  return Response.json({ templates: WORKFLOW_TEMPLATES })
}
