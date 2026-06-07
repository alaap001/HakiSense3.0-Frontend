/**
 * Admin API client. Talks to the backend `/api/admin/*` routes (service-role, gated by
 * `app_metadata.role == "admin"`). Mirrors the agentos.ts contract: Supabase access token
 * goes on the Authorization header; a 403 means "not an admin", a 503 means the backend has
 * no service-role key configured (surfaced verbatim to the UI).
 */
import type { PlanRow } from "@/lib/billing"
import type {
  AdminListParams,
  AdminOverview,
  AdminPlan,
  AdminRunsResponse,
  AdminTradesResponse,
  AdminUser,
  AdminUserDetail,
} from "@/types/admin"

const BASE = (import.meta.env.VITE_AGENTOS_URL as string | undefined) ?? "/agentos"

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handle<T>(res: Response, what: string): Promise<T> {
  if (res.status === 403) throw new Error("Admin access required.")
  if (!res.ok) {
    let detail = `${what} failed: ${res.status}`
    try {
      const j = (await res.json()) as { detail?: unknown }
      if (j && typeof j.detail === "string") detail = j.detail
    } catch {
      /* non-JSON error body — keep the status message */
    }
    throw new Error(detail)
  }
  return res.json() as Promise<T>
}

function get<T>(path: string, token: string | undefined, what: string): Promise<T> {
  return fetch(`${BASE}${path}`, { headers: authHeaders(token) }).then((r) => handle<T>(r, what))
}

function queryString(p: AdminListParams): string {
  const sp = new URLSearchParams()
  if (p.ticker) sp.set("ticker", p.ticker)
  if (p.status) sp.set("status", p.status)
  if (p.userId) sp.set("user_id", p.userId)
  if (p.limit != null) sp.set("limit", String(p.limit))
  if (p.offset != null) sp.set("offset", String(p.offset))
  const s = sp.toString()
  return s ? `?${s}` : ""
}

export function adminOverview(token?: string): Promise<AdminOverview> {
  return get<AdminOverview>("/api/admin/overview", token, "overview")
}

export function adminUsers(token?: string): Promise<AdminUser[]> {
  return get<{ users: AdminUser[] }>("/api/admin/users", token, "users").then((d) => d.users ?? [])
}

export function adminUser(id: string, token?: string): Promise<AdminUserDetail> {
  return get<AdminUserDetail>(`/api/admin/users/${encodeURIComponent(id)}`, token, "user")
}

export function adminRuns(params: AdminListParams, token?: string): Promise<AdminRunsResponse> {
  return get<AdminRunsResponse>(`/api/admin/runs${queryString(params)}`, token, "runs")
}

export function adminTrades(params: AdminListParams, token?: string): Promise<AdminTradesResponse> {
  return get<AdminTradesResponse>(`/api/admin/trades${queryString(params)}`, token, "trades")
}

export async function adminSetPlan(
  id: string,
  plan: AdminPlan,
  token?: string,
): Promise<{ id: string; plan: string }> {
  const res = await fetch(`${BASE}/api/admin/users/${encodeURIComponent(id)}/plan`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ plan }),
  })
  return handle<{ id: string; plan: string }>(res, "set plan")
}

/** Full plan catalogue (incl. inactive) for the admin pricing editor. */
export function adminPlans(token?: string): Promise<PlanRow[]> {
  return get<{ plans: PlanRow[] }>("/api/admin/plans", token, "plans").then((d) => d.plans ?? [])
}

/** Edit a plan's pricing / limits / copy. Returns the updated row. */
export async function adminUpdatePlan(
  tier: string,
  patch: Partial<PlanRow>,
  token?: string,
): Promise<PlanRow> {
  const res = await fetch(`${BASE}/api/admin/plans/${encodeURIComponent(tier)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(patch),
  })
  const data = await handle<{ plan: PlanRow }>(res, "update plan")
  return data.plan
}
