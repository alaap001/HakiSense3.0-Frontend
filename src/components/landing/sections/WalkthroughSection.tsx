import { useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { ArrowRight, Search } from "lucide-react"

import { AgentReadingMock, ChatMock, DossierMock } from "@/components/landing/mockups"
import { MARKET } from "@/lib/market"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Act 3 — the signature scene. "Show, don't tell": four demo beats the user
 * scrolls through while the stage stays pinned (CSS `sticky`, which is smoother
 * and jank-free vs. a GSAP pin). ScrollTrigger only reads scroll progress to
 * advance the active beat; the card swaps in place. Reduced-motion users get a
 * plain stacked layout instead.
 */

const BEATS = [
  { n: "01", title: "Type one ticker.", body: `Any of ${MARKET.universeCount} listed names. No dashboards to wire up, no watchlists to babysit. Just the name.` },
  { n: "02", title: "It reads everything. Live.", body: "Annual report, transcripts, filings, the footnotes — a team of AI analysts tears through all of it, in front of you, in real time." },
  { n: "03", title: "Out comes an analyst report.", body: "Thesis, evidence, scenarios, red flags — assembled, with every claim cited to a real source. A week of an analyst's work." },
  { n: "04", title: "Then ask it anything.", body: "Every stock keeps its own analyst on call. Ask in plain English; get answers pulled straight from the filing, page cited." },
]

function TickerCard() {
  return (
    <div className="card-glass w-[20rem] max-w-full rounded-2xl p-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">Research any stock</p>
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-hairline-strong bg-surface px-3.5 py-3">
        <Search className="size-4 shrink-0 text-brand" />
        <span className="font-mono text-sm text-text-primary">{MARKET.exampleTickers[0]}</span>
        <span className="h-4 w-px animate-pulse-glow bg-brand" aria-hidden />
        <span className="ml-auto grid size-7 shrink-0 place-items-center rounded-lg bg-brand text-white">
          <ArrowRight className="size-3.5" />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {MARKET.exampleTickers.map((s, i) => (
          <span
            key={s}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[10px]",
              i === 0
                ? "border-brand/40 bg-brand/10 text-brand"
                : "border-hairline bg-surface text-text-secondary",
            )}
          >
            {s}
          </span>
        ))}
      </div>
      <p className="mt-3 font-mono text-[9px] text-text-secondary">{MARKET.universeCount} listed names · ⌘K from anywhere</p>
    </div>
  )
}

function beatCard(step: number) {
  switch (step) {
    case 0:
      return <TickerCard />
    case 1:
      return <AgentReadingMock />
    case 2:
      return <DossierMock />
    default:
      return <ChatMock />
  }
}

export function WalkthroughSection() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [reduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )

  useGSAP(
    () => {
      if (reduce || !ref.current) return
      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const i = Math.min(BEATS.length - 1, Math.floor(self.progress * BEATS.length))
          setActive((prev) => (prev === i ? prev : i))
        },
      })
      return () => st.kill()
    },
    { scope: ref },
  )

  // Reduced-motion / no-pin fallback — a calm vertical stack, each beat revealed.
  if (reduce) {
    return (
      <section id="how" className="relative mx-auto max-w-6xl px-6 py-24">
        <p className="micro-label" data-reveal>How it works</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl" data-reveal>
          Watch it work.
        </h2>
        <div className="mt-12 space-y-16">
          {BEATS.map((b, i) => (
            <div key={b.n} data-reveal className="grid items-center gap-8 lg:grid-cols-2">
              <div className={cn(i % 2 === 1 && "lg:order-2")}>
                <span className="font-mono text-sm text-brand">{b.n}</span>
                <h3 className="mt-2 font-display text-2xl font-semibold text-text-primary">{b.title}</h3>
                <p className="mt-2 max-w-md text-base leading-relaxed text-text-secondary">{b.body}</p>
              </div>
              <div className="flex justify-center">{beatCard(i)}</div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id="how" ref={ref} className="relative" style={{ height: `${BEATS.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="micro-label">How it works · watch it work</p>

          <div className="mt-7 grid items-center gap-10 lg:grid-cols-2">
            {/* The scroll-driven stepper. */}
            <ol className="relative">
              <div aria-hidden className="absolute bottom-2 left-[15px] top-2 w-px bg-hairline-strong" />
              <div className="space-y-5">
                {BEATS.map((b, i) => {
                  const on = i === active
                  const done = i < active
                  return (
                    <li key={b.n} className="relative pl-12">
                      <span
                        className={cn(
                          "absolute left-0 top-0 grid size-8 place-items-center rounded-full border font-mono text-[11px] transition-colors duration-300",
                          on && "border-brand bg-brand text-white",
                          done && "border-brand/40 bg-brand/15 text-brand",
                          !on && !done && "border-hairline-strong bg-surface text-text-secondary/60",
                        )}
                      >
                        {b.n}
                      </span>
                      <p
                        className={cn(
                          "pt-1 font-display text-lg font-semibold transition-colors duration-300 sm:text-xl",
                          on ? "text-text-primary" : "text-text-secondary/45",
                        )}
                      >
                        {b.title}
                      </p>
                      <div
                        className={cn(
                          "grid transition-all duration-500",
                          on ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <p className="overflow-hidden text-sm leading-relaxed text-text-secondary">{b.body}</p>
                      </div>
                    </li>
                  )
                })}
              </div>
            </ol>

            {/* The card for the active beat — swaps in place. */}
            <div className="relative flex min-h-[19rem] items-center justify-center">
              <div
                aria-hidden
                className="sun-glow pointer-events-none absolute inset-0 m-auto size-64 rounded-full opacity-40 blur-[44px]"
              />
              <div key={active} className="animate-slide-in relative">
                {beatCard(active)}
              </div>
            </div>
          </div>

          <div className="mt-9 flex items-center gap-3">
            <div className="flex gap-1.5">
              {BEATS.map((b, i) => (
                <span
                  key={b.n}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === active ? "w-6 bg-brand" : "w-1.5 bg-hairline-strong",
                  )}
                />
              ))}
            </div>
            <p className="font-mono text-xs text-text-secondary">Ninety seconds. Not a weekend.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
