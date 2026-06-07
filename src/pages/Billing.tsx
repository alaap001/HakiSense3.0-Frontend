import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { AlertCircle, Check, CheckCircle2, Loader2, Sparkles } from "lucide-react"

import { PageHeader } from "@/components/app/PageHeader"
import { PageShell } from "@/components/app/PageShell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useBilling, useUpgrade } from "@/hooks/useBilling"
import { usePlans } from "@/hooks/usePlans"
import type { Cycle, PaidTier, PlanRow } from "@/lib/billing"
import { CheckoutDismissed } from "@/lib/razorpay"
import { cn } from "@/lib/utils"

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const low = limit > 0 && limit - used <= Math.max(1, Math.round(limit * 0.1))
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="micro-label">{label}</span>
        <span className="font-mono text-xs text-text-secondary">
          {used.toLocaleString("en-IN")} / {limit.toLocaleString("en-IN")}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
        <div
          className={cn("h-full rounded-full transition-all", low ? "bg-destructive" : "bg-brand")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function Billing() {
  const [params] = useSearchParams()
  const { data: plans } = usePlans()
  const { data: me } = useBilling()
  const upgrade = useUpgrade()

  const [cycle, setCycle] = useState<Cycle>(params.get("cycle") === "monthly" ? "monthly" : "quarterly")
  const highlightTier = params.get("tier")
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; msg: string } | null>(null)

  const currentPlan = me?.plan ?? "free"
  const sorted = useMemo(() => [...(plans ?? [])].sort((a, b) => a.sort - b.sort), [plans])

  const onBuy = (tier: PaidTier) => {
    setNotice(null)
    upgrade.mutate(
      { tier, cycle },
      {
        onSuccess: (snap) =>
          setNotice({ kind: "ok", msg: `You're on ${snap.plan.toUpperCase()} — enjoy the desk.` }),
        onError: (err) => {
          if (err instanceof CheckoutDismissed) return // user closed the modal — not an error
          setNotice({ kind: "error", msg: err.message })
        },
      },
    )
  }

  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow="Billing"
        title={
          <>
            Plans &amp; <span className="text-gradient">billing.</span>
          </>
        }
        subtitle="Upgrade for more research, more chat credits, and AI on your trade journal. Founding-member rates — lock yours in today."
      />

      {/* Current usage — only when metering is on (hidden in local dev / unconfigured). */}
      {me?.metered ? (
        <Card className="card-glass mt-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="micro-label">Current plan</p>
                <p className="mt-1 font-display text-2xl font-bold capitalize text-text-primary">
                  {currentPlan}
                </p>
              </div>
              {me.current_period_end ? (
                <p className="text-xs text-text-secondary">
                  Renews / expires{" "}
                  <span className="text-text-primary">
                    {new Date(me.current_period_end).toLocaleDateString("en-IN")}
                  </span>
                </p>
              ) : null}
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <UsageBar label="Chat credits / mo" used={me.credits.used} limit={me.credits.limit} />
              <UsageBar label="Research / mo" used={me.research.used} limit={me.research.limit} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Cycle toggle */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-hairline-strong bg-panel p-1 shadow-sm">
          {(["monthly", "quarterly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              aria-pressed={cycle === c}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
                cycle === c
                  ? "bg-violet/15 text-brand-strong ring-1 ring-violet/40"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {c}
              {c === "quarterly" ? (
                <span className="ml-1.5 rounded-full bg-pos/20 px-1.5 py-0.5 text-[10px] font-bold text-pos">
                  SAVE MORE
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {notice ? (
        <div
          className={cn(
            "mt-6 flex items-center gap-3 rounded-xl border p-3 text-sm",
            notice.kind === "ok"
              ? "border-pos/30 bg-pos/[0.08] text-pos"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {notice.kind === "ok" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          {notice.msg}
        </div>
      ) : null}

      {/* Plan cards */}
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">
        {sorted.map((plan) => (
          <PlanCard
            key={plan.tier}
            plan={plan}
            cycle={cycle}
            isCurrent={plan.tier === currentPlan}
            highlight={highlightTier === plan.tier}
            pending={upgrade.isPending && upgrade.variables?.tier === plan.tier}
            anyPending={upgrade.isPending}
            onBuy={onBuy}
          />
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-text-secondary/70">
        Payments are processed securely by Razorpay. Research, not investment advice.
      </p>
    </PageShell>
  )
}

function PlanCard({
  plan,
  cycle,
  isCurrent,
  highlight,
  pending,
  anyPending,
  onBuy,
}: {
  plan: PlanRow
  cycle: Cycle
  isCurrent: boolean
  highlight: boolean
  pending: boolean
  anyPending: boolean
  onBuy: (tier: PaidTier) => void
}) {
  const price = plan.pricing[cycle]
  const isFree = plan.tier === "free"
  const emphasised = highlight || plan.popular

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[22px] border p-7 backdrop-blur-xl",
        emphasised
          ? "border-violet/50 bg-[var(--glass-strong-bg)] shadow-[0_40px_90px_-30px_rgba(5,150,105,0.5)] ring-2 ring-violet/40"
          : "border-hairline-strong bg-[var(--glass-strong-bg)]",
      )}
    >
      {plan.popular ? (
        <span className="absolute right-5 top-0 inline-flex items-center gap-1 rounded-b-lg bg-gradient-to-r from-violet-500 to-teal-500 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
          <Sparkles className="size-3" />
          Most popular
        </span>
      ) : null}

      <h3 className="font-display text-lg font-semibold tracking-tight text-text-primary">
        {plan.name}
      </h3>
      <p className="mt-1 min-h-[2.5rem] text-sm leading-relaxed text-text-secondary">
        {plan.tagline}
      </p>

      <div className="mt-5">
        {isFree || price.amount_paise === 0 ? (
          <span className="font-display text-4xl font-bold tracking-tight text-text-primary">Free</span>
        ) : (
          <div className="flex items-end gap-2">
            {price.listPerMonth ? (
              <span className="pb-1.5 font-mono text-sm text-text-secondary/50 line-through">
                ₹{price.listPerMonth.toLocaleString("en-IN")}
              </span>
            ) : null}
            <span className="font-display text-4xl font-bold tracking-tight text-text-primary">
              ₹{price.perMonth.toLocaleString("en-IN")}
            </span>
            <span className="pb-1.5 text-sm text-text-secondary">/mo</span>
          </div>
        )}
        <p className="mt-2 min-h-4 text-xs text-text-secondary/70">{price.billed}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-hairline bg-surface px-3 py-2.5">
          <p className="font-display text-xl font-bold leading-none text-text-primary">
            {plan.dossiers_label ?? plan.research_per_month}
          </p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-text-secondary">
            research / mo
          </p>
        </div>
        <div className="rounded-xl border border-hairline bg-surface px-3 py-2.5">
          <p className="font-display text-xl font-bold leading-none text-text-primary">
            {plan.credits_label ?? plan.credits_per_month}
          </p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-text-secondary">
            chat credits / mo
          </p>
        </div>
      </div>

      <div className="mt-5">
        {isCurrent ? (
          <Button size="lg" variant="outline" className="w-full border-hairline-strong" disabled>
            <Check className="size-4" />
            Current plan
          </Button>
        ) : isFree ? (
          <Button size="lg" variant="outline" className="w-full border-hairline-strong" disabled>
            Free forever
          </Button>
        ) : (
          <Button
            size="lg"
            className={cn("btn-primary w-full gap-2 text-white")}
            disabled={anyPending}
            onClick={() => onBuy(plan.tier as PaidTier)}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {pending ? "Opening checkout…" : plan.cta ?? `Go ${plan.name}`}
          </Button>
        )}
      </div>

      <p className="mb-3 mt-6 border-t border-hairline pt-6 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
        {plan.includes_lead ?? "What's included"}
      </p>
      <ul className="space-y-2.5">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-3 text-sm text-text-secondary">
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md ring-1",
                f.spark ? "bg-spark/15 text-spark-strong ring-spark/25" : "bg-pos/15 text-pos ring-pos/25",
              )}
            >
              {f.spark ? <Sparkles className="size-3" /> : <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className={cn(f.spark && "font-medium text-text-primary")}>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
