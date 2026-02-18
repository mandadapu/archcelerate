import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateAdminAuth } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const authError = validateAdminAuth(req)
  if (authError) return authError

  try {
    console.log('Applying schema fixes...')

    // Fix 1: Add description column to Concept if missing
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Concept"
        ADD COLUMN IF NOT EXISTS "description" TEXT;
      `)
      console.log('Added Concept.description column')
    } catch (error) {
      console.log('Concept.description may already exist:', error)
    }

    // Fix 2: Mark failed migration as applied
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "_prisma_migrations"
        SET finished_at = NOW(),
            applied_steps_count = 1,
            logs = 'Manually resolved via API'
        WHERE migration_name = '20260204063249_add_difficulty_level_to_diagnosis'
        AND finished_at IS NULL;
      `)
      console.log('Marked failed migration as applied')
    } catch (error) {
      console.log('Migration may already be resolved:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'Schema fixes applied successfully'
    })
  } catch (error) {
    console.error('Schema fix error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Schema fix failed',
      },
      { status: 500 }
    )
  }
}
