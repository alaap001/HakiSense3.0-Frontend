import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { MARKET } from "@/lib/market"

gsap.registerPlugin(useGSAP, ScrollTrigger)

interface CountUpProps {
  end: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}

/**
 * A number that counts up from zero the first time it scrolls into view — so the
 * figures that carry the story (300 pages, 3 days…) animate into importance
 * instead of sitting there stale. Renders the final value at rest (and for
 * reduced-motion / no-JS), so it's never blank.
 */
export function CountUp({
  end,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.6,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)

  const format = (v: number) =>
    `${prefix}${v.toLocaleString(MARKET.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = format(end)
        return
      }
      const obj = { v: 0 }
      el.textContent = format(0)
      gsap.to(obj, {
        v: end,
        duration,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = format(obj.v)
        },
      })
    },
    { scope: ref },
  )

  return (
    <span ref={ref} className={className}>
      {format(end)}
    </span>
  )
}
