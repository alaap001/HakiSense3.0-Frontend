import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { fmtDate, fmtPct, fmtR, fmtSignedMoney, pnlClass } from "@/lib/journal/format"
import { netPnl, realizedR, returnPct } from "@/lib/journal/metrics"
import { cn } from "@/lib/utils"
import type { Strategy, Trade } from "@/types/journal"

export function TradeBlotter({
  trades,
  strategies,
  onSelect,
  currency = "USD",
}: {
  trades: Trade[]
  strategies: Strategy[]
  onSelect: (t: Trade) => void
  currency?: string
}) {
  const stratName = (id: string | null) =>
    id ? strategies.find((s) => s.id === id)?.name ?? null : null

  if (trades.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-hairline-strong p-10 text-center">
        <p className="text-sm text-text-secondary">No trades match these filters.</p>
        <p className="mt-1 text-xs text-text-secondary/60">Log your first trade to start building your edge.</p>
      </div>
    )
  }

  return (
    <div className="custom-scrollbar overflow-x-auto rounded-xl border border-hairline">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-hairline text-left">
            {["Ticker", "Setup", "Entry", "Status", "Return", "R", "Net P&L"].map((h) => (
              <th key={h} className="micro-label px-3 py-2.5 font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const net = netPnl(t)
            const r = realizedR(t)
            const ret = returnPct(t)
            const long = t.direction === "long"
            return (
              <tr
                key={t.id}
                onClick={() => onSelect(t)}
                className="cursor-pointer border-b border-hairline/60 transition-colors last:border-0 hover:bg-surface/50"
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("flex size-5 items-center justify-center rounded", long ? "bg-pos/15 text-pos" : "bg-neg/15 text-neg")}>
                      {long ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                    </span>
                    <span className="font-mono font-medium text-text-primary">{t.ticker}</span>
                  </div>
                </td>
                <td className="max-w-[160px] truncate px-3 py-2.5 text-text-secondary">
                  {stratName(t.strategy_id) ?? t.setup ?? "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-text-secondary">{fmtDate(t.entry_at)}</td>
                <td className="px-3 py-2.5">
                  {t.status === "open" ? (
                    <span className="rounded-full border border-warn/40 px-2 py-0.5 text-[11px] text-warn">open</span>
                  ) : (
                    <span className="text-[11px] text-text-secondary/60">closed</span>
                  )}
                </td>
                <td className={cn("px-3 py-2.5 font-mono", pnlClass(ret))}>{fmtPct(ret)}</td>
                <td className={cn("px-3 py-2.5 font-mono", pnlClass(r))}>{fmtR(r)}</td>
                <td className={cn("px-3 py-2.5 text-right font-mono font-medium", pnlClass(net))}>
                  {fmtSignedMoney(net, currency)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
