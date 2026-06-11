import { CalendarDays, Percent, TrendingUp } from "lucide-react"

import { JournalMock } from "@/components/landing/mockups"

/**
 * Act 4 — the loyalty hook. One focused spotlight (not a six-card grid): the free
 * trade journal that keeps people coming back after the dossier. Reuses JournalMock.
 */
const POINTS = [
  { icon: TrendingUp, text: "An equity curve that shows your edge appearing — or quietly leaking away." },
  { icon: Percent, text: "Win rate, R-multiples and expectancy, computed for you." },
  { icon: CalendarDays, text: "A calendar of green and red days you can't argue with." },
]

export function JournalSection() {
  return (
    <section id="journal" className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div data-reveal className="order-2 flex justify-center lg:order-1">
          <div className="relative">
            <div
              aria-hidden
              className="sun-glow pointer-events-none absolute inset-0 m-auto size-72 rounded-full opacity-45 blur-[44px]"
            />
            <JournalMock className="relative scale-105" />
          </div>
        </div>

        <div data-reveal className="order-1 lg:order-2">
          <p className="micro-label">And after the trade</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Most traders never learn why they lose.{" "}
            <span className="text-gradient">You won&apos;t be one of them.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary">
            Log every trade, tag your setups, and watch your real edge show up in the numbers — the
            kind of journal other platforms lock behind a paywall. Here it&apos;s
            <span className="font-semibold text-text-primary"> free, forever.</span>
          </p>
          <ul className="mt-7 space-y-3">
            {POINTS.map((p) => (
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
  )
}
