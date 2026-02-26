import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'node:util'
import { validateAdminAuth } from '@/lib/admin-auth'

const execFileAsync = promisify(execFile)

  try {
    console.log('Running database migrations...')

    const { stdout, stderr } = await execFileAsync('npx', ['prisma', 'migrate', 'deploy'], {
      cwd: process.cwd(),
      env: process.env,
      timeout: 120000
```