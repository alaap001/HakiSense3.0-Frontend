import { useRef } from "react"
import { Link } from "react-router-dom"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  FileText,
  LayoutGrid,
  ListChecks,
  MessageSquare,
  Percent,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react"

import { ChatMock, DossierMock, JournalMock } from "@/components/landing/mockups"
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

const STATS = [
  { k: "5,700+", v: "listed stocks, ready the moment you ask" },
  { k: "12", v: "research lenses behind every dossier" },
  { k: "100%", v: "of claims cited to a real source" },
  { k: "Minutes", v: "from a ticker to a full dossier" },
]

const STEPS = [
  {
    n: "01",
    title: "Type one ticker",
    body: "Any of 5,700+ listed Indian names. No dashboards to wire up, no watchlists to babysit. Just the name.",
  },
  {
    n: "02",
    title: "Watch it tear through the filings",
    body: "A team of AI analysts reads the annual report, the transcripts, the financials — live, in front of you, in real time.",
  },
  {
    n: "03",
    title: "Walk away with the dossier",
    body: "Thesis, findings, scenarios, red flags — every line cited. A week of an analyst's work, done before your coffee's cold.",
  },
]

const FEATURES = [
  { icon: Target, title: "A thesis that can be wrong", body: "Falsifiable pillars with evidence-strength and explicit kill criteria. The bull case and the trap, side by side." },
  { icon: ListChecks, title: "Findings you can trust", body: "Every claim tagged bull / bear / fact and chained to a quoted source. No vibes. No hand-waving." },
  { icon: Scale, title: "Scenarios, not guesses", body: "Bull, base and bear fair values with probabilities and the drivers that actually move them." },
  { icon: ShieldAlert, title: "The red flags, surfaced", body: "Governance, accounting and execution risks dragged into the light — not buried on page 230." },
  { icon: LayoutGrid, title: "Twelve lenses, no blind spots", body: "Each research angle marked empty, touched or covered — so you see exactly what's been examined." },
  { icon: Activity, title: "Watch it think, live", body: "Every step and tool call streamed as it happens. Research you can actually look over the shoulder of." },
]

const CHAT_POINTS = [
  { icon: FileText, text: "Answers grounded in the actual filing — with the page cited." },
  { icon: ShieldCheck, text: "No hallucinated numbers. If it isn't in the document, it won't pretend." },
  { icon: MessageSquare, text: "Plain English in, plain English out. Ask like you'd ask a colleague." },
]

