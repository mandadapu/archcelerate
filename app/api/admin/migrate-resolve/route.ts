import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { migration, action } = body // action: 'rollback' or 'applied'

    if (!migration || !action) {
      return NextResponse.json(
        { error: 'Missing migration name or action' },
        { status: 400 }
      )
    }

    console.log(`🔧 Resolving migration ${migration} as ${action}...`)

    // Run prisma migrate resolve
    const { stdout, stderr } = await execAsync(
      `npx prisma migrate resolve --${action} "${migration}"`,
      {
        cwd: process.cwd(),
        env: process.env,
        timeout: 120000
      }
    )

    console.log('Resolve output:', stdout)
    if (stderr) {
      console.error('Resolve stderr:', stderr)
    }

    return NextResponse.json({
      success: true,
      message: `Migration ${migration} marked as ${action}`,
      output: stdout,
      errors: stderr || null
    })
  } catch (error) {
    console.error('❌ Resolve error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Migration resolve failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stderr: error instanceof Error && 'stderr' in error ? (error as any).stderr : null
      },
      { status: 500 }
    )
  }
}
