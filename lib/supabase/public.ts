import { createClient } from '@supabase/supabase-js'

// A read-only Supabase client for use on the server (not in the browser).
// It uses the same public "anon" key as the rest of the site, so it can only
// read what logged-out visitors are already allowed to read.
// Pages use this so their content is in the HTML that Google downloads.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
