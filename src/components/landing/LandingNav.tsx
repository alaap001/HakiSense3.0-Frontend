import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { ThemeToggle } from "@/components/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

export function LandingNav() {
  const { isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-hairline bg-background/70 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="HakiSense" className="size-8 object-contain" />
          <span className="font-display text-base font-semibold tracking-tight text-text-primary">
            Haki<span className="text-violet">Sense</span>
          </span>
          <Badge variant="outline" className="border-violet text-brand">
            3.0
          </Badge>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button asChild size="sm" className="btn-primary text-white">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login" className="text-text-secondary">
                  Sign in
                </Link>
              </Button>
              <Button asChild size="sm" className="btn-primary text-white">
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
