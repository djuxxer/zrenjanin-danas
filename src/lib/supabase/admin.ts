import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Admin klijent — koristi SUPABASE_SERVICE_ROLE_KEY i zaobilazi RLS.
 * SME da se koristi ISKLJUČIVO u server-side kodu (API rute, route handleri).
 * NIKAD ne importuj ovo u 'use client' komponentu.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
