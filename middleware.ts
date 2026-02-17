import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // Redirect www → non-www to match NEXTAUTH_URL (https://archcelerate.com)
  // This prevents OAuth CSRF cookie mismatches between www and non-www
  if (hostname.startsWith('www.')) {
    const newUrl = new URL(request.url)
    newUrl.host = hostname.replace('www.', '')
    return NextResponse.redirect(newUrl, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and _next internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
