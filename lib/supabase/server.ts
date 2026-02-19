import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Data-only Supabase client for database access (no cookie auth).
// Authentication is handled by NextAuth — this client uses the service
// role key to bypass RLS for server-side data queries.
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createClient() {
  return supabaseAdmin
}
