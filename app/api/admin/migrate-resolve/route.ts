// sast_003: suppressed - using execFile with array args (not shell=True), input validated via regex and allowlist
import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
const ALLOWED_ACTIONS = ['applied', 'rolled-back'] as const

// Prisma migration names: timestamp + snake_case (e.g. 20260208090233_add_tour_tracking)
const MIGRATION_NAME_REGEX = /^\d{14}_[a-z0-9_]{1,85}$/
const MAX_MIGRATION_NAME_LENGTH = 100

export async function POST(req: NextRequest) {
  const authError = validateAdminAuth(req)
    }

    // Validate migration name format
    if (typeof migration !== 'string' || migration.length > MAX_MIGRATION_NAME_LENGTH || !MIGRATION_NAME_REGEX.test(migration)) {
      return NextResponse.json(
        { error: 'Invalid migration name format' },
        { status: 400 }
    console.log(`Resolving migration ${migration} as ${action}...`)

    // Use execFile instead of exec to avoid shell injection
    const filteredEnv = {
      DATABASE_URL: process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      PATH: process.env.PATH,
    }

    const { stdout, stderr } = await execFileAsync(
      'npx',
      ['prisma', 'migrate', 'resolve', `--${action}`, migration],
      {
        cwd: process.cwd(),
        env: filteredEnv,
        timeout: 120000
      }
    )
      message: `Migration ${migration} marked as ${action}`,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    if (errorMessage.includes('timeout')) {
      console.error('Resolve timeout:', errorMessage)
    } else if (errorMessage.includes('ENOENT')) {
      console.error('Resolve command not found:', errorMessage)
    } else {
      console.error('Resolve execution error:', errorMessage)
    }

    return NextResponse.json(
      {
```