import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { LandingNav } from "@/components/landing/LandingNav"
import { SiteFooter } from "@/components/site/SiteFooter"
import { HeroSection } from "@/components/landing/sections/HeroSection"
import { PainSection } from "@/components/landing/sections/PainSection"
import { TurnSection } from "@/components/landing/sections/TurnSection"
import { WalkthroughSection } from "@/components/landing/sections/WalkthroughSection"
import { JournalSection } from "@/components/landing/sections/JournalSection"
import { PrincipleSection } from "@/components/landing/sections/PrincipleSection"
import { PricingSection } from "@/components/landing/sections/PricingSection"
import { FinaleSection } from "@/components/landing/sections/FinaleSection"

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * The Landing is a narrated scroll — a Steve-Jobs arc, not a feature catalogue:
 *
 *   Hero  → the hook (one focal point)
 *   Pain  → the real cost of research today (heavy, quiet)
 *   Turn  → "so we built it" (colour blooms back)
 *   Walk  → the product demonstrates itself (pinned beats)
 *   Journal → the free loyalty hook
 *   Principle → research, not recommendations
 *   Pricing → the early-bird offer (Free / Pro / Ultra)
 *   Finale → name the pain, then take it away → CTA
 *
 * Each section owns its own markup; the hero and the walkthrough own their own
 * GSAP. Here we wire only the page-wide hooks: [data-reveal] (frictionless slide-
 * up as content enters) and [data-parallax] (background drifts slower for depth).
 */
export default function Landing() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (reduce || !container.current) return

      // Frictionless reveals — content slides up as it enters the viewport.
      container.current.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 28,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%" },
        })
      })

      // Parallax depth — flagged backgrounds drift opposite the scroll.
      container.current.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const amt = parseFloat(el.dataset.parallax || "40")
        gsap.fromTo(
          el,
          { y: amt },
          {
            y: -amt,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section") ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        )
      })
    },
    { scope: container },
  )

  return (
    <div ref={container} className="grain relative min-h-screen bg-background text-text-primary">
      {/* One continuous page-height backdrop — a dawn at the very top that settles
          into mint and runs unbroken down the whole page, so there is physically no
          seam between acts. Each section only tints this. */}
      <div aria-hidden className="story-canvas absolute inset-0 z-0" />

      <LandingNav />

      <div className="relative z-10">
        <HeroSection />
        <PainSection />
        <TurnSection />
        <WalkthroughSection />
        <JournalSection />
        <PrincipleSection />
        <PricingSection />
        <FinaleSection />
        <SiteFooter />
      </div>
    </div>
  )
}
