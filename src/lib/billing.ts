/**
 * Billing API client — backend-driven pricing, the usage snapshot, and Razorpay order/verify.
 * Mirrors the agentos.ts contract: the Supabase access token goes on the Authorization header,
 * and failures throw {@link ApiError} (status + the backend `detail`) so callers can map a 402
 * (out of credits / over limit) or 403 (not entitled) to the right prompt.
 */
import { ApiError } from "@/lib/agentos"
import type { RazorpaySuccess } from "@/lib/razorpay"

const BASE = (import.meta.env.VITE_AGENTOS_URL as string | undefined) ?? "/agentos"

export type PaidTier = "pro" | "ultra"
export type Cycle = "monthly" | "quarterly"

export interface PlanFeature {
  text: string
  spark?: boolean
}

export interface CyclePrice {
  perMonth: number
  listPerMonth?: number
  discount?: number
  billed: string
  amount_paise: number
}

/** One row of the backend `billing_plans` table, as served by GET /api/plans. */
export interface PlanRow {
  tier: "free" | PaidTier
  name: string
  tagline: string | null
  cta: string | null
  popular: boolean
  sort: number
  active?: boolean
  includes_lead: string | null
  dossiers_label: string | null
  credits_label: string | null
  credits_per_month: number
  research_per_month: number
  features: PlanFeature[]
  pricing: { monthly: CyclePrice; quarterly: CyclePrice }
  entitlements: { journal_ai?: boolean }
}

export interface UsageMeter {
  used: number
  /** -1 means "not metered" (local dev / Supabase unconfigured). */
  limit: number
  remaining: number
}

export interface BillingMe {
  plan: "free" | PaidTier
  status: string
  cycle: Cycle | null
  current_period_end: string | null
  journal_ai: boolean
  /** False when limits don't apply (dev / unconfigured) — hide usage bars. */
  metered: boolean
  credits: UsageMeter
  research: UsageMeter
}

export interface CreateOrderResponse {
  order_id: string
  amount: number
  currency: string
  key_id: string
}

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handle<T>(res: Response, what: string): Promise<T> {
  if (!res.ok) {
    let detail = `${what} failed: ${res.status}`
    try {
      const j = (await res.json()) as { detail?: unknown }
      if (j && typeof j.detail === "string") detail = j.detail
    } catch {
      /* non-JSON error body — keep the status message */
    }
    throw new ApiError(res.status, detail)
  }
  return res.json() as Promise<T>
}

/** Public: tier definitions for the pricing UI (no auth required). */
export async function getPlans(): Promise<PlanRow[]> {
  const res = await fetch(`${BASE}/api/plans`)
  const data = await handle<{ plans: PlanRow[] }>(res, "load plans")
  return data.plans ?? []
}

/** The signed-in user's plan + credit/research usage. */
export async function getBillingMe(token?: string): Promise<BillingMe> {
  const res = await fetch(`${BASE}/api/billing/me`, { headers: authHeaders(token) })
  return handle<BillingMe>(res, "load billing")
}

/** Create a Razorpay order for {tier, cycle}. The amount is decided server-side. */
export async function createOrder(
  tier: PaidTier,
  cycle: Cycle,
  token?: string,
): Promise<CreateOrderResponse> {
  const res = await fetch(`${BASE}/api/billing/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ tier, cycle }),
  })
  return handle<CreateOrderResponse>(res, "create order")
}

/** Verify the checkout signature; on success the plan is activated and the fresh snapshot returned. */
export async function verifyPayment(
  resp: RazorpaySuccess,
  token?: string,
): Promise<BillingMe> {
  const res = await fetch(`${BASE}/api/billing/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(resp),
  })
  return handle<BillingMe>(res, "verify payment")
}
