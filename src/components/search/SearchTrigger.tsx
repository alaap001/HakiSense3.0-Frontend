import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import { useTickerSearch } from "@/components/search/TickerSearchProvider"
import { cn } from "@/lib/utils"

/** "Search stocks ⌘K" button that opens the global ticker palette. */
export function SearchTrigger({ className }: { className?: string }) {
  const { openSearch } = useTickerSearch()
  const [isMac, setIsMac] = useState(true)

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent))
  }, [])

  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Search stocks"
      className={cn(
        "group flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-text-secondary transition-colors hover:border-hairline-strong hover:text-text-primary",
        className,
      )}
    >
      <Search className="size-4" />
      <span className="hidden text-sm sm:inline">Search stocks</span>
      <kbd className="hidden items-center gap-0.5 rounded border border-hairline bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-secondary/70 md:inline-flex">
        {isMac ? "⌘" : "Ctrl"} K
      </kbd>
    </button>
  )
}
