import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Menu, Moon, Sun } from "lucide-react"

import { ThemeToggle } from "@/components/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

export function LandingNav() {
  const { isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"
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
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="HakiSense" className="size-8 object-contain" />
          <span className="font-display text-base font-semibold tracking-tight text-text-primary">
            Haki<span className="text-gradient">Sense</span>
          </span>
          {/* Version garnish — drops on phones to keep the bar uncluttered. */}
          <Badge variant="outline" className="hidden border-brand/40 text-brand sm:inline-flex">
            3.0
          </Badge>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/#how" className="text-text-secondary">
              How it works
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/#pricing" className="text-text-secondary">
              Pricing
            </Link>
          </Button>
          {/* Bar theme toggle on sm+; on phones it moves into the menu below. */}
          <span className="hidden sm:block">
            <ThemeToggle />
          </span>
          {isAuthenticated ? (
            <Button asChild size="sm" className="btn-primary text-white">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login" className="text-text-secondary">
                  Sign in
                </Link>
              </Button>
              {/* Primary CTA stays in the bar at every width. */}
              <Button asChild size="sm" className="btn-primary text-white">
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}

          {/* Phone menu — secondary links + theme collapse here so the CTA never clips. */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Open menu"
              className="grid size-8 place-items-center rounded-full border border-hairline text-text-secondary transition-colors hover:border-hairline-strong hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/50 sm:hidden"
            >
              <Menu className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-hairline bg-popover/95 backdrop-blur-xl"
            >
              <DropdownMenuItem asChild>
                <Link to="/#how" className="cursor-pointer">
                  How it works
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/#pricing" className="cursor-pointer">
                  Pricing
                </Link>
              </DropdownMenuItem>
              {!isAuthenticated ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="cursor-pointer">
                      Sign in
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={toggleTheme} className="cursor-pointer">
                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {isDark ? "Light theme" : "Dark theme"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
