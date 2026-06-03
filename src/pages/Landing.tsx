import { useRef } from "react"
import { Link } from "react-router-dom"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import {
  Activity,
  ArrowRight,
  ChevronDown,
  LayoutGrid,
  ListChecks,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { HeroSearch } from "@/components/landing/HeroSearch"
import { LandingNav } from "@/components/landing/LandingNav"
import { SiteFooter } from "@/components/site/SiteFooter"
import { useTickerSearch } from "@/components/search/TickerSearchProvider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const EXAMPLES = ["RELIANCE", "TCS", "INFY"]

const TICKERS = [
  { symbol: "RELIANCE", price: "2,847.35", change: "+1.8%", up: true },
  { symbol: "TCS", price: "4,125.50", change: "+0.9%", up: true },
  { symbol: "INFY", price: "1,785.20", change: "-0.5%", up: false },
  { symbol: "HDFCBANK", price: "1,678.90", change: "+0.6%", up: true },
]

const STEPS = [
  {
    n: "01",
    title: "Enter a ticker",
    body: "Type any listed Indian stock. No dashboards to configure, no watchlists to build.",
  },
  {
    n: "02",
    title: "Watch it research",
    body: "A multi-agent pipeline reads filings, financials and transcripts — streamed to you live, step by step.",
  },
  {
    n: "03",
    title: "Read the dossier",
    body: "Thesis, findings, scenarios and risks — every claim backed by a quoted source, gated against opinion.",
  },
]

const FEATURES = [
  { icon: Target, title: "Thesis board", body: "Falsifiable pillars with evidence-strength and explicit kill criteria." },
  { icon: ListChecks, title: "Findings & evidence", body: "Every claim tagged bull / bear / fact and backed by a quoted source." },
  { icon: Scale, title: "Valuation scenarios", body: "Bull, base and bear fair values with probabilities and drivers." },
  { icon: ShieldAlert, title: "Risks & red flags", body: "Governance, accounting and execution concerns, surfaced — not buried." },
  { icon: LayoutGrid, title: "Coverage map", body: "Twelve research lenses, each marked empty, touched or covered." },
  { icon: Activity, title: "Live streaming", body: "Follow the run as it happens — every step and tool call, in real time." },
]

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const { openSearch } = useTickerSearch()
  const container = useRef<HTMLDivElement>(null)
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup"

  useGSAP(
    () => {
      // Hero entrance — eyebrow, headline, search, then the ticker row.
      // `from` tweens (no hardcoded opacity-0 class) so content stays visible
      // even if the animation never runs.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      tl.from(".hero-eyebrow", { y: 16, opacity: 0, duration: 0.6 }, 0.1)
        .from(".headline-line", { y: 40, rotateX: 20, opacity: 0, duration: 0.8 }, 0.25)
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.6 }, 0.55)

      // Ticker row — a tidy, staggered fade-in, then a slow gentle float.
      gsap.utils.toArray<HTMLElement>(".stock-ticker").forEach((t, i) => {
        gsap.from(t, {
          y: 16,
          opacity: 0,
          duration: 0.5,
          delay: 0.9 + i * 0.08,
          ease: "power2.out",
        })
        // Once settled, drift up/down slowly — slightly desynced per pill so the
        // row feels alive. Starts after the entrance so it doesn't fight that tween.
        gsap.to(t, {
          y: -5,
          duration: 2.4 + i * 0.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.5 + i * 0.2,
        })
      })

      // Scroll cue fades in last.
      gsap.from(".hero-scroll-cue", { opacity: 0, duration: 0.6, delay: 1.3 })

      // Parallax scroll-out: the hero pins, holds briefly, then the whole stack
      // drifts up and fades as you scroll. `onLeaveBack` restores it on the way up.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: 0.6,
            onLeaveBack: () => gsap.set(".hero-inner", { opacity: 1, y: 0 }),
          },
        })
        .fromTo(
          ".hero-inner",
          { y: 0, opacity: 1 },
          { y: "-12vh", opacity: 0, ease: "power2.in" },
          0.3,
        )

      // Below-fold section reveals
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 32,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        })
      })
    },
    { scope: container },
  )

  return (
    <div ref={container} className="grain relative min-h-screen bg-background text-text-primary">
      {/* Fixed atmospheric backdrop — theme-aware city skyline. Light: a bright
          sunrise city above the clouds. Dark: the moody night skyline. Both are
          muted by a theme overlay so the headline + search stay legible. */}
      <div aria-hidden className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/hero-bg-light-theme.png"
          alt=""
          className="block h-full w-full object-cover dark:hidden"
        />
        <img
          src="/hero-bg.jpg"
          alt=""
          className="hidden h-full w-full object-cover dark:block"
        />
        <div className="absolute inset-0 bg-background/85 dark:bg-background/80" />
        <div className="absolute inset-0 vignette" />
      </div>

      <LandingNav />

      <div className="relative z-10">
        {/* Hero — centered, search-first. One clear path: type a ticker. */}
        <section className="hero-section flex min-h-screen items-center justify-center">
          <div className="hero-inner mx-auto w-full max-w-3xl px-6 text-center">
            {/* Why */}
            <div className="hero-eyebrow mb-10 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium text-text-secondary">
                <ShieldCheck className="size-3 text-brand" />
                Research, not recommendations
              </span>
            </div>

            {/* What — one calm line */}
            <div className="hero-headline" style={{ perspective: 800 }}>
              <h1 className="headline-line font-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                See what <span className="text-gradient">others miss</span> in the filings
              </h1>
            </div>

            {/* How / where — the one primary action */}
            <div className="hero-cta mt-12 flex flex-col items-center gap-5">
              <HeroSearch />
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="text-text-secondary/70">Try</span>
                {EXAMPLES.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={openSearch}
                    className="rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-xs text-text-primary transition-colors hover:border-brand/50 hover:text-brand"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* A calm glimpse of the live market — one tidy row */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-2">
              {TICKERS.map((s) => (
                <div
                  key={s.symbol}
                  className="stock-ticker glass flex items-center gap-1.5 rounded-full px-3 py-1.5"
                >
                  <span className="font-mono text-[11px] font-bold text-text-primary">{s.symbol}</span>
                  <span className="font-mono text-[11px] text-text-secondary">₹{s.price}</span>
                  <span
                    className={`flex items-center gap-0.5 text-[11px] font-medium ${s.up ? "text-pos" : "text-neg"}`}
                  >
                    {s.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {s.change}
                  </span>
                </div>
              ))}
            </div>

            {/* Where next — a quiet scroll cue (glides instead of jumping) */}
            <a
              href="#how"
              onClick={(e) => {
                const target = document.getElementById("how")
                if (!target) return
                e.preventDefault()
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
                target.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" })
              }}
              className="hero-scroll-cue mt-14 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              See what&apos;s inside
              <ChevronDown className="size-4 animate-bounce" />
            </a>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight" data-reveal>
            From ticker to dossier, <span className="text-gradient">live.</span>
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} data-reveal className="card-glass rounded-2xl p-6">
                <span className="font-mono text-sm text-brand/80">{s.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What's inside */}
        <section id="dossier" className="mx-auto max-w-6xl px-6 py-20">
          <p className="micro-label" data-reveal>
            What&apos;s inside a dossier
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight" data-reveal>
            Everything you&apos;d build by hand — assembled and cited.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} data-reveal className="card-glass rounded-2xl p-6">
                <span className="grid size-10 place-items-center rounded-xl glass glow-violet-subtle">
                  <f.icon className="size-5 text-brand" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Approach */}
        <section id="approach" className="mx-auto max-w-6xl px-6 py-20">
          <div className="card-glass relative overflow-hidden rounded-3xl p-10 text-center" data-reveal>
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet/20 blur-[120px]"
            />
            <div className="relative">
              <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Research. <span className="text-gradient">Not recommendations.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-secondary">
                No price targets. No BUY / HOLD / SELL. Every dossier passes a quality gate
                that strips opinion and keeps evidence — so you draw the conclusions.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-text-secondary">
                  <ShieldCheck className="size-3 text-brand" />
                  Evidence-gated
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-text-secondary">
                  Indian listed equities
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-text-secondary">
                  Source-cited findings
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
          <div className="flex flex-col items-center gap-5 text-center" data-reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Research your next idea.
            </h2>
            <Button asChild size="lg" className="btn-primary h-12 gap-2 text-white">
              <Link to={primaryHref}>
                Start researching
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <SiteFooter />
      </div>
    </div>
  )
}
