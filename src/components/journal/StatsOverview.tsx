import type { ReactNode } from "react"

import { fmtNum, fmtPct, fmtR, fmtSignedMoney, pnlClass } from "@/lib/journal/format"
import type { JournalStats } from "@/lib/journal/metrics"
import { cn } from "@/lib/utils"

function Stat({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  valueClass?: string
}) {
  return (
    <div className="glass rounded-xl border border-hairline px-4 py-3">
      <p className="micro-label">{label}</p>
      <p className={cn("mt-1 font-display text-xl font-semibold tracking-tight text-text-primary", valueClass)}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-[11px] text-text-secondary/70">{sub}</p> : null}
    </div>
  )
}

export function StatsOverview({ stats, currency = "USD" }: { stats: JournalStats; currency?: string }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Net P&L"
          value={fmtSignedMoney(stats.netPnl, currency)}
          valueClass={pnlClass(stats.netPnl)}
          sub={`${stats.closed} closed · ${stats.open} open`}
        />
        <Stat
          label="Win rate"
          value={fmtPct(stats.winRate)}
          sub={`${stats.wins}W · ${stats.losses}L${stats.breakeven ? ` · ${stats.breakeven}BE` : ""}`}
        />
        <Stat
          label="Profit factor"
          value={stats.profitFactor == null ? "∞" : fmtNum(stats.profitFactor)}
          sub="gross win ÷ gross loss"
        />
        <Stat
          label="Expectancy"
          value={fmtSignedMoney(stats.expectancy, currency)}
          valueClass={pnlClass(stats.expectancy)}
          sub="per closed trade"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Avg R" value={fmtR(stats.avgR)} valueClass={pnlClass(stats.avgR)} sub={`total ${fmtR(stats.totalR)}`} />
        <Stat
          label="Best / worst"
          value={
            <span className="text-base">
              <span className="text-pos">{fmtSignedMoney(stats.bestTrade, currency)}</span>
              <span className="text-text-secondary/50"> / </span>
              <span className="text-neg">{fmtSignedMoney(stats.worstTrade, currency)}</span>
            </span>
          }
        />
        <Stat label="Max drawdown" value={fmtSignedMoney(stats.maxDrawdown, currency)} valueClass={pnlClass(stats.maxDrawdown)} sub="peak-to-trough" />
        <Stat
          label="Streak"
          value={stats.currentStreak === 0 ? "—" : `${Math.abs(stats.currentStreak)} ${stats.currentStreak > 0 ? "wins" : "losses"}`}
          valueClass={stats.currentStreak > 0 ? "text-pos" : stats.currentStreak < 0 ? "text-neg" : ""}
        />
      </div>
    </div>
  )
}
