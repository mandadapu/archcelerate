/**
 * @jest-environment node
 */

/**
 * Tests for middleware.ts.
 *
 * Middleware enforces auth on /api/* routes by checking for a session cookie.
 * These tests verify:
 * 1. www → non-www redirect still works
 * 2. Public routes are allowed without auth (/api/health, /api/auth/*)
 * 3. Protected /api/* routes return 401 without a session cookie
 * 4. Protected /api/* routes pass with a session cookie
 * 5. Non-API routes (pages) pass through without auth check
 * 6. Admin routes pass through (they have their own ADMIN_API_KEY auth)
 */

import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

function createRequest(url: string, host = 'archcelerate.com', cookies?: Record<string, string>): NextRequest {
  const req = new NextRequest(url, {
    headers: { host },
  })
  if (cookies) {
    for (const [name, value] of Object.entries(cookies)) {
      req.cookies.set(name, value)
    }
  }
  return req
}

const SESSION_COOKIE = { '__Secure-next-auth.session-token': 'session-id-abc' }
const DEV_SESSION_COOKIE = { 'next-auth.session-token': 'session-id-abc' }

describe('middleware', () => {
  describe('www redirect (existing behavior)', () => {
    it('redirects www to non-www with 301', async () => {
      const req = createRequest('https://www.archcelerate.com/dashboard', 'www.archcelerate.com')
      const res = await middleware(req)
      expect(res.status).toBe(301)
      expect(res.headers.get('location')).toContain('archcelerate.com/dashboard')
      expect(res.headers.get('location')).not.toContain('www.')
    })
  })

  describe('public API routes (no auth required)', () => {
    it('allows /api/health without auth', async () => {
      const req = createRequest('https://archcelerate.com/api/health')
      const res = await middleware(req)
      expect(res.status).not.toBe(401)
      expect(res.status).not.toBe(301)
    })

    it('allows /api/auth/signin without auth', async () => {
      const req = createRequest('https://archcelerate.com/api/auth/signin/github')
      const res = await middleware(req)
      expect(res.status).not.toBe(401)
    })

    it('allows /api/auth/callback without auth', async () => {
      const req = createRequest('https://archcelerate.com/api/auth/callback/github')
      const res = await middleware(req)
      expect(res.status).not.toBe(401)
    })
  })

  describe('admin routes (own auth via ADMIN_API_KEY)', () => {
    it('allows /api/admin/* to pass through (has its own auth)', async () => {
      const req = createRequest('https://archcelerate.com/api/admin/seed')
      const res = await middleware(req)
      expect(res.status).not.toBe(401)
    })
  })

  describe('protected API routes', () => {
    it('returns 401 for /api/chat/stream without session cookie', async () => {
      const req = createRequest('https://archcelerate.com/api/chat/stream')
      const res = await middleware(req)
      expect(res.status).toBe(401)
    })

    it('returns 401 for /api/quiz/concept without session cookie', async () => {
      const req = createRequest('https://archcelerate.com/api/quiz/concept?slug=test&title=test')
      const res = await middleware(req)
      expect(res.status).toBe(401)
    })

    it('returns 401 for /api/skill-diagnosis without session cookie', async () => {
      const req = createRequest('https://archcelerate.com/api/skill-diagnosis')
      const res = await middleware(req)
      expect(res.status).toBe(401)
    })

    it('allows protected API routes with __Secure- session cookie', async () => {
      const req = createRequest('https://archcelerate.com/api/chat/stream', 'archcelerate.com', SESSION_COOKIE)
      const res = await middleware(req)
      expect(res.status).not.toBe(401)
    })

    it('allows protected API routes with dev session cookie', async () => {
      const req = createRequest('https://archcelerate.com/api/skill-diagnosis', 'archcelerate.com', DEV_SESSION_COOKIE)
      const res = await middleware(req)
      expect(res.status).not.toBe(401)
    })
  })

  describe('non-API routes (pages)', () => {
    it('allows page routes without auth check', async () => {
      const req = createRequest('https://archcelerate.com/dashboard')
      const res = await middleware(req)
      expect(res.status).not.toBe(401)
    })

    it('allows root page without auth', async () => {
      const req = createRequest('https://archcelerate.com/')
      const res = await middleware(req)
      expect(res.status).not.toBe(401)
    })
  })
})
