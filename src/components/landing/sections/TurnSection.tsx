import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Act 2 — the turn. The Steve-Jobs pivot: one declarative line, lots of air, the
 * emerald wash flooding back in (colour returns after the heavy Pain act = the
 * release). The headline scales up as it enters so the moment lands.
 */
export function TurnSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      gsap.from(".turn-headline", {
        scale: 0.92,
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".turn-headline", start: "top 82%" },
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="relative overflow-hidden py-32 sm:py-44">
      <div aria-hidden className="act-turn pointer-events-none absolute inset-0 z-0" />
      <div
        aria-hidden
        data-parallax="70"
        className="sun-glow pointer-events-none absolute inset-0 z-0 m-auto size-[38rem] max-w-[120vw] rounded-full opacity-65 blur-[44px]"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <p className="text-base text-text-secondary" data-reveal>
          We didn&apos;t think research this hard should be a luxury.
        </p>
        <h2 className="turn-headline mx-auto mt-5 max-w-2xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-text-primary sm:text-6xl">
          So we built the analyst <span className="text-gradient">you could never afford.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-text-secondary" data-reveal>
          A team of AI analysts that reads everything, forgets nothing, and works in the time it
          takes to pour a coffee. Here&apos;s what that looks like.
        </p>
      </div>
    </section>
  )
}
