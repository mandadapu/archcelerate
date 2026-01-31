# Week 1: Setup & Authentication Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up Next.js project with Supabase authentication and basic dashboard UI

**Architecture:** Next.js 14 App Router with TypeScript, Supabase for database and auth, Tailwind CSS for styling, shadcn/ui for components

**Tech Stack:** Next.js 14, React 18, TypeScript, Supabase, Tailwind CSS, shadcn/ui

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: Project root directory structure
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`

**Step 1: Create Next.js project with TypeScript**

Run:
```bash
npx create-next-app@latest aicelerate --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd aicelerate
```

Expected: New Next.js project created with App Router

**Step 2: Install additional dependencies**

Run:
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install -D @types/node
```

Expected: Dependencies installed successfully

**Step 3: Create project structure**

Run:
```bash
mkdir -p app/api
mkdir -p app/(auth)/login
mkdir -p app/(auth)/signup
mkdir -p app/(dashboard)/dashboard
mkdir -p lib
mkdir -p components/ui
mkdir -p types
```

Expected: Directory structure created

**Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Next.js project with TypeScript and Tailwind"
```

---

## Task 2: Set Up Supabase Project

**Files:**
- Create: `.env.local`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`

**Step 1: Create Supabase project**

Manual action:
1. Go to https://supabase.com
2. Create new project: "aicelerate"
3. Note down Project URL and anon public key
4. Wait for project to be ready

**Step 2: Create environment variables file**

Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Step 3: Create Supabase client utility**

Create `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 4: Create Supabase server utility**

Create `lib/supabase/server.ts`:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**Step 5: Add .env.local to .gitignore**

Verify `.gitignore` contains:
```
.env*.local
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: configure Supabase client and server utilities"
```

---

## Task 3: Create Database Schema

**Files:**
- Create: `supabase/migrations/20260130_initial_schema.sql`

**Step 1: Create migrations directory**

Run:
```bash
mkdir -p supabase/migrations
```

**Step 2: Create initial schema migration**

Create `supabase/migrations/20260130_initial_schema.sql`:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    experience_years INT,
    target_role VARCHAR(100),
    onboarded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own data"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Learning Events table
CREATE TABLE public.learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    occurred_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own events"
ON public.learning_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
ON public.learning_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_events_user_time ON public.learning_events(user_id, occurred_at DESC);
CREATE INDEX idx_events_type ON public.learning_events(event_type, occurred_at DESC);
```

**Step 3: Run migration on Supabase**

Manual action:
1. Go to Supabase dashboard → SQL Editor
2. Copy and paste the migration SQL
3. Run the query
4. Verify tables created in Table Editor

Expected: Tables `users` and `learning_events` created with RLS policies

**Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add initial database schema with users and events tables"
```

---

## Task 4: Create TypeScript Types

**Files:**
- Create: `types/database.ts`
- Create: `types/user.ts`

**Step 1: Create database types**

Create `types/database.ts`:
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          experience_years: number | null
          target_role: string | null
          onboarded_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          experience_years?: number | null
          target_role?: string | null
          onboarded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          experience_years?: number | null
          target_role?: string | null
          onboarded_at?: string | null
          created_at?: string
        }
      }
      learning_events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_data: Json | null
          occurred_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_data?: Json | null
          occurred_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          event_data?: Json | null
          occurred_at?: string
        }
      }
    }
  }
}
```

**Step 2: Create user types**

Create `types/user.ts`:
```typescript
export interface User {
  id: string
  email: string
  name: string | null
  experienceYears: number | null
  targetRole: string | null
  onboardedAt: string | null
  createdAt: string
}

export interface UserProfile {
  name: string
  experienceYears: number
  targetRole: 'ai_architect' | 'ml_engineer' | 'ai_product_builder'
}
```

**Step 3: Commit**

```bash
git add types/
git commit -m "feat: add TypeScript types for database and user models"
```

---

## Task 5: Install and Configure shadcn/ui

**Files:**
- Create: `components.json`
- Modify: `tailwind.config.ts`
- Create: `lib/utils.ts`

**Step 1: Initialize shadcn/ui**

Run:
```bash
npx shadcn-ui@latest init
```

