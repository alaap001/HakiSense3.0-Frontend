import { useState } from "react"
import { ArrowRight, Search } from "lucide-react"

import { useTickerSearch } from "@/components/search/TickerSearchProvider"
import { MARKET } from "@/lib/market"
import { cn } from "@/lib/utils"

/**
 * Prominent hero search field. It is a button styled as an input — clicking it
 * (or pressing ⌘K) opens the global ticker palette, so all the ticker-index,
 * fuzzy-search and dossier navigation lives in one place (TickerSearchDialog).
 */
export function HeroSearch({ className }: { className?: string }) {
  const { openSearch } = useTickerSearch()
  // Client-only SPA: navigator is available at render, so resolve the platform
  // once up front instead of in an effect (which would trip set-state-in-effect).
  const [isMac] = useState(
    () => /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent),
  )

  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Search a stock to research"
      className={cn(
        "group glass-strong flex h-14 w-full max-w-xl items-center gap-3 rounded-2xl border border-hairline-strong px-4 text-left transition-colors hover:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/50",
        className,
      )}
    >
      <Search className="size-5 shrink-0 text-brand" />
      <span className="flex-1 truncate text-base text-text-secondary">
        {MARKET.searchPlaceholder}
      </span>
      <kbd className="hidden items-center gap-0.5 rounded border border-hairline bg-surface px-1.5 py-0.5 font-mono text-[11px] text-text-secondary/70 sm:inline-flex">
        {isMac ? "⌘" : "Ctrl"} K
      </kbd>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet/15 text-brand transition-colors group-hover:bg-violet/25">
        <ArrowRight className="size-4" />
      </span>
    </button>
  )
}
