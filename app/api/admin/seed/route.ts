import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    // Optional: Add authentication check
    // const authHeader = req.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.ADMIN_SEED_TOKEN}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('🌱 Starting database seeding via npx tsx prisma/seed.ts...')

    // Run the seed script
    const { stdout, stderr } = await execAsync('npx tsx prisma/seed.ts', {
      cwd: process.cwd(),
      env: process.env,
      timeout: 60000 // 60 second timeout
    })

    console.log('Seed output:', stdout)
    if (stderr) {
      console.error('Seed stderr:', stderr)
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      output: stdout,
      errors: stderr || null
    })
  } catch (error) {
    console.error('❌ Seeding error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Seeding failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stderr: error instanceof Error && 'stderr' in error ? (error as any).stderr : null
      },
      { status: 500 }
    )
  }
}
