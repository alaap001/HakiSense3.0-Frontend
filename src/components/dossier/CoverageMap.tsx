import { cn } from "@/lib/utils"
import type { CoverageLens, CoverageStatus } from "@/types/desk"

import { EmptyState } from "./parts"

const STATUS: Record<CoverageStatus, string> = {
  covered: "bg-pos",
  touched: "bg-warn",
  empty: "bg-surface-strong",
}

export function CoverageMap({ coverage }: { coverage: CoverageLens[] }) {
  if (!coverage.length) return <EmptyState label="No coverage map." />
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {coverage.map((c) => (
        <div
          key={c.name}
          className="flex items-center gap-3 rounded-xl border border-hairline bg-surface p-3"
        >
          <span className={cn("size-2 shrink-0 rounded-full", STATUS[c.status] ?? STATUS.empty)} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm capitalize text-text-primary">
              {c.name.replace(/_/g, " ")}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wide text-text-secondary/50">
              {c.owner_team} · {c.status}
            </p>
          </div>
          <span className="font-mono text-xs text-text-secondary/70">{c.finding_count}</span>
        </div>
      ))}
    </div>
  )
}
