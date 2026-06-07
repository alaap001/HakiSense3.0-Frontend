import { cn } from "@/lib/utils"

type Plan = "free" | "pro" | "ultra"

/** Plan accent: free is neutral, Pro leads with the brand (emerald), Ultra gets the rare spark. */
const STYLES: Record<Plan, string> = {
  free: "border-hairline bg-surface text-text-secondary",
  pro: "border-brand/30 bg-brand/10 text-brand-strong",
  ultra: "border-spark/40 bg-spark/10 text-spark-strong",
}

/** The user's current plan as a small capitalized pill. Used in the nav, the usage card and
 *  the dashboard strip so the plan reads the same everywhere. */
export function PlanPill({ plan, className }: { plan: Plan; className?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        STYLES[plan],
        className,
      )}
    >
      {plan}
    </span>
  )
}
