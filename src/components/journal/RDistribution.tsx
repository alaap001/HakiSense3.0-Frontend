import { useMemo } from "react"

import { realizedR } from "@/lib/journal/metrics"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types/journal"

const BINS: { label: string; test: (r: number) => boolean; positive: boolean }[] = [
  { label: "≤−2", test: (r) => r <= -2, positive: false },
  { label: "−2…−1", test: (r) => r > -2 && r <= -1, positive: false },
  { label: "−1…0", test: (r) => r > -1 && r < 0, positive: false },
  { label: "0…1", test: (r) => r >= 0 && r < 1, positive: true },
  { label: "1…2", test: (r) => r >= 1 && r < 2, positive: true },
  { label: "2…3", test: (r) => r >= 2 && r < 3, positive: true },
  { label: "≥3", test: (r) => r >= 3, positive: true },
]

/** Histogram of realized R-multiples — are losses cut at ~1R and winners run? */
export function RDistribution({ trades }: { trades: Trade[] }) {
  const counts = useMemo(() => {
    const rs = trades.map(realizedR).filter((r): r is number => r != null)
    return BINS.map((b) => ({ ...b, count: rs.filter((r) => b.test(r)).length }))
  }, [trades])

  const total = counts.reduce((a, b) => a + b.count, 0)
  const max = Math.max(1, ...counts.map((c) => c.count))

  if (total === 0) {
    return (
      <div className="grid h-44 place-items-center rounded-xl border border-dashed border-hairline-strong text-xs text-text-secondary/70">
        R-distribution needs closed trades that have a stop.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-hairline bg-panel p-4">
      <p className="micro-label mb-3">R-multiple distribution</p>
      <div className="flex h-36 items-end gap-1.5">
        {counts.map((c) => (
          <div key={c.label} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] text-text-secondary/70">{c.count || ""}</span>
            <div
              className={cn("w-full rounded-t", c.positive ? "bg-pos/70" : "bg-neg/70")}
              style={{ height: `${(c.count / max) * 100}%`, minHeight: c.count ? 4 : 0 }}
            />
            <span className="text-[10px] text-text-secondary/60">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
