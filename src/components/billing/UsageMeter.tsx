import { usageState } from "@/components/billing/usage"
import { formatNumber } from "@/lib/market"
import { cn } from "@/lib/utils"

/** A labeled monthly-usage bar: how much is left (headline), how much is used (caption),
 *  shifting brand → warn → neg as the balance runs low and hits zero. */
export function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const { remaining, pct, out, low, capped } = usageState(used, limit)
  const fill = out ? "bg-neg" : low ? "bg-warn" : "bg-brand"
  const tone = out ? "text-neg" : low ? "text-warn" : "text-text-primary"

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="micro-label">{label}</span>
        <span className={cn("font-mono text-xs font-semibold", tone)}>
          {capped ? `${formatNumber(remaining)} left` : "Unlimited"}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", fill)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 font-mono text-[11px] text-text-secondary/70">
        {formatNumber(used)} of {capped ? formatNumber(limit) : "∞"} used
      </p>
    </div>
  )
}
