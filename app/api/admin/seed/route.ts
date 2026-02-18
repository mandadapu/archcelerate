import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { validateAdminAuth } from '@/lib/admin-auth'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  const authError = validateAdminAuth(req)
  if (authError) return authError

  try {
    console.log('Starting database seeding via npx tsx prisma/seed.ts...')

    const { stdout, stderr } = await execAsync('npx tsx prisma/seed.ts', {
      cwd: process.cwd(),
      env: process.env,
      timeout: 60000
    })

    console.log('Seed output:', stdout)
    if (stderr) {
      console.error('Seed stderr:', stderr)
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
    })
  } catch (error) {
    console.error('Seeding error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Seeding failed',
      },
      { status: 500 }
    )
  }
}
