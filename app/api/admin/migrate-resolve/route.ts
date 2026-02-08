import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const ALLOWED_ACTIONS = ['applied', 'rolled-back'] as const

// Prisma migration names: timestamp + snake_case (e.g. 20260208090233_add_tour_tracking)
const MIGRATION_NAME_REGEX = /^\d{14}_[a-z0-9_]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { migration, action } = body

    if (!migration || !action) {
      return NextResponse.json(
        { error: 'Missing migration name or action' },
        { status: 400 }
      )
    }

    // Validate action against allowlist
    if (!ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${ALLOWED_ACTIONS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate migration name format
    if (!MIGRATION_NAME_REGEX.test(migration)) {
      return NextResponse.json(
        { error: 'Invalid migration name format' },
        { status: 400 }
      )
    }

    console.log(`Resolving migration ${migration} as ${action}...`)

    // Use execFile instead of exec to avoid shell injection
    const { stdout, stderr } = await execFileAsync(
      'npx',
      ['prisma', 'migrate', 'resolve', `--${action}`, migration],
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
    console.error('Resolve error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Migration resolve failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stderr: error instanceof Error && 'stderr' in error ? (error as Record<string, unknown>).stderr : null
      },
      { status: 500 }
    )
  }
}
