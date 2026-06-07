import { Link } from "react-router-dom"

import { useAuth } from "@/contexts/AuthContext"

const COLUMNS: { heading: string; links: { label: string; to: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "How it works", to: "/#how" },
      { label: "The dossier", to: "/#dossier" },
      { label: "Ask the filings", to: "/#chat" },
      { label: "Free journal", to: "/#journal" },
      { label: "Dashboard", to: "/dashboard" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
  },
]

/** Shared site footer. Used by PublicLayout and the Landing page. */
export function SiteFooter() {
  const { isAuthenticated } = useAuth()

  return (
    <footer className="relative z-10 border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="HakiSense" className="size-7 object-contain" />
              <span className="font-display text-base font-semibold tracking-tight text-text-primary">
                Haki<span className="text-gradient">Sense</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Evidence-gated equity research that assembles a structured dossier — thesis,
              findings, scenarios and risks — from the filings.
            </p>
            <p className="mt-4 text-xs text-text-secondary/60">
              Research, not investment advice. No BUY / HOLD / SELL.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="micro-label mb-4">{col.heading}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center">
          <span className="text-xs text-text-secondary/60">
            © {new Date().getFullYear()} HakiSense. All rights reserved.
          </span>
          <div className="flex items-center gap-4 sm:ml-auto">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="text-xs font-medium text-brand hover:text-brand"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs text-text-secondary hover:text-text-primary"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-medium text-brand hover:text-brand"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
