import { Link } from "react-router-dom"
import { Loader2, Sparkles } from "lucide-react"

import { PlanPill } from "@/components/billing/PlanPill"
import { UsageMeter } from "@/components/billing/UsageMeter"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useBilling } from "@/hooks/useBilling"
import type { BillingMe } from "@/lib/billing"
import { cn } from "@/lib/utils"

const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

/** One line under the plan name: renewal for paid plans, expiry warning, or the reset note. */
function planDetail(me: BillingMe | undefined): string | null {
  if (!me) return null
  if (me.status === "expired") return "expired — renew to restore your limits"
  if (me.plan !== "free" && me.current_period_end) {
    const billed = me.cycle ? `billed ${me.cycle}` : "active"
    return `${billed} · renews ${fmtDate(me.current_period_end)}`
  }
  if (me.plan === "free") return "resets monthly"
  return null
}

/**
 * The canonical "Plan & usage" card — current plan, renewal/reset line, both monthly meters
 * (chat credits + research) and the Upgrade/Manage CTA. Reused on Settings and Profile.
 * Hides the meters when usage isn't tracked (local dev / Supabase unconfigured).
 */
export function PlanUsageCard({ className }: { className?: string }) {
  const { data: me, isLoading } = useBilling()
  const plan = me?.plan ?? "free"
  const detail = planDetail(me)

  return (
    <Card className={cn("card-glass", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-text-primary">
              Plan &amp; usage
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              You&apos;re on the{" "}
              <span className="font-semibold capitalize text-text-primary">{plan}</span> plan
              {detail ? <> · {detail}</> : null}.
            </p>
          </div>
          <PlanPill plan={plan} />
        </div>

        {isLoading ? (
          <div className="mt-5 flex items-center gap-2 text-xs text-text-secondary">
            <Loader2 className="size-3.5 animate-spin" />
            Loading usage…
          </div>
        ) : me?.metered ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <UsageMeter label="Chat credits / mo" used={me.credits.used} limit={me.credits.limit} />
            <UsageMeter label="Research / mo" used={me.research.used} limit={me.research.limit} />
          </div>
        ) : (
          <p className="mt-4 text-xs text-text-secondary/70">
            Usage limits aren&apos;t being tracked in this environment.
          </p>
        )}

        <Button asChild className="btn-primary mt-5 gap-2 text-white">
          <Link to="/billing">
            <Sparkles className="size-4" />
            {plan === "ultra" ? "Manage plan" : "Upgrade plan"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
