import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { validateAdminAuth } from '@/lib/admin-auth'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  const authError = validateAdminAuth(req)
  if (authError) return authError

  try {
    console.log('Running database migrations...')

    const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
      cwd: process.cwd(),
      env: process.env,
      timeout: 120000
    })

    console.log('Migration output:', stdout)
    if (stderr) {
      console.error('Migration stderr:', stderr)
    }

    return NextResponse.json({
      success: true,
      message: 'Database migrations applied successfully',
    })
  } catch (error) {
    console.error('Migration error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
      },
      { status: 500 }
    )
  }
}
