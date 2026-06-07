import { useMemo } from "react"

import { fmtSignedMoney } from "@/lib/journal/format"
import { equityCurve } from "@/lib/journal/metrics"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types/journal"

/** Cumulative net-P&L curve, drawn as an inline SVG area (no chart library). */
export function EquityCurve({ trades, currency = "USD" }: { trades: Trade[]; currency?: string }) {
  const points = useMemo(() => equityCurve(trades), [trades])

  if (points.length < 2) {
    return (
      <div className="grid h-44 place-items-center rounded-xl border border-dashed border-hairline-strong text-xs text-text-secondary/70">
        Equity curve appears once you have at least 2 closed trades.
      </div>
    )
  }

  const W = 600
  const H = 200
  const PAD = 10
  const eqs = points.map((p) => p.equity)
  const min = Math.min(0, ...eqs)
  const max = Math.max(0, ...eqs)
  const range = max - min || 1
  const x = (i: number) => PAD + (i / (points.length - 1)) * (W - 2 * PAD)
  const y = (v: number) => PAD + (1 - (v - min) / range) * (H - 2 * PAD)

  const last = eqs[eqs.length - 1]
  const up = last >= 0
  const zeroY = y(0)
  const linePts = points.map((p, i) => `${x(i)},${y(p.equity)}`).join(" ")
  const areaPts = `${x(0)},${zeroY} ${linePts} ${x(points.length - 1)},${zeroY}`

  return (
    <div className="rounded-xl border border-hairline bg-panel p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="micro-label">Equity curve</p>
        <p className={cn("font-display text-lg font-semibold", up ? "text-pos" : "text-neg")}>
          {fmtSignedMoney(last, currency)}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className={cn("h-44 w-full", up ? "text-pos" : "text-neg")} preserveAspectRatio="none">
        <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="4 4" />
        <polygon points={areaPts} fill="currentColor" fillOpacity={0.12} />
        <polyline points={linePts} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  )
}
