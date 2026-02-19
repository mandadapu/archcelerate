import { z } from 'zod'

const envSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database (Prisma)
  DATABASE_URL: z.string().min(1),

  // Redis
  REDIS_URL: z.string().min(1),

  // AI Services
  ANTHROPIC_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),
  VOYAGE_API_KEY: z.string().optional(),

  // Authentication (NextAuth.js)
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url(),

  // OAuth Providers
  GITHUB_ID: z.string().min(1),
  GITHUB_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),

  // Admin
  ADMIN_API_KEY: z.string().optional(),

  // External services
  GITHUB_TOKEN: z.string().optional(),
  E2B_API_KEY: z.string().optional(),

  // Monitoring (optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_AI_AGENTS: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_MULTIMODAL: z.string().default('false').transform(val => val === 'true'),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(JSON.stringify(parsed.error.format(), null, 2))
    throw new Error('Invalid environment variables')
  }

  return parsed.data
}

// Validate on import (only in Node.js environment)
export const env = typeof window === 'undefined' ? validateEnv() : ({} as Env)

// Type-safe environment access
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  if (typeof window !== 'undefined') {
    // Client-side: only allow NEXT_PUBLIC_ variables
    if (!key.startsWith('NEXT_PUBLIC_')) {
      throw new Error(`Cannot access server environment variable "${key}" on client`)
    }
    return process.env[key] as Env[K]
  }
  return env[key]
}
