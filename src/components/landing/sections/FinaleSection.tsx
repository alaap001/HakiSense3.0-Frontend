import { Link } from "react-router-dom"
import { ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

/**
 * Act 6 — the payoff. The Jobs closer: name the pain from Act 1 one more time,
 * then take it away in a single line. The spark chip is the one deliberate orange
 * on the page. One headline, one button.
 */
export function FinaleSection() {
  const { isAuthenticated } = useAuth()
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup"

  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div
        aria-hidden
        data-parallax="40"
        className="act-turn pointer-events-none absolute inset-x-0 -inset-y-20 z-0"
      />
      <div
        aria-hidden
        className="sun-glow pointer-events-none absolute left-1/2 top-1/2 z-0 size-[34rem] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 blur-[44px]"
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-spark/30 bg-spark/10 px-3 py-1 text-xs font-medium text-spark-strong"
          data-reveal
        >
          <Sparkles className="size-3.5 fill-spark text-spark" />
          Your first dossier is free
        </span>

        <p className="mt-7 text-lg leading-relaxed text-text-secondary" data-reveal>
          The weekend of reading. The terminal you couldn't afford. The move you kept missing.
        </p>
        <h2
          className="mt-3 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl"
          data-reveal
        >
          Gone — <span className="text-gradient">for the price of one search.</span>
        </h2>

        <div data-reveal className="mt-9">
          <Button asChild size="lg" className="btn-primary h-12 gap-2 text-white">
            <Link to={primaryHref}>
              Research your first stock
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-text-secondary" data-reveal>
          Free to start · no card required · your next idea is one search away
        </p>
      </div>
    </section>
  )
}
