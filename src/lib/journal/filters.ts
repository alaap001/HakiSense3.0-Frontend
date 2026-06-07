import type { Trade } from "@/types/journal"

export interface JournalFilterState {
  q: string
  direction: "all" | "long" | "short"
  status: "all" | "open" | "closed"
  strategyId: string // "all" or a strategy id
}

export const DEFAULT_FILTERS: JournalFilterState = {
  q: "",
  direction: "all",
  status: "all",
  strategyId: "all",
}

/** Apply the active filters to a trade list (pure). */
export function applyFilters(trades: Trade[], f: JournalFilterState): Trade[] {
  const q = f.q.trim().toUpperCase()
  return trades.filter((t) => {
    if (q && !t.ticker.toUpperCase().includes(q) && !(t.setup ?? "").toUpperCase().includes(q)) return false
    if (f.direction !== "all" && t.direction !== f.direction) return false
    if (f.status !== "all" && t.status !== f.status) return false
    if (f.strategyId !== "all" && t.strategy_id !== f.strategyId) return false
    return true
  })
}
