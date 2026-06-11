import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import { PlanPill } from "@/components/billing/PlanPill"
import { usageState } from "@/components/billing/usage"
import { useBilling } from "@/hooks/useBilling"
import { formatNumber } from "@/lib/market"
import { cn } from "@/lib/utils"

/** A single "● Research — N left" reading, color-coded by how close it is to the cap. */
function Chip({ label, used, limit }: { label: string; used: number; limit: number }) {
  const { remaining, out, low } = usageState(used, limit)
  const tone = out ? "text-neg" : low ? "text-warn" : "text-text-primary"
  const dot = out ? "bg-neg" : low ? "bg-warn" : "bg-brand"
  return (
    <span className="flex items-center gap-2 text-xs">
      <span className={cn("size-1.5 rounded-full", dot)} />
      <span className="text-text-secondary">{label}</span>
      <span className={cn("font-mono font-semibold", tone)}>
        {formatNumber(remaining)} left
      </span>
    </span>
  )
}

/**
 * Compact at-a-glance usage for the Dashboard: research + chat credits remaining this month,
 * the current plan, and an Upgrade nudge when free or running low. Renders nothing when usage
 * isn't tracked (local dev / Supabase unconfigured).
 */
export function UsageStrip() {
  const { data: me } = useBilling()
  if (!me?.metered) return null

  const research = usageState(me.research.used, me.research.limit)
  const credits = usageState(me.credits.used, me.credits.limit)
  const nudge =
    me.plan === "free" ||
    (me.plan !== "ultra" && (research.out || research.low || credits.out || credits.low))

  return (
    <div className="glass mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-hairline px-4 py-2.5">
      <Chip label="Research" used={me.research.used} limit={me.research.limit} />
      <span className="hidden h-3 w-px bg-hairline sm:block" />
      <Chip label="Chat credits" used={me.credits.used} limit={me.credits.limit} />
      <div className="ml-auto flex items-center gap-3">
        <PlanPill plan={me.plan} />
        {nudge ? (
          <Link
            to="/billing"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            Upgrade
            <ArrowRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  )
}
