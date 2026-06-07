import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  deleteStrategy,
  fetchStrategies,
  insertStrategy,
} from "@/lib/journal/queries"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { Strategy } from "@/types/journal"

const STRATEGIES_KEY = ["journal", "strategies"] as const

/** The user's saved strategies / setups (RLS-scoped). */
export function useStrategies() {
  return useQuery<Strategy[]>({
    queryKey: STRATEGIES_KEY,
    queryFn: fetchStrategies,
    enabled: isSupabaseConfigured,
  })
}

export function useStrategyMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: STRATEGIES_KEY })
  const create = useMutation({
    mutationFn: (v: { name: string; description?: string | null; color?: string | null }) =>
      insertStrategy(v),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: (id: string) => deleteStrategy(id), onSuccess: invalidate })
  return { create, remove }
}
