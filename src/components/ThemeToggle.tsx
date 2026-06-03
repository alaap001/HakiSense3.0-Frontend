import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

/** Simple sun/moon theme switch for the nav bars. Shows the icon of the theme it
 *  switches *to* (moon in light, sun in dark). */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"
  const label = isDark ? "Switch to light theme" : "Switch to dark theme"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-full border border-hairline text-text-secondary transition-colors hover:border-hairline-strong hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/50",
        className,
      )}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
