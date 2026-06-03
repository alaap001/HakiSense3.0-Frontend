import { Outlet } from "react-router-dom"

import { LandingNav } from "@/components/landing/LandingNav"
import { SiteFooter } from "@/components/site/SiteFooter"

/**
 * Shell for public marketing / legal pages (About, Privacy, Terms, Contact, 404).
 * Fixed LandingNav over a grain/vignette background, flex column so the footer
 * sits at the bottom even on short pages. The Landing page renders its own
 * nav + footer (full-bleed hero), so it does NOT use this layout.
 */
export function PublicLayout() {
  return (
    <div className="grain vignette relative flex min-h-screen flex-col bg-background">
      <div
        aria-hidden
        className="app-aurora pointer-events-none fixed inset-x-0 top-0 z-0 h-[55vh] dark:hidden"
      />
      <LandingNav />
      {/* pt clears the fixed 4rem nav */}
      <main className="relative z-10 flex-1 pt-16">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
