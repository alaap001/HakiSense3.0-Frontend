import { useMemo } from "react"

import { fmtSignedMoney } from "@/lib/journal/format"
import { netPnl } from "@/lib/journal/metrics"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types/journal"

const pad = (n: number) => String(n).padStart(2, "0")
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** GitHub-style P&L-by-day grid over the last `weeks` weeks (by exit date). */
export function CalendarHeatmap({
  trades,
  currency = "USD",
  weeks = 13,
}: {
  trades: Trade[]
  currency?: string
  weeks?: number
}) {
  const byDay = useMemo(() => {
    const m = new Map<string, number>()
    for (const t of trades) {
      if (t.status !== "closed" || !t.exit_at) continue
      const k = dayKey(new Date(t.exit_at))
      m.set(k, (m.get(k) ?? 0) + (netPnl(t) ?? 0))
    }
    return m
  }, [trades])

  const { cells, maxAbs } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(today)
    end.setDate(end.getDate() + (6 - end.getDay())) // Saturday of this week
    const start = new Date(end)
    start.setDate(start.getDate() - (weeks * 7 - 1))
    const out: { key: string; date: Date; pnl: number | undefined }[] = []
    let mx = 0
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = dayKey(d)
      const pnl = byDay.get(key)
      if (pnl != null) mx = Math.max(mx, Math.abs(pnl))
      out.push({ key, date: new Date(d), pnl })
    }
    return { cells: out, maxAbs: mx || 1 }
  }, [byDay, weeks])

  return (
    <div className="rounded-xl border border-hairline bg-panel p-4">
      <p className="micro-label mb-3">Daily P&L</p>
      <div className="custom-scrollbar overflow-x-auto">
        <div
          className="grid w-max grid-flow-col gap-1"
          style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
        >
          {cells.map((c) => {
            const intensity =
              c.pnl == null ? 0 : 0.3 + 0.7 * (Math.abs(c.pnl) / maxAbs)
            return (
              <div
                key={c.key}
                title={`${c.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}${c.pnl != null ? ` · ${fmtSignedMoney(c.pnl, currency)}` : ""}`}
                className={cn(
                  "size-3 rounded-sm",
                  c.pnl == null ? "bg-surface-strong" : c.pnl > 0 ? "bg-pos" : c.pnl < 0 ? "bg-neg" : "bg-surface-strong",
                )}
                style={c.pnl != null && c.pnl !== 0 ? { opacity: intensity } : undefined}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