const JOURNAL_POINTS = [
  { icon: TrendingUp, text: "Equity curve that shows your edge appearing — or leaking away." },
  { icon: Percent, text: "Win rate, R-multiples and expectancy, computed for you." },
  { icon: CalendarDays, text: "A calendar heatmap of green and red days you can't argue with." },
]

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const { openSearch } = useTickerSearch()
  const container = useRef<HTMLDivElement>(null)
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup"

  useGSAP(
    () => {
      // Hero entrance — eyebrow, headline, sub, search/cta, then the ticker row. `from`
      // tweens (no hardcoded opacity-0) so content stays visible if the tween never runs.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      tl.from(".hero-eyebrow", { y: 16, opacity: 0, duration: 0.6 }, 0.1)
        .from(".headline-line", { y: 40, rotateX: 18, opacity: 0, duration: 0.85 }, 0.2)
        .from(".hero-sub", { y: 22, opacity: 0, duration: 0.6 }, 0.5)
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.6 }, 0.65)
        .from(".hero-trust", { y: 14, opacity: 0, duration: 0.5 }, 0.8)

      // Floating product mockups — drift in, then bob gently and out of sync.
      gsap.utils.toArray<HTMLElement>(".hero-mock").forEach((m, i) => {
        gsap.from(m, { y: 40, opacity: 0, scale: 0.94, duration: 0.9, delay: 0.7 + i * 0.15, ease: "power3.out" })
        gsap.to(m, { y: "+=14", duration: 3 + i * 0.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.4 + i * 0.3 })
      })

      // Ticker row — staggered fade-in, then a slow gentle float.
      gsap.utils.toArray<HTMLElement>(".stock-ticker").forEach((t, i) => {
        gsap.from(t, { y: 16, opacity: 0, duration: 0.5, delay: 1 + i * 0.08, ease: "power2.out" })
        gsap.to(t, { y: -5, duration: 2.4 + i * 0.3, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.6 + i * 0.2 })
      })

      // Scroll cue fades in last.
      gsap.from(".hero-scroll-cue", { opacity: 0, duration: 0.6, delay: 1.4 })

      // Hero parallax-out: as you scroll, the hero stack drifts up and fades. No pin —
      // keeps the scroll smooth and avoids layout jank.
      gsap.to(".hero-inner", {
        y: "-14vh",
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 0.5 },
      })

      // Below-fold section reveals.
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
      {/* Fixed sunset sky — pure CSS gradient (powder blue → peach → cream by day, deep
          navy with an ember horizon by night). No photo asset. */}
      <div aria-hidden className="sunset-sky fixed inset-0 z-0" />
      <div aria-hidden className="vignette fixed inset-0 z-0" />

      <LandingNav />

      <div className="relative z-10">
        {/* ───────────────────────────── HERO ───────────────────────────── */}
        <section className="hero-section relative flex min-h-screen items-center justify-center overflow-hidden">
          {/* The "sun" — a warm bloom behind the headline. */}
          <div
            aria-hidden
            className="sun-glow pointer-events-none absolute left-1/2 top-[36%] z-0 size-[44rem] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[30px]"
          />

          {/* Floating product mockups peek from the corners on wide screens. */}
          <DossierMock className="hero-mock absolute left-[3%] top-[13%] z-0 hidden -rotate-6 xl:block 2xl:left-[7%]" />
          <ChatMock className="hero-mock absolute right-[3%] top-[17%] z-0 hidden rotate-[6deg] xl:block 2xl:right-[7%]" />
          <JournalMock className="hero-mock absolute bottom-[8%] left-[6%] z-0 hidden -rotate-3 2xl:block" />

          <div className="hero-inner relative z-10 mx-auto w-full max-w-3xl px-6 text-center">
            {/* FOMO eyebrow */}
            <div className="hero-eyebrow mb-8 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-xs font-medium text-brand-strong">
                <Zap className="size-3.5 fill-brand text-brand" />
                The edge institutions guard — now one search away
              </span>
            </div>

            {/* The hook */}
            <div className="hero-headline" style={{ perspective: 900 }}>
              <h1 className="headline-line font-display text-4xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-6xl">
                See what the market <span className="text-gradient">misses</span>.
                <br className="hidden sm:block" /> Before it moves.
              </h1>
            </div>

            <p className="hero-sub mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
              HakiSense reads every filing, transcript and footnote of any listed Indian stock
              and hands you a research dossier that used to cost a desk of analysts —
              <span className="font-semibold text-text-primary"> thesis, evidence, scenarios, red flags.</span>{" "}
              In minutes. While everyone else is still reading headlines.
            </p>

            {/* One clear action */}
            <div className="hero-cta mt-9 flex flex-col items-center gap-4">
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

            <div className="hero-trust mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-pos" /> Free to start</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-pos" /> No card required</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-pos" /> 5,700+ stocks live now</span>
            </div>

            {/* A calm glimpse of the live market */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
              {TICKERS.map((s) => (
                <div key={s.symbol} className="stock-ticker glass flex items-center gap-1.5 rounded-full px-3 py-1.5">
                  <span className="font-mono text-[11px] font-bold text-text-primary">{s.symbol}</span>
                  <span className="font-mono text-[11px] text-text-secondary">₹{s.price}</span>
                  <span className={`flex items-center gap-0.5 text-[11px] font-medium ${s.up ? "text-pos" : "text-neg"}`}>
                    {s.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {s.change}
                  </span>
                </div>
              ))}
            </div>

            {/* Scroll cue */}
            <a
              href="#stats"
              onClick={(e) => {
                const target = document.getElementById("stats")
                if (!target) return
                e.preventDefault()
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
                target.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" })
              }}
              className="hero-scroll-cue mt-12 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              See why it's unfair
              <ChevronDown className="size-4 animate-bounce" />
            </a>
          </div>
        </section>

        {/* ───────────────────────────── STAT BAND ───────────────────────────── */}
        <section id="stats" className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-center text-sm text-text-secondary" data-reveal>
            The work that takes an analyst a week — done before your coffee's cold.
          </p>
          <div className="card-glass mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-3xl lg:grid-cols-4" data-reveal>
            {STATS.map((s) => (
              <div key={s.k} className="flex flex-col items-center gap-1 p-6 text-center">
                <span className="font-display text-3xl font-bold text-gradient sm:text-4xl">{s.k}</span>
                <span className="max-w-[12rem] text-xs leading-relaxed text-text-secondary">{s.v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────────── HOW IT WORKS ───────────────────────────── */}
        <section id="how" className="mx-auto max-w-6xl px-6 py-20">
          <p className="micro-label" data-reveal>How it works</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl" data-reveal>
            From a ticker to a dossier, <span className="text-gradient">live.</span>
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} data-reveal className="card-glass rounded-2xl p-6">
                <span className="font-mono text-sm text-brand">{s.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────────── WHAT'S INSIDE ───────────────────────────── */}
        <section id="dossier" className="mx-auto max-w-6xl px-6 py-20">
          <p className="micro-label" data-reveal>What's inside a dossier</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl" data-reveal>
            Everything you'd build by hand — <span className="text-gradient">assembled and cited.</span>
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

        {/* ───────────────────────────── CHAT SPOTLIGHT ───────────────────────────── */}
        <section id="chat" className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div data-reveal>
              <p className="micro-label">Ask the filings anything</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Every stock comes with its own analyst. <span className="text-gradient">One that never sleeps.</span>
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary">
                Stop scrolling through 300-page annual reports at midnight. Ask in plain English —
                "is the capex actually funded?", "who are the real competitors?" — and get a
                straight answer pulled from the document itself, page cited.
              </p>
              <ul className="mt-7 space-y-3">
                {CHAT_POINTS.map((p) => (
                  <li key={p.text} className="flex items-start gap-3 text-sm text-text-secondary">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-sky/15 text-sky">
                      <p.icon className="size-3.5" />
                    </span>
                    {p.text}
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal className="relative flex justify-center">
              <div aria-hidden className="sun-glow pointer-events-none absolute inset-0 m-auto size-72 rounded-full opacity-50 blur-[40px]" />
              <ChatMock className="relative scale-105" />
            </div>
          </div>
        </section>

        {/* ───────────────────────────── JOURNAL SPOTLIGHT ───────────────────────────── */}
        <section id="journal" className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div data-reveal className="order-2 relative flex justify-center lg:order-1">
              <div aria-hidden className="sun-glow pointer-events-none absolute inset-0 m-auto size-72 rounded-full opacity-50 blur-[40px]" />
              <JournalMock className="relative scale-105" />
            </div>
            <div data-reveal className="order-1 lg:order-2">
              <p className="micro-label">The free trade journal</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Most traders never learn why they lose. <span className="text-gradient">You won't be one of them.</span>
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary">
                Log every trade, tag your setups, and watch your real edge show up in the numbers.
                The kind of journal other platforms lock behind a ₹2,000/month paywall — here it's
                <span className="font-semibold text-text-primary"> completely free.</span>
              </p>
              <ul className="mt-7 space-y-3">
                {JOURNAL_POINTS.map((p) => (
                  <li key={p.text} className="flex items-start gap-3 text-sm text-text-secondary">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-pos/15 text-pos">
                      <p.icon className="size-3.5" />
                    </span>
                    {p.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ───────────────────────────── APPROACH ───────────────────────────── */}
        <section id="approach" className="mx-auto max-w-6xl px-6 py-20">
          <div className="card-glass relative overflow-hidden rounded-3xl p-10 text-center" data-reveal>
            <div aria-hidden className="sun-glow pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full opacity-60 blur-[60px]" />
            <div className="relative">
              <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Research. <span className="text-gradient">Not recommendations.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-secondary">
                We don't hand you a BUY button to hide behind. Every dossier passes a quality gate
                that strips opinion and keeps evidence — so the conviction is yours, and so is the
                edge. That's the whole point.
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

        {/* ───────────────────────────── FINAL CTA ───────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
          <div className="flex flex-col items-center gap-5 text-center" data-reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand-strong">
              <Sparkles className="size-3.5" />
              Your first dossier is free
            </span>
            <h2 className="max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
              The market doesn't wait. <span className="text-gradient">Neither should you.</span>
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-text-secondary">
              Your next idea is one search away. Run it now — before the move you're trying to catch
              has already happened.
            </p>
            <Button asChild size="lg" className="btn-primary mt-2 h-12 gap-2 text-white">
              <Link to={primaryHref}>
                Research your first stock
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  )
}
