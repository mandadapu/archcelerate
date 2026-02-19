// app/api/workflows/templates/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { WORKFLOW_TEMPLATES } from '@/lib/workflows/templates'

// GET /api/workflows/templates — List template workflows
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Return in-memory templates (no DB dependency needed)
  return Response.json({ templates: WORKFLOW_TEMPLATES })
}
