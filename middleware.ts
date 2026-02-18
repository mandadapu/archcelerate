import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// API routes that don't require authentication
const PUBLIC_API_ROUTES = ['/api/health', '/api/auth/']
// Admin routes use their own ADMIN_API_KEY auth
const ADMIN_API_PREFIX = '/api/admin/'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // Redirect www → non-www to match NEXTAUTH_URL (https://archcelerate.com)
  // This prevents OAuth CSRF cookie mismatches between www and non-www
  if (hostname.startsWith('www.')) {
    const newUrl = new URL(request.url)
    newUrl.host = hostname.replace('www.', '')
    return NextResponse.redirect(newUrl, 301)
  }

  const { pathname } = request.nextUrl

  // Only enforce auth on /api/* routes (pages handle their own auth)
  if (pathname.startsWith('/api/')) {
    // Allow public API routes
    if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // Allow admin routes (they use ADMIN_API_KEY auth)
    if (pathname.startsWith(ADMIN_API_PREFIX)) {
      return NextResponse.next()
    }

    // Check for valid session token
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and _next internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
