import { createClient } from '@supabase/supabase-js'

// Cliente com service_role — APENAS para uso em API Routes server-side (nunca no browser)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
