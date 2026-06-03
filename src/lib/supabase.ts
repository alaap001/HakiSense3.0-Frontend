import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * True when both Supabase env vars are present. When false, the app runs
 * auth-free — no Authorization header is sent, which matches the backend's
 * opt-in JWT (it only enforces auth when SUPABASE_JWT_SECRET is set).
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * The browser Supabase client, or `null` when not configured. Uses the anon
 * (publishable) key only — never a service_role/secret key in the browser.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : null
