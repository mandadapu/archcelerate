'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitProject(data: {
  projectId: string
  weekId: string
  githubUrl: string
  deployedUrl: string
  writeupContent: string
  action: 'draft' | 'submit'
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  const status = data.action === 'submit' ? 'submitted' : 'draft'
  const now = new Date().toISOString()

  // Upsert project submission
  const { error } = await supabase
    .from('project_submissions')
    .upsert({
      user_id: session.user.id,
      project_id: data.projectId,
      github_url: data.githubUrl,
      deployed_url: data.deployedUrl,
      writeup_content: data.writeupContent,
      status,
      submitted_at: status === 'submitted' ? now : null,
      updated_at: now
    }, {
      onConflict: 'user_id,project_id'
    })

  if (error) {
    console.error('Project submission error:', error)
    throw new Error('Failed to submit project')
  }

  // If submitted, update week progress
  if (status === 'submitted') {
    await supabase
      .from('user_week_progress')
      .upsert({
        user_id: session.user.id,
        week_id: data.weekId,
        project_completed: true,
        concepts_total: 3, // Week 2 has 3 concepts
        completed_at: now
      }, {
        onConflict: 'user_id,week_id'
      })
  }

  revalidatePath('/curriculum/week-2/project')
  revalidatePath('/curriculum/week-2')
}
