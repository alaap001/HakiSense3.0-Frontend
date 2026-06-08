import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { ChevronDown } from "lucide-react"

import { HeroSearch } from "@/components/landing/HeroSearch"

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * The hook. One focal point — a tight two-line headline + one two-line line + the
 * search. The hero sits directly on the page's continuous canvas (no separate sky
 * block, so there's no seam into the Pain act). Two soft glow blobs parallax at
 * different speeds for visible depth; the content drifts up and fades on scroll.
 */
export function HeroSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (reduce) return

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-eyebrow", { y: 14, opacity: 0, duration: 0.5 }, 0.1)
        .from(".headline-line", { y: 40, rotateX: 16, opacity: 0, duration: 0.85 }, 0.2)
        .from(".hero-sub", { y: 20, opacity: 0, duration: 0.6 }, 0.5)
        .from(".hero-cta", { y: 18, opacity: 0, duration: 0.6 }, 0.65)
        .from(".hero-trust", { y: 12, opacity: 0, duration: 0.5 }, 0.82)
        .from(".hero-scroll-cue", { opacity: 0, duration: 0.6 }, 1)

      gsap.to(".hero-inner", {
        y: "-12vh",
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: 0.5 },
      })
    },
    { scope: ref },
  )

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Soft glow blobs — emerald + powder. They parallax at different rates, so the
          first screen reads with real depth instead of a flat scroll. */}
      <div
        aria-hidden
        data-parallax="90"
        className="pointer-events-none absolute right-[12%] top-[16%] z-0 size-72 rounded-full bg-brand/10 blur-[64px]"
      />
      <div
        aria-hidden
        data-parallax="150"
        className="pointer-events-none absolute left-[8%] top-[52%] z-0 size-80 rounded-full bg-sky/10 blur-[72px]"
      />
      {/* Focal bloom behind the headline. */}
      <div
        aria-hidden
        className="sun-glow pointer-events-none absolute left-1/2 top-[40%] z-0 size-[40rem] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-55 blur-[36px]"
      />

      <div className="hero-inner relative z-10 mx-auto w-full max-w-4xl px-6 text-center">
        <p className="hero-eyebrow micro-label mb-7">HakiSense · institutional-grade equity research</p>

        <div style={{ perspective: 900 }}>
          <h1 className="headline-line font-display text-4xl font-bold leading-[1.08] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            <span className="block">The power of a full research desk,</span>
            <span className="block text-gradient">instantly.</span>
          </h1>
        </div>

        <p className="hero-sub mx-auto mt-8 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
          Institutional-quality analyst reports built from the ground up. We pull from primary
          filings and cite every single claim, giving you conviction in a fraction of the time.
        </p>

        <div className="hero-cta mt-9 flex flex-col items-center gap-3">
          <HeroSearch />
          <p className="font-mono text-xs text-text-secondary/70">Try RELIANCE · TCS · INFY</p>
        </div>

        <p className="hero-trust mt-6 text-xs text-text-secondary">
          Free to start · no card required · 5,700+ stocks live now
        </p>

        <a
          href="#pain"
          onClick={(e) => {
            const target = document.getElementById("pain")
            if (!target) return
            e.preventDefault()
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            target.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" })
          }}
          className="hero-scroll-cue mt-12 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          But first — why this matters
          <ChevronDown className="size-4 animate-bounce" />
        </a>
      </div>
    </section>
  )
}
