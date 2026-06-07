/**
 * Admin-panel domain types. The admin data is served by the backend `/api/admin/*`
 * endpoints (service-role) — NOT read directly from Supabase — so it can include
 * auth.users fields (email, plan, last sign-in) that the anon key can't reach.
 */
import type { Strategy, Trade } from "@/types/journal"

export type RunMode = "intake" | "scope" | "full"
export type RunStatus = "running" | "completed" | "failed"

export interface AdminOverview {
  users: { total: number; pro: number; free: number }
  trades: { total: number; open: number; closed: number }
  runs: { total: number; completed: number; failed: number; running: number }
  /** Total LLM spend across all recorded research runs. */
  budget_spent_usd: number
}

export interface AdminUser {
  id: string
  email: string | null
  created_at: string | null
  last_sign_in_at: string | null
  plan: "free" | "pro"
  role: string | null
  /** Per-user counts (joined server-side). */
  trades: number
  runs: number
}

/** One row of `research_runs` (server-authoritative history), with the owner's email attached. */
export interface AdminRun {
  id: string
  session_id: string
  user_id: string
  user_email?: string | null
  ticker: string
  mode: RunMode
  phases: string[]
  status: RunStatus
  cached: boolean
  gate_passed: boolean | null
  headline: string | null
  research_version: string | null
  budget_spent_usd: number | null
  error: string | null
  created_at: string
  completed_at: string | null
  updated_at: string
}

/** A trade row as the admin sees it (every column of `trades` + the owner's email). */
export type AdminTrade = Trade & { user_email?: string | null }

export interface AdminUserDetail {
  user: {
    id: string
    email: string | null
    created_at: string | null
    last_sign_in_at: string | null
    plan: "free" | "pro"
    role: string | null
  }
  trades: Trade[]
  strategies: Strategy[]
  runs: AdminRun[]
}

export interface AdminListParams {
  ticker?: string
  status?: string
  userId?: string
  limit?: number
  offset?: number
}

export interface AdminRunsResponse {
  runs: AdminRun[]
  total: number | null
  limit: number
  offset: number
}

export interface AdminTradesResponse {
  trades: AdminTrade[]
  total: number | null
  limit: number
  offset: number
}
