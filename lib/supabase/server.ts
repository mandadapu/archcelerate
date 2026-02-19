import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

// Data-only Supabase client for database access (no cookie auth).
// Authentication is handled by NextAuth — this client uses the service
// role key to bypass RLS for server-side data queries.
// Lazy-initialized to avoid crashing during next build when env vars are absent.
let supabaseAdmin: SupabaseClient | null = null

export async function createClient() {
  if (!supabaseAdmin) {
    supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseAdmin
}
