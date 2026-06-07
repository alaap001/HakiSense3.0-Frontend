import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/contexts/AuthContext"
import {
  adminOverview,
  adminRuns,
  adminSetPlan,
  adminTrades,
  adminUser,
  adminUsers,
} from "@/lib/admin"
import type { AdminListParams } from "@/types/admin"

/**
 * Is the signed-in user an admin? Reads the server-controlled `app_metadata.role` from the
 * JWT (NOT `user_metadata`). Mirrors the backend's dev convenience: when Supabase isn't
 * configured the whole app runs open, so the admin area is reachable locally; otherwise it
 * gates strictly on `role === "admin"`. The backend re-checks the same claim on every call.
 */
export function useIsAdmin(): boolean {
  const { user, isSupabaseConfigured } = useAuth()
  const role = (user?.app_metadata as { role?: string } | undefined)?.role
  return role === "admin" || !isSupabaseConfigured
}

export function useAdminOverview() {
  const { getToken } = useAuth()
  const enabled = useIsAdmin()
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => adminOverview(await getToken()),
    enabled,
  })
}

export function useAdminUsers() {
  const { getToken } = useAuth()
  const enabled = useIsAdmin()
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => adminUsers(await getToken()),
    enabled,
  })
}

export function useAdminUser(id: string | undefined) {
  const { getToken } = useAuth()
  const enabled = useIsAdmin() && !!id
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: async () => adminUser(id as string, await getToken()),
    enabled,
  })
}

export function useAdminRuns(params: AdminListParams = {}) {
  const { getToken } = useAuth()
  const enabled = useIsAdmin()
  return useQuery({
    queryKey: ["admin", "runs", params],
    queryFn: async () => adminRuns(params, await getToken()),
    enabled,
  })
}

export function useAdminTrades(params: AdminListParams = {}) {
  const { getToken } = useAuth()
  const enabled = useIsAdmin()
  return useQuery({
    queryKey: ["admin", "trades", params],
    queryFn: async () => adminTrades(params, await getToken()),
    enabled,
  })
}

export function useSetPlan() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: "free" | "pro" }) =>
      adminSetPlan(id, plan, await getToken()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] })
    },
  })
}
