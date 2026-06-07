import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  deleteTrade,
  fetchTrades,
  insertTrade,
  updateTrade,
} from "@/lib/journal/queries"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { NewTrade, Trade, TradeUpdate } from "@/types/journal"

const TRADES_KEY = ["journal", "trades"] as const

/** All of the signed-in user's trades, newest first (RLS scopes to the user). */
export function useTrades() {
  return useQuery<Trade[]>({
    queryKey: TRADES_KEY,
    queryFn: fetchTrades,
    enabled: isSupabaseConfigured,
  })
}

/** Create / update / delete trade mutations that invalidate the trades cache. */
export function useTradeMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: TRADES_KEY })
  const create = useMutation({ mutationFn: (t: NewTrade) => insertTrade(t), onSuccess: invalidate })
  const update = useMutation({
    mutationFn: (v: { id: string; patch: TradeUpdate }) => updateTrade(v.id, v.patch),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: (id: string) => deleteTrade(id), onSuccess: invalidate })
  return { create, update, remove }
}