When prompted, choose:
- TypeScript: Yes
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Import alias: @/components

Expected: shadcn/ui configured

**Step 2: Install initial components**

Run:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add toast
```

Expected: Components added to `components/ui/`

**Step 3: Verify utils file exists**

Check that `lib/utils.ts` exists with:
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: configure shadcn/ui with base components"
```

---

## Task 6: Create Authentication Pages - Signup

**Files:**
- Create: `app/(auth)/signup/page.tsx`
- Create: `app/(auth)/layout.tsx`
- Create: `app/api/auth/signup/route.ts`

**Step 1: Create auth layout**

Create `app/(auth)/layout.tsx`:
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md p-8">
        {children}
      </div>
    </div>
  )
}
```

**Step 2: Create signup page**

Create `app/(auth)/signup/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            name,
          })

        if (profileError) throw profileError

        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Build 7 AI products in 12 weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
          <p className="text-sm text-center text-slate-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
```

**Step 3: Test signup page**

Run:
```bash
npm run dev
```

Navigate to: http://localhost:3000/signup
Expected: Signup form displays correctly

**Step 4: Commit**

```bash
git add app/
git commit -m "feat: add signup page with form and Supabase integration"
```

---

## Task 7: Create Authentication Pages - Login

**Files:**
- Create: `app/(auth)/login/page.tsx`

**Step 1: Create login page**

Create `app/(auth)/login/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Log in to continue your learning journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </Button>
          <p className="text-sm text-center text-slate-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Test login page**

Navigate to: http://localhost:3000/login
Expected: Login form displays correctly

**Step 3: Commit**

```bash
git add app/
git commit -m "feat: add login page with authentication"
```

---

## Task 8: Create Protected Dashboard

**Files:**
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/(dashboard)/dashboard/page.tsx`
- Create: `middleware.ts`

**Step 1: Create middleware for auth protection**

Create `middleware.ts` at project root:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated and trying to access protected route
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if authenticated and trying to access auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
```

**Step 2: Create dashboard layout**

Create `app/(dashboard)/layout.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">
                AI Architect Accelerator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">{user.email}</span>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
```

**Step 3: Create dashboard page**

Create `app/(dashboard)/dashboard/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          Welcome back, {profile?.name || 'there'}!
        </h2>
        <p className="text-slate-600 mt-2">
          Ready to build AI products?
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sprint 0</CardTitle>
            <CardDescription>Skill Diagnosis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Take a quick assessment to personalize your learning path
            </p>
            <div className="mt-4">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                Not started
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint 1</CardTitle>
            <CardDescription>Foundation + Chat Assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Learn LLM fundamentals and build your first AI product
            </p>
            <div className="mt-4">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                Locked
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Mentor</CardTitle>
            <CardDescription>24/7 Support</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Get help from your AI learning assistant anytime
            </p>
            <div className="mt-4">
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                Available
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 4: Create signout API route**

Create `app/api/auth/signout/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
```

**Step 5: Test protected dashboard**

1. Navigate to http://localhost:3000/dashboard (should redirect to login)
2. Sign up with a new account
3. Should redirect to dashboard automatically
4. Verify dashboard displays welcome message and cards

Expected: Dashboard only accessible when logged in

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add protected dashboard with middleware and navigation"
```

---

## Task 9: Create Home/Landing Page

**Files:**
- Create: `app/page.tsx`

**Step 1: Create landing page**

Replace `app/page.tsx`:
```typescript
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-white">
              AI Architect Accelerator
            </h1>
            <div className="space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Build 7 AI Products in 12 Weeks
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Transform from Software Engineer to AI Product Builder through
            project-based learning. Learn by shipping, not by watching.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start building →
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">7</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Deployed Projects
            </h3>
            <p className="text-slate-400 text-sm">
              Build real AI products from chat assistants to production systems
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              AI Mentor
            </h3>
            <p className="text-slate-400 text-sm">
              Get instant help with code reviews and debugging anytime
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">12</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Weeks to Job-Ready
            </h3>
            <p className="text-slate-400 text-sm">
              Complete the program and be ready for AI Architect interviews
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
```

**Step 2: Test landing page**

