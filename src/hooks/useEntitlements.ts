import { useMemo } from "react"

import { useAuth } from "@/contexts/AuthContext"
import type { Plan } from "@/types/journal"

export interface Entitlements {
  plan: Plan
  isPro: boolean
  /** AI analysis (trade review, pattern mining, coaching) is the paid capability. */
  canUseAi: boolean
}

/**
 * Read the signed-in user's plan to gate paid features in the UI. The plan lives in
 * the JWT's `app_metadata` (server-controlled) — deliberately NOT `user_metadata`,
 * which the user can edit and could use to grant themselves Pro. The backend enforces
 * the same claim on the AI endpoints; this hook only decides what the UI offers.
 */
export function useEntitlements(): Entitlements {
  const { user } = useAuth()
  return useMemo<Entitlements>(() => {
    const raw = (user?.app_metadata as { plan?: string } | undefined)?.plan
    const plan: Plan = raw === "pro" ? "pro" : "free"
    return { plan, isPro: plan === "pro", canUseAi: plan === "pro" }
  }, [user])
}
