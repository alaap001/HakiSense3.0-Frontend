import { Link } from "react-router-dom"
import { Lock, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Paywall card shown where an Ultra-only capability would be. The button routes to the
 * billing page, which runs Razorpay checkout and activates the plan.
 */
export function UpgradeGate({
  title = "AI trade review is an Ultra feature",
  description = "Unlock the desk's AI review — it critiques your entry, stop, sizing and plan adherence, and surfaces recurring mistakes across your journal.",
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-violet/30 bg-violet/[0.06] p-5">
      <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-violet/20 blur-2xl" />
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet/15 text-brand">
          <Lock className="size-4" />
        </span>
        <div className="flex-1">
          <p className="font-display text-sm font-semibold text-text-primary">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">{description}</p>
          <Button asChild size="sm" className="btn-primary mt-3 gap-1.5 text-white">
            <Link to="/billing?tier=ultra">
              <Sparkles className="size-3.5" />
              Upgrade to Ultra
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
