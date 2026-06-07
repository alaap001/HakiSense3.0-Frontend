import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { Clock, Files, IndianRupee } from "lucide-react"

import { CountUp } from "@/components/landing/CountUp"

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Act 1 — the ache. Pain-led, but not the cliché: the real cost of research
 * today (page count, the lost weekend, the money the tools demand). Quiet and
 * desaturated, with marked key words, accent lines that draw in, a big ghost
 * numeral that visibly parallaxes, and a count-up cost strip as the punchline.
 */

const BEATS = [
  {
    lead: "One annual report runs past 300 pages.",
    body: (
      <>
        Then four earnings calls. Then <span className="mark">the footnotes</span> — where the real
        story always hides, buried on page 230 next to the related-party tables.
      </>
    ),
  },
  {
    lead: "Read it properly and there goes your weekend.",
    body: (
      <>
        And by Monday morning, the move you spotted on Friday is{" "}
        <span className="mark">already priced in</span>. The work is slow. The market isn't.
      </>
    ),
  },
  {
    lead: "The tools that actually help cost a fortune.",
    body: (
      <>
        A terminal runs into <span className="mark">lakhs a year</span>. A research desk, far more.
        So most people skip the reading altogether — and trade on a tip and a feeling.
      </>
    ),
  },
]

export function PainSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      // Each beat's accent line draws down as the beat enters — a small, deliberate
      // motion that makes the scroll feel authored.
      gsap.utils.toArray<HTMLElement>(".pain-accent").forEach((line) => {
        gsap.from(line, {
          scaleY: 0,
          transformOrigin: "top",
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: line.closest(".pain-beat"), start: "top 84%" },
        })
      })
    },
    { scope: ref },
  )

  return (
    <section id="pain" ref={ref} className="relative overflow-hidden py-28 sm:py-36">
      <div aria-hidden data-parallax="50" className="act-pain pointer-events-none absolute inset-x-0 -inset-y-20 z-0" />

      {/* A giant, ultra-faint numeral that visibly parallaxes — the "300 pages"
          made physical, and the clearest signal that you're scrolling a story. */}
      <span
        aria-hidden
        data-parallax="170"
        className="pointer-events-none absolute right-2 top-16 z-0 hidden select-none font-display text-[15rem] font-bold leading-none text-text-primary/[0.06] sm:block lg:right-8 lg:text-[22rem]"
      >
        300
      </span>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <p className="micro-label" data-reveal>The problem</p>
        <h2
          className="mt-4 max-w-3xl font-display text-3xl font-bold leading-[1.12] tracking-tight text-text-primary sm:text-5xl"
          data-reveal
        >
          Knowing a stock — really knowing it — is brutally hard work. So almost nobody does it.
        </h2>

        <div className="mt-14 max-w-2xl space-y-10">
          {BEATS.map((b) => (
            <div key={b.lead} data-reveal className="pain-beat relative pl-6">
              <span
                aria-hidden
                className="pain-accent absolute left-0 top-1 h-[calc(100%-0.5rem)] w-0.5 origin-top rounded bg-hairline-strong"
              />
              <p className="font-display text-xl font-semibold text-text-primary sm:text-2xl">
                {b.lead}
              </p>
              <p className="mt-2 text-base leading-relaxed text-text-secondary">{b.body}</p>
            </div>
          ))}
        </div>

        {/* The punchline — three figures the reader can't argue with, counting up
            into a glowing strip. This is the visual peak of the act. */}
        <div className="relative mt-16" data-reveal>
          <div
            aria-hidden
            className="sun-glow pointer-events-none absolute inset-x-0 -top-8 mx-auto h-40 w-2/3 rounded-full opacity-40 blur-[55px]"
          />
          <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Files, value: <CountUp end={300} suffix="+" />, label: "pages in one annual report" },
              { icon: Clock, value: <CountUp end={3} prefix="~" suffix=" days" />, label: "for a single honest read" },
              { icon: IndianRupee, value: "lakhs / yr", label: "for tools that still make you read" },
            ].map((c, i) => (
              <div key={i} className="card-glass flex flex-col items-center rounded-2xl px-6 py-7 text-center">
                <span className="grid size-9 place-items-center rounded-xl bg-brand/12 text-brand">
                  <c.icon className="size-[18px]" />
                </span>
                <p className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                  <span className="text-gradient">{c.value}</span>
                </p>
                <p className="mx-auto mt-1.5 max-w-[12rem] text-xs leading-relaxed text-text-secondary">
                  {c.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
