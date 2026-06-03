import { AlertTriangle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { RedFlag, RedFlagSeverity } from "@/types/desk"

import { EmptyState } from "./parts"

const SEV: Record<RedFlagSeverity, string> = {
  red: "border-neg/50 text-neg",
  high: "border-warn/50 text-warn",
}

export function RedFlagsList({ redFlags }: { redFlags: RedFlag[] }) {
  if (!redFlags.length) return <EmptyState label="No red flags recorded." />
  return (
    <div className="space-y-2">
      {redFlags.map((r) => (
        <div
          key={r.id}
          className="flex items-start gap-3 rounded-xl border border-hairline bg-surface p-3"
        >
          <AlertTriangle
            className={cn(
              "mt-0.5 size-4 shrink-0",
              r.severity === "red" ? "text-neg" : "text-warn",
            )}
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("uppercase", SEV[r.severity])}>
                {r.severity}
              </Badge>
              <span className="font-mono text-[10px] uppercase tracking-wide text-text-secondary/60">
                {r.category}
              </span>
              <span className="font-mono text-[10px] text-text-secondary/40">{r.team}</span>
            </div>
            <p className="mt-1.5 text-sm text-text-secondary">{r.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
