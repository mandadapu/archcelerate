import { NextRequest, NextResponse } from 'next/server'

/**
 * Validate admin API key from the Authorization header.
 * Returns null if authorized, or a 401/403 NextResponse if not.
 *
 * Usage:
 *   const authError = validateAdminAuth(req)
 *   if (authError) return authError
 */
export function validateAdminAuth(req: NextRequest): NextResponse | null {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) {
    console.error('ADMIN_API_KEY is not configured — blocking admin access')
    return NextResponse.json(
      { error: 'Admin access is not configured' },
      { status: 403 }
    )
  }

  const authHeader = req.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return null
}
