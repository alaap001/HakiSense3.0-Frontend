import { useMemo } from "react"

import { useAuth } from "@/contexts/AuthContext"
import type { Plan } from "@/types/journal"

export interface Entitlements {
  plan: Plan
  /** Pro OR Ultra. */
  isPro: boolean
  isUltra: boolean
  /** Any paid plan. */
  isPaid: boolean
  /** AI trade review (Journal) is an Ultra-only capability. */
  canUseAi: boolean
}

/**
 * Read the signed-in user's plan to gate paid features in the UI. The plan lives in
 * the JWT's `app_metadata` (server-controlled) — deliberately NOT `user_metadata`,
 * which the user can edit and could use to grant themselves a plan. This is the fast,
 * optimistic claim (it can lag the DB until the token refreshes — which we force after a
 * purchase); the backend enforces the fresh subscription on every paid endpoint. For exact
 * usage/limits use {@link useBilling} (GET /api/billing/me).
 */
export function useEntitlements(): Entitlements {
  const { user } = useAuth()
  return useMemo<Entitlements>(() => {
    const raw = (user?.app_metadata as { plan?: string } | undefined)?.plan
    const plan: Plan = raw === "ultra" ? "ultra" : raw === "pro" ? "pro" : "free"
    return {
      plan,
      isPro: plan === "pro" || plan === "ultra",
      isUltra: plan === "ultra",
      isPaid: plan !== "free",
      canUseAi: plan === "ultra",
    }
  }, [user])
}
