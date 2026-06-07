import { useMemo, useState } from "react"

import { fmtPct, fmtSignedMoney, pnlClass } from "@/lib/journal/format"
import { breakdownBy } from "@/lib/journal/metrics"
import { cn } from "@/lib/utils"
import type { Strategy, Trade } from "@/types/journal"

type Dim = "strategy" | "direction" | "weekday" | "timeframe"

const DIMS: { id: Dim; label: string }[] = [
  { id: "strategy", label: "Strategy" },
  { id: "direction", label: "Direction" },
  { id: "weekday", label: "Weekday" },
  { id: "timeframe", label: "Timeframe" },
]

export function PerformanceBreakdowns({
  trades,
  strategies,
  currency = "USD",
}: {
  trades: Trade[]
  strategies: Strategy[]
  currency?: string
}) {
  const [dim, setDim] = useState<Dim>("strategy")

  const rows = useMemo(() => {
    const stratName = (id: string | null) =>
      id ? strategies.find((s) => s.id === id)?.name ?? "Unknown" : null
    const keyOf: Record<Dim, (t: Trade) => string> = {
      strategy: (t) => stratName(t.strategy_id) ?? t.setup ?? "Untagged",
      direction: (t) => t.direction,
      weekday: (t) => new Date(t.entry_at).toLocaleDateString("en-US", { weekday: "short" }),
      timeframe: (t) => t.timeframe ?? "—",
    }
    return breakdownBy(trades, keyOf[dim])
  }, [trades, strategies, dim])

  const maxAbs = Math.max(1, ...rows.map((r) => Math.abs(r.netPnl)))

  return (
    <div className="rounded-xl border border-hairline bg-panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="micro-label">Performance by</p>
        <div className="flex flex-wrap gap-1">
          {DIMS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDim(d.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                dim === d.id
                  ? "border-violet bg-violet/15 text-brand-strong"
                  : "border-hairline text-text-secondary hover:border-hairline-strong",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-text-secondary/70">No closed trades yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.key} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
              <span className="truncate text-xs text-text-secondary" title={r.key}>{r.key}</span>
              <div className="h-2 overflow-hidden rounded-full bg-surface-strong">
                <div
                  className={cn("h-full rounded-full", r.netPnl >= 0 ? "bg-pos/70" : "bg-neg/70")}
                  style={{ width: `${(Math.abs(r.netPnl) / maxAbs) * 100}%` }}
                />
              </div>
              <span className="flex items-center gap-2 text-right">
                <span className="text-[10px] text-text-secondary/60">
                  {r.trades}t · {fmtPct(r.winRate, 0)}
                </span>
                <span className={cn("w-20 text-right font-mono text-xs", pnlClass(r.netPnl))}>
                  {fmtSignedMoney(r.netPnl, currency)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
