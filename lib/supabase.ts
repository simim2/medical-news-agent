import { createClient } from '@supabase/supabase-js'
import type { Article } from './types'

// Lazy initialization — avoids build-time crash when env vars are absent
function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Convenience re-export for read-only client (used in API routes)
export { getPublicClient as getClient }

export type { Article }
