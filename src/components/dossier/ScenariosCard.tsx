import { formatMoney } from "@/lib/market"
import { cn } from "@/lib/utils"
import type { Scenario } from "@/types/desk"

import { EmptyState } from "./parts"

const ORDER = ["bull", "base", "bear"]
const COLOR: Record<string, string> = {
  bull: "bg-pos",
  base: "bg-violet-400",
  bear: "bg-neg",
}

function pct(p: number | undefined) {
  return Math.max(0, Math.min(100, Math.round((p ?? 0) * 100)))
}

export function ScenariosCard({ scenarios }: { scenarios: Scenario[] }) {
  if (!scenarios.length) {
    return <EmptyState label="No valuation scenarios yet — run a Full report." />
  }
  const sorted = [...scenarios].sort(
    (a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name),
  )
  return (
    <div className="space-y-3">
      {sorted.map((s) => (
        <div key={s.name} className="rounded-xl border border-hairline bg-surface p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-sm font-semibold capitalize text-text-primary">
              {s.name}
            </span>
            <span className="font-mono text-lg text-text-primary">
              {formatMoney(Number(s.fair_value))}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-strong">
              <div
                className={cn("h-full rounded-full", COLOR[s.name] ?? "bg-violet-400")}
                style={{ width: `${pct(s.probability)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-text-secondary/70">{pct(s.probability)}%</span>
          </div>
          {s.method ? (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-text-secondary/60">
              {s.method}
            </p>
          ) : null}
          {s.drivers.length ? (
            <ul className="mt-2 space-y-1 text-xs text-text-secondary/90">
              {s.drivers.map((d, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand/60">·</span>
                  {d}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  )
}
