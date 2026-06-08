import { ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"

/**
 * Act 5 — credibility. The differentiator and the honesty discipline: research,
 * not recommendations. One calm band, no BUY button to hide behind.
 */
export function PrincipleSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="card-glass relative overflow-hidden rounded-3xl p-10 text-center sm:p-14" data-reveal>
        <div
          aria-hidden
          className="sun-glow pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full opacity-50 blur-[60px]"
        />
        <div className="relative">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Research. <span className="text-gradient">Not recommendations.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-secondary">
            We don't hand you a BUY button to hide behind. Every analyst report passes a quality gate that
            strips opinion and keeps evidence — so the conviction is yours, and so is the edge.
            That's the whole point.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-text-secondary">
              <ShieldCheck className="size-3 text-brand" />
              Evidence-gated
            </Badge>
            <Badge variant="secondary" className="px-3 py-1 text-text-secondary">Indian listed equities</Badge>
            <Badge variant="secondary" className="px-3 py-1 text-text-secondary">Source-cited findings</Badge>
          </div>
        </div>
      </div>
    </section>
  )
}
