export interface UsageState {
  /** Whole units left this period (floored at 0). */
  remaining: number
  /** 0–100, how much of the allowance is consumed. */
  pct: number
  /** Allowance is exhausted. */
  out: boolean
  /** ≤ 10% of the allowance left (and not yet out). */
  low: boolean
  /** Limit > 0 — i.e. the meter actually caps usage (false ⇒ unmetered/unlimited). */
  capped: boolean
}

/** Derive the display state for one meter. A limit ≤ 0 means "not metered" (local dev /
 *  Supabase unconfigured) and is reported as uncapped. */
export function usageState(used: number, limit: number): UsageState {
  const capped = limit > 0
  const remaining = capped ? Math.max(0, limit - used) : 0
  const pct = capped ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const out = capped && remaining <= 0
  const low = capped && !out && remaining / limit <= 0.1
  return { remaining, pct, out, low, capped }
}
