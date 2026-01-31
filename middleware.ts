import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware doesn't check auth - we let the dashboard layout handle it
// This prevents redirect loops with NextAuth
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
