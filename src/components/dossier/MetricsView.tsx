import type { MetricPack } from "@/types/desk"

import { MarkdownView } from "./MarkdownView"
import { EmptyState } from "./parts"

const TABLE_LABELS: Record<string, string> = {
  pnl: "P&L",
  balance_sheet: "Balance sheet",
  cash_flow: "Cash flow",
  ratios: "Ratios",
  shareholding: "Shareholding",
  quarters: "Quarterly",
}

export function MetricsView({ metrics }: { metrics: MetricPack }) {
  if (!metrics) return <EmptyState label="No financials." />

  const market = metrics.market ?? {}
  const marketEntries = Object.entries(market).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  )
  const tables = metrics.tables_md ?? {}
  const tableKeys = Object.keys(tables).filter((k) => (tables[k] || "").trim())
  const detectorsFired = (metrics.detectors ?? []).filter((d) =>
    Boolean((d as { fired?: unknown }).fired),
  )

  if (!marketEntries.length && !tableKeys.length && !metrics.dupont_note) {
    return <EmptyState label="No financial data." />
  }

  return (
    <div className="space-y-6">
      {marketEntries.length ? (
        <div>
          <h3 className="micro-label mb-2">Market snapshot</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {marketEntries.map(([k, v]) => (
              <div key={k} className="rounded-lg border border-hairline bg-surface p-2.5">
                <p className="font-mono text-[10px] uppercase tracking-wide text-text-secondary/50">
                  {k.replace(/_/g, " ")}
                </p>
                <p className="mt-0.5 font-mono text-sm text-text-primary">{String(v)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {metrics.dupont_note ? (
        <div className="rounded-xl border border-violet/20 bg-violet/[0.05] p-3 text-xs leading-relaxed text-text-secondary">
          {metrics.dupont_note}
        </div>
      ) : null}

      {tableKeys.map((k) => (
        <div key={k}>
          <h3 className="micro-label mb-2">{TABLE_LABELS[k] ?? k.replace(/_/g, " ")}</h3>
          <MarkdownView>{tables[k]}</MarkdownView>
        </div>
      ))}

      {detectorsFired.length ? (
        <div>
          <h3 className="micro-label mb-2">Detectors fired</h3>
          <div className="space-y-1.5">
            {detectorsFired.map((d, i) => {
              const det = d as { name?: unknown; why?: unknown }
              return (
                <div
                  key={i}
                  className="rounded-lg border border-warn/20 bg-warn/[0.05] p-2.5 text-xs text-text-secondary/90"
                >
                  <span className="font-mono text-warn/90">{String(det.name ?? "detector")}</span>
                  {det.why ? <span className="text-text-secondary/70"> — {String(det.why)}</span> : null}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {metrics.anomalies.length ? (
        <div>
          <h3 className="micro-label mb-2">Anomalies</h3>
          <div className="space-y-1.5">
            {metrics.anomalies.map((a, i) => (
              <div
                key={i}
                className="rounded-lg border border-hairline bg-surface p-2.5 font-mono text-[11px] text-text-secondary/80"
              >
                {Object.entries(a).map(([k, v]) => (
                  <span key={k} className="mr-3">
                    <span className="text-text-secondary/50">{k}:</span> {String(v)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
