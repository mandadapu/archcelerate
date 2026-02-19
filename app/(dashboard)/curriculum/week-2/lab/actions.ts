'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitLabExercise(
  labId: string,
  exerciseNumber: number,
  submission: string
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  // Upsert submission
  const { error } = await supabase
    .from('lab_submissions')
    .upsert({
      user_id: session.user.id,
      lab_id: labId,
      exercise_number: exerciseNumber,
      submission_data: { text: submission },
      completed: true,
      submitted_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,lab_id,exercise_number'
    })

  if (error) {
    console.error('Submission error:', error)
    throw new Error('Failed to submit exercise')
  }

  // Check if all exercises are completed
  const { data: lab } = await supabase
    .from('labs')
    .select('exercises, week_id')
    .eq('id', labId)
    .single()

  if (lab) {
    const totalExercises = (lab.exercises as any[]).length

    const { data: submissions } = await supabase
      .from('lab_submissions')
      .select('exercise_number')
      .eq('user_id', session.user.id)
      .eq('lab_id', labId)
      .eq('completed', true)

    const completedCount = submissions?.length || 0

    // Update week progress if lab is complete
    if (completedCount === totalExercises) {
      await supabase
        .from('user_week_progress')
        .upsert({
          user_id: session.user.id,
          week_id: lab.week_id,
          lab_completed: true,
          concepts_total: 3 // Week 2 has 3 concepts
        }, {
          onConflict: 'user_id,week_id'
        })
    }
  }

  revalidatePath('/curriculum/week-2/lab')
  revalidatePath('/curriculum/week-2')
}
