import { type KeyboardEvent, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Check, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { usePlans } from "@/hooks/usePlans"
import type { PlanRow } from "@/lib/billing"
import { formatMoney } from "@/lib/market"
import { cn } from "@/lib/utils"

/**
 * Act 5.5 — the offer. Three per-seat tiers the visitor can click to select (Desk is
 * the default, "Most popular"). The selected card gets the emerald hero emphasis —
 * ring, glow, tint, raise, filled CTA — so picking a plan feels tactile even though
 * billing isn't wired yet (a later Stripe phase just reads the choice). Savings stay
 * in money-green (pos), keeping the brand's one deliberate orange for the Finale chip.
 *
 * Quarterly is the default cycle and every price is shown PER SEAT / MONTH, so switching
 * to quarterly visibly drops the headline number — the strongest nudge toward the sale.
 *
 * Prices here are the STATIC FALLBACK used only if GET /api/plans returns nothing; the
 * live, admin-editable plans override them. Currency follows MARKET (lib/market).
 *
 * Cards are composed from Tailwind utilities (NOT .card-glass, which hard-sets
 * box-shadow and would swallow the ring/shadow). The select transition animates only
 * margin/shadow/border/background — never transform/opacity, which the [data-reveal]
 * GSAP entrance drives — and the raise is margin, not transform, for the same reason.
 */

type Cycle = "monthly" | "quarterly"
type TierId = "free" | "pro" | "ultra"

type CyclePrice = {
  /** the big, per-month figure shown */
  perMonth: number
  /** struck-through per-month list price */
  listPerMonth?: number
  /** percent off, badged as "Save N%" */
  discount?: number
  /** small line under the price: how it's actually billed */
  billed: string
}

type Tier = {
  id: TierId
  name: string
  tagline: string
  popular?: boolean
  cta: string
  /** headline quotas for the 2-up stat strip */
  dossiers: string
  credits: string
  /** "Everything in X, plus" lead above the feature list */
  includesLead?: string
  features: { text: string; spark?: boolean }[]
  monthly: CyclePrice
  quarterly: CyclePrice
}

// Per-seat fallback pricing for US B2B desks (USD). Quarterly is shown as a per-seat,
// per-month figure; the `billed` line states the true per-seat quarterly charge.
const TIERS: Tier[] = [
  {
    id: "free",
    name: "Trial",
    tagline: "Put the desk through its paces — one full report, on us.",
    cta: "Start free",
    dossiers: "1",
    credits: "200",
    features: [
      { text: "One full evidence-gated analyst report" },
      { text: "Live-streamed research run" },
      { text: "Ask-the-filing chat with cited sources" },
      { text: "Trade journal — free forever" },
      { text: "Equity curve, win-rate & R-multiples" },
      { text: "Your research history, saved" },
    ],
    monthly: { perMonth: 0, billed: "No card required" },
    quarterly: { perMonth: 0, billed: "No card required" },
  },
  {
    id: "pro",
    name: "Desk",
    tagline: "For the analyst or PM running names every day.",
    popular: true,
    cta: "Start a Desk seat",
    dossiers: "30",
    credits: "3,000",
    includesLead: "Everything in Trial, plus",
    features: [
      { text: "Full analyst reports — scenarios, valuation, financials & coverage" },
      { text: "Deep evidence retrieval across filings & transcripts" },
      { text: "Priority research queue" },
      { text: "Shared research history across your seats" },
      { text: "Room to dig through long research sessions" },
      { text: "Early access to new research agents" },
    ],
    monthly: { perMonth: 100, listPerMonth: 149, discount: 33, billed: "per seat · billed monthly" },
    quarterly: {
      perMonth: 82,
      listPerMonth: 149,
      discount: 45,
      billed: `${formatMoney(246)} per seat · billed quarterly`,
    },
  },
  {
    id: "ultra",
    name: "Enterprise",
    tagline: "Desk-grade volume, plus an AI eye on every trade.",
    cta: "Go Enterprise",
    dossiers: "150",
    credits: "25,000",
    includesLead: "Everything in Desk, plus",
    features: [
      { text: "AI-powered review of your Journal trades", spark: true },
      { text: "Critique of entries, stops, sizing & plan adherence" },
      { text: "Recurring-mistake detection across the desk" },
      { text: "The highest research & chat limits" },
      { text: "SSO, API access & priority support" },
      { text: "Custom coverage & volume seats on request" },
    ],
    monthly: { perMonth: 300, listPerMonth: 577, discount: 48, billed: "per seat · billed monthly" },
    quarterly: {
      perMonth: 196,
      listPerMonth: 577,
      discount: 66,
      billed: `${formatMoney(588)} per seat · billed quarterly`,
    },
  },
]

function PriceBlock({
  tier,
  cycle,
  highlight,
}: {
  tier: Tier
  cycle: Cycle
  highlight: boolean
}) {
  const p = tier[cycle]

  if (p.perMonth === 0) {
    return (
      <div className="mt-5">
        <span
          className={cn(
            "font-display text-5xl font-bold tracking-tight",
            highlight ? "text-gradient" : "text-text-primary",
          )}
        >
          Free
        </span>
        <p className="mt-2 min-h-4 text-xs text-text-secondary/70">{p.billed}</p>
      </div>
    )
  }

  return (
    <div className="mt-5">
      {p.discount ? (
        <span className="inline-flex items-center rounded-full bg-pos/15 px-2.5 py-1 text-[11px] font-bold text-pos ring-1 ring-pos/25">
          Save {p.discount}%
        </span>
      ) : null}
      <div className="mt-2.5 flex items-end gap-2">
        {p.listPerMonth ? (
          <span className="pb-1.5 font-mono text-sm text-text-secondary/50 line-through">
            {formatMoney(p.listPerMonth)}
          </span>
        ) : null}
        <span
          className={cn(
            "font-display text-5xl font-bold tracking-tight",
            highlight ? "text-gradient" : "text-text-primary",
          )}
        >
          {formatMoney(p.perMonth)}
        </span>
        <span className="pb-1.5 text-sm text-text-secondary">/seat · mo</span>
      </div>
      <p className="mt-2 min-h-4 text-xs text-text-secondary/70">{p.billed}</p>
    </div>
  )
}

/** Map a backend billing_plans row to the local presentational Tier shape. */
function planRowToTier(p: PlanRow): Tier {
  return {
    id: p.tier,
    name: p.name,
    tagline: p.tagline ?? "",
    popular: p.popular,
    cta: p.cta ?? "Choose",
    dossiers: p.dossiers_label ?? String(p.research_per_month),
    credits: p.credits_label ?? String(p.credits_per_month),
    includesLead: p.includes_lead ?? undefined,
    features: p.features ?? [],
    monthly: p.pricing.monthly,
    quarterly: p.pricing.quarterly,
  }
}

export function PricingSection() {
  const { isAuthenticated } = useAuth()
  const { data: plans } = usePlans()
  const [cycle, setCycle] = useState<Cycle>("quarterly")
  const [selected, setSelected] = useState<TierId>("pro")

  // Pricing is backend-driven (admin-editable); fall back to the static TIERS if the API blips.
  const tiers: Tier[] = useMemo(
    () => (plans && plans.length ? plans.map(planRowToTier) : TIERS),
    [plans],
  )

  // Trial → start using the app; paid seats → the billing page (it runs checkout).
  // Signed-out visitors are sent to sign up first.
  const ctaHref = (tier: Tier) =>
    tier.id === "free"
      ? isAuthenticated
        ? "/dashboard"
        : "/signup"
      : isAuthenticated
        ? `/billing?tier=${tier.id}&cycle=${cycle}`
        : "/signup"

  return (
    <section id="pricing" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-28">
      {/* Layered backdrop — visible emerald + powder blooms give the pale section depth.
          Parallax wrapper is transform-free; the blooms own their translate-centering. */}
      <div aria-hidden data-parallax="30" className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute left-1/2 top-[48%] size-[42rem] max-w-[130vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.22), transparent 60%)" }}
        />
        <div
          className="absolute right-[6%] top-[14%] size-[24rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(79,163,204,0.16), transparent 62%)" }}
        />
        <div
          className="absolute bottom-[6%] left-[4%] size-[22rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.14), transparent 64%)" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="micro-label">Pricing</p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Desk-grade research.{" "}
            <span className="text-gradient">At per-seat prices.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            A rounding error next to a terminal seat. Add analysts as the desk grows — no
            annual lock-in, no per-report metering games. Lock in launch rates while
            we&apos;re early —{" "}
            <span className="font-semibold text-text-primary">up to 52% off</span>.
          </p>
        </div>

        {/* Billing toggle — quarterly is the default and the emphasised "best value". */}
        <div className="mt-8 flex flex-col items-center gap-3" data-reveal>
          <div className="inline-flex items-center gap-1 rounded-full border border-hairline-strong bg-panel p-1 shadow-sm backdrop-blur-md">
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
                    SAVE 52%
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-secondary">
            {cycle === "quarterly" ? (
              <span className="font-medium text-pos">
                Best value — you&apos;re locking in up to 52% off with quarterly billing.
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setCycle("quarterly")}
                className="font-medium text-brand-strong underline-offset-2 hover:underline"
              >
                Switch to quarterly and save up to 52% →
              </button>
            )}
          </p>
        </div>

        {/* Tier cards — a radiogroup; click / Enter / Space selects. */}
        <div
          role="radiogroup"
          aria-label="Choose a plan"
          className="mt-12 grid items-start gap-6 lg:grid-cols-3"
        >
          {tiers.map((tier) => {
            const isSelected = selected === tier.id
            const select = () => setSelected(tier.id)
            const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                select()
              }
            }

            return (
              <div
                key={tier.id}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${tier.name} plan`}
                tabIndex={0}
                onClick={select}
                onKeyDown={onKeyDown}
                className={cn(
                  "group relative flex cursor-pointer select-none flex-col overflow-hidden rounded-[22px] border text-left outline-none backdrop-blur-xl",
                  "transition-[margin,box-shadow,border-color,background-color] duration-300",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet",
                  isSelected
                    ? "border-violet/50 bg-[var(--glass-strong-bg)] shadow-[0_40px_90px_-30px_rgba(5,150,105,0.5)] ring-2 ring-violet/40 lg:mt-0"
                    : "border-hairline-strong bg-[var(--glass-strong-bg)] shadow-[0_24px_56px_-34px_rgba(2,28,20,0.5)] hover:border-violet/30 lg:mt-8",
                )}
              >
                {/* Emerald hero tint — fades in on selection. */}
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-b from-violet/12 via-transparent to-transparent transition-opacity duration-300",
                    isSelected ? "opacity-100" : "opacity-0",
                  )}
                />

                {/* Flush top-right "Most popular" tab — Pro only, regardless of selection. */}
                {tier.popular ? (
                  <span className="absolute right-5 top-0 z-20 inline-flex items-center gap-1 rounded-b-lg bg-gradient-to-r from-violet-500 to-teal-500 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.7)]">
                    <Sparkles className="size-3" />
                    Most popular
                  </span>
                ) : null}

                <div className="relative z-10 flex flex-1 flex-col p-7">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-text-primary">
                      {tier.name}
                    </h3>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet/15 px-2 py-0.5 text-[10px] font-semibold text-brand-strong ring-1 ring-violet/30">
                        <Check className="size-2.5" strokeWidth={3} />
                        Selected
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 min-h-[2.5rem] text-sm leading-relaxed text-text-secondary">
                    {tier.tagline}
                  </p>

                  <PriceBlock tier={tier} cycle={cycle} highlight={isSelected} />

                  {/* Quota strip — the big numbers, front and centre. */}
                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl border border-hairline bg-surface px-3 py-2.5">
                      <p className="font-display text-xl font-bold leading-none text-text-primary">
                        {tier.dossiers}
                      </p>
                      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-text-secondary">
                        analyst reports / mo
                      </p>
                    </div>
                    <div className="rounded-xl border border-hairline bg-surface px-3 py-2.5">
                      <p className="font-display text-xl font-bold leading-none text-text-primary">
                        {tier.credits}
                      </p>
                      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-text-secondary">
                        chat credits / mo
                      </p>
                    </div>
                  </div>

                  <Button
                    asChild
                    size="lg"
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "mt-5 w-full gap-2",
                      isSelected ? "btn-primary text-white" : "border-hairline-strong",
                    )}
                  >
                    <Link to={ctaHref(tier)}>
                      {tier.cta}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>

                  <p className="mb-3 mt-6 border-t border-hairline pt-6 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                    {tier.includesLead ?? "What's included"}
                  </p>
                  <ul className="space-y-2.5">
                    {tier.features.map((f) => (
                      <li
                        key={f.text}
                        className="flex items-start gap-3 text-sm text-text-secondary"
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md ring-1",
                            f.spark
                              ? "bg-spark/15 text-spark-strong ring-spark/25"
                              : "bg-pos/15 text-pos ring-pos/25",
                          )}
                        >
                          {f.spark ? (
                            <Sparkles className="size-3" />
                          ) : (
                            <Check className="size-3" strokeWidth={3} />
                          )}
                        </span>
                        <span className={cn(f.spark && "font-medium text-text-primary")}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-10 text-center text-xs text-text-secondary/70" data-reveal>
          Free to start · no card required · cancel anytime. Launch rates — lock yours
          in today. Chat credits power follow-up questions on any stock (1 credit ≈ one message).
        </p>
        <p className="mt-3 text-center text-sm text-text-secondary" data-reveal>
          Need SSO, API access, custom coverage or volume seats for the whole desk?{" "}
          <Link to="/contact" className="font-medium text-brand-strong underline-offset-2 hover:underline">
            Talk to sales →
          </Link>
        </p>
      </div>
    </section>
  )
}