Navigate to: http://localhost:3000/
Expected: Landing page displays with hero section and feature cards

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add landing page with call-to-action"
```

---

## Task 10: Add Loading and Error States

**Files:**
- Create: `app/(dashboard)/loading.tsx`
- Create: `app/(dashboard)/error.tsx`
- Create: `app/(auth)/loading.tsx`

**Step 1: Create dashboard loading state**

Create `app/(dashboard)/loading.tsx`:
```typescript
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-slate-200 rounded animate-pulse w-1/3" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="h-6 bg-slate-200 rounded animate-pulse w-1/2 mb-4" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-full mb-2" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Create dashboard error state**

Create `app/(dashboard)/error.tsx`:
```typescript
'use client'

import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        Something went wrong
      </h2>
      <p className="text-slate-600 mb-6">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

**Step 3: Create auth loading state**

Create `app/(auth)/loading.tsx`:
```typescript
export default function AuthLoading() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
          <div className="space-y-3 pt-4">
            <div className="h-10 bg-slate-200 rounded animate-pulse" />
            <div className="h-10 bg-slate-200 rounded animate-pulse" />
            <div className="h-10 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add app/
git commit -m "feat: add loading and error states for better UX"
```

---

## Task 11: Final Testing and Deployment Setup

**Files:**
- Create: `vercel.json`
- Create: `README.md`

**Step 1: Create Vercel configuration**

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

**Step 2: Update README**

Create `README.md`:
```markdown
# AI Architect Accelerator

Transform from Software Engineer to AI Product Builder in 12 weeks.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- shadcn/ui

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

Run the migration in `supabase/migrations/20260130_initial_schema.sql` via the Supabase SQL Editor.

## Deployment

Deploy to Vercel:
```bash
vercel
```

Set environment variables in Vercel dashboard.

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and Supabase clients
- `/types` - TypeScript type definitions
- `/supabase` - Database migrations

## Features (Week 1)

- ✅ User authentication (signup/login)
- ✅ Protected dashboard
- ✅ Basic navigation
- ✅ Supabase integration
```

**Step 3: Run full application test**

Manual testing checklist:
1. Start dev server: `npm run dev`
2. Visit homepage at http://localhost:3000/
3. Click "Get started" → should go to /signup
4. Create new account → should redirect to /dashboard
5. Sign out → should redirect to /login
6. Log in again → should redirect to /dashboard
7. Try accessing /dashboard when logged out → should redirect to /login

Expected: All flows work correctly

**Step 4: Commit**

```bash
git add .
git commit -m "chore: add Vercel config and update README"
```

---

## Task 12: Push to GitHub and Deploy

**Step 1: Create GitHub repository**

Manual action:
1. Go to GitHub.com
2. Create new repository: "aicelerate"
3. Don't initialize with README (we have one)

**Step 2: Push code to GitHub**

Run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/aicelerate.git
git branch -M main
git push -u origin main
```

Expected: Code pushed to GitHub

**Step 3: Deploy to Vercel**

Manual action:
1. Go to vercel.com
2. Import GitHub repository
3. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Deploy

Expected: Application deployed and accessible

**Step 4: Test production deployment**

1. Visit production URL
2. Test signup flow
3. Test login flow
4. Verify dashboard works

Expected: All features work in production

**Step 5: Final commit**

```bash
git add .
git commit -m "chore: Week 1 complete - setup and authentication ready"
git push
```

---

## Week 1 Completion Checklist

- [ ] Next.js project initialized with TypeScript and Tailwind
- [ ] Supabase project created and configured
- [ ] Database schema created (users, learning_events tables)
- [ ] TypeScript types defined
- [ ] shadcn/ui installed and configured
- [ ] Signup page working
- [ ] Login page working
- [ ] Protected dashboard with middleware
- [ ] Navigation and layout components
- [ ] Landing page created
- [ ] Loading and error states
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Production deployment tested

---

## Next Steps (Week 2)

After Week 1 is complete, proceed to Week 2: Skill Diagnosis (Sprint 0)

This will include:
- Quiz question bank
- Quiz UI with progress tracking
- AI integration for analysis
- Personalized learning path generation
