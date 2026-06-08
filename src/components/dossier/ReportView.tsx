import { ShieldAlert, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { GateReport } from "@/types/api"

import { MarkdownView } from "./MarkdownView"
import { EmptyState } from "./parts"

function asText(v: unknown): string {
  return typeof v === "string" ? v : JSON.stringify(v)
}

export function ReportView({
  reportMd,
  gate,
}: {
  reportMd: string
  gate: GateReport | null
}) {
  const blockers = gate?.blockers ?? []
  const warnings = gate?.warnings ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-2 text-xs text-text-secondary">
        <ShieldCheck className="size-3.5 shrink-0 text-brand" />
        Research, not a recommendation — no BUY / HOLD / SELL.
        {gate ? (
          <Badge variant={gate.passed ? "secondary" : "destructive"} className="ml-auto">
            gate {gate.passed ? "passed" : "blocked"}
          </Badge>
        ) : null}
      </div>

      {blockers.length || warnings.length ? (
        <div className="space-y-1.5 rounded-xl border border-hairline bg-surface p-3 text-xs">
          {blockers.map((b, i) => (
            <div key={`b${i}`} className="flex items-start gap-2 text-neg">
              <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
              {asText(b)}
            </div>
          ))}
          {warnings.map((w, i) => (
            <div key={`w${i}`} className="flex items-start gap-2 text-warn/90">
              <span className="mt-0.5">!</span>
              {asText(w)}
            </div>
          ))}
        </div>
      ) : null}

      {reportMd.trim() ? (
        <MarkdownView>{reportMd}</MarkdownView>
      ) : (
        <EmptyState label="Nothing here yet — run a Full report to generate it." />
      )}
    </div>
  )
}
