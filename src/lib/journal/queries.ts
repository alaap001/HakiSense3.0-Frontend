/**
 * Supabase data access for the trade journal. The browser talks to Postgres directly;
 * row-level-security (auth.uid() = user_id) is the isolation boundary, and user_id /
 * profiles.id default to auth.uid() in the schema, so inserts never send a user id.
 * The anon (publishable) key is the only key in the browser.
 */
import { supabase } from "@/lib/supabase"
import type { NewTrade, Strategy, Trade, TradeUpdate } from "@/types/journal"

const TRADES = "trades"
const STRATEGIES = "strategies"
const BUCKET = "trade-screenshots"

function client() {
  if (!supabase) throw new Error("Supabase is not configured — sign in to use the journal.")
  return supabase
}

// ---- trades ----------------------------------------------------------------

export async function fetchTrades(): Promise<Trade[]> {
  const { data, error } = await client()
    .from(TRADES)
    .select("*")
    .order("entry_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Trade[]
}

export async function insertTrade(trade: NewTrade): Promise<Trade> {
  const { data, error } = await client().from(TRADES).insert(trade).select("*").single()
  if (error) throw new Error(error.message)
  return data as Trade
}

export async function updateTrade(id: string, patch: TradeUpdate): Promise<Trade> {
  const { data, error } = await client().from(TRADES).update(patch).eq("id", id).select("*").single()
  if (error) throw new Error(error.message)
  return data as Trade
}

export async function deleteTrade(id: string): Promise<void> {
  const { error } = await client().from(TRADES).delete().eq("id", id)
  if (error) throw new Error(error.message)
}

// ---- strategies ------------------------------------------------------------

export async function fetchStrategies(): Promise<Strategy[]> {
  const { data, error } = await client()
    .from(STRATEGIES)
    .select("*")
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as Strategy[]
}

export async function insertStrategy(input: {
  name: string
  description?: string | null
  color?: string | null
}): Promise<Strategy> {
  const { data, error } = await client().from(STRATEGIES).insert(input).select("*").single()
  if (error) throw new Error(error.message)
  return data as Strategy
}

export async function deleteStrategy(id: string): Promise<void> {
  const { error } = await client().from(STRATEGIES).delete().eq("id", id)
  if (error) throw new Error(error.message)
}

// ---- screenshots (private bucket; owner-folder RLS) ------------------------

/** Upload files under `{userId}/…` (the RLS owner folder) and return their storage paths. */
export async function uploadScreenshots(userId: string, files: File[]): Promise<string[]> {
  const c = client()
  const paths: string[] = []
  for (const file of files) {
    const safe = file.name.replace(/[^\w.-]+/g, "_")
    const path = `${userId}/${crypto.randomUUID()}-${safe}`
    const { error } = await c.storage.from(BUCKET).upload(path, file, { upsert: false })
    if (error) throw new Error(error.message)
    paths.push(path)
  }
  return paths
}

/** Short-lived signed URL for a private screenshot, or null if it can't be signed. */
export async function screenshotUrl(path: string): Promise<string | null> {
  const { data, error } = await client().storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error) return null
  return data?.signedUrl ?? null
}
