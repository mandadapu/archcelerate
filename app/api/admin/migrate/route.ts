import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 Running database migrations...')

    // Run prisma migrate deploy
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
      cwd: process.cwd(),
      env: process.env,
      timeout: 120000 // 2 minute timeout
    })

    console.log('Migration output:', stdout)
    if (stderr) {
      console.error('Migration stderr:', stderr)
    }

    return NextResponse.json({
      success: true,
      message: 'Database migrations applied successfully',
      output: stdout,
      errors: stderr || null
    })
  } catch (error) {
    console.error('❌ Migration error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stderr: error instanceof Error && 'stderr' in error ? (error as any).stderr : null
      },
      { status: 500 }
    )
  }
}
