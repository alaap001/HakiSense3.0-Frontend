import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Clock, Loader2, TrendingUp } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useTickers } from "@/hooks/useTickers"
import {
  findTicker,
  getRecentSymbols,
  popularTickers,
  pushRecentSymbol,
  searchTickers,
  type Ticker,
} from "@/lib/tickers"

export function TickerSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const { ready, loading, error } = useTickers(open)
  const [query, setQuery] = useState("")
  const [recent, setRecent] = useState<Ticker[]>([])

  // Reset the query and refresh recents each time the palette opens.
  useEffect(() => {
    if (!open) return
    setQuery("")
  }, [open])

  useEffect(() => {
    if (!open || !ready) return
    setRecent(getRecentSymbols().map(findTicker).filter((t): t is Ticker => !!t))
  }, [open, ready])

  const results = useMemo(
    () => (query.trim() && ready ? searchTickers(query, 24) : []),
    [query, ready],
  )
  const popular = useMemo(() => (ready ? popularTickers(8) : []), [ready])

  function select(symbol: string) {
    pushRecentSymbol(symbol)
    onOpenChange(false)
    navigate(`/dashboard?ticker=${encodeURIComponent(symbol)}`)
  }

  const showSuggestions = !query.trim()

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder="Search a stock — symbol or company name…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && !ready ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-text-secondary">
            <Loader2 className="size-4 animate-spin text-brand" />
            Loading tickers…
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-destructive">
            Couldn&apos;t load the ticker list. Check your connection and try again.
          </div>
        ) : showSuggestions ? (
          <>
            {recent.length > 0 && (
              <CommandGroup heading="Recent">
                {recent.map((t) => (
                  <TickerRow key={`r-${t.symbol}`} t={t} icon="recent" onSelect={select} />
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="Popular">
              {popular.map((t) => (
                <TickerRow key={`p-${t.symbol}`} t={t} icon="popular" onSelect={select} />
              ))}
            </CommandGroup>
          </>
        ) : (
          <>
            <CommandEmpty>No tickers match “{query.trim()}”.</CommandEmpty>
            {results.length > 0 && (
              <CommandGroup heading="Results">
                {results.map((t) => (
                  <TickerRow key={t.symbol} t={t} onSelect={select} />
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
      <div className="flex items-center justify-between border-t border-hairline px-4 py-2 text-[11px] text-text-secondary/60">
        <span>Research, not recommendations</span>
        <span className="font-mono">↵ select · esc close</span>
      </div>
    </CommandDialog>
  )
}

function TickerRow({
  t,
  icon,
  onSelect,
}: {
  t: Ticker
  icon?: "recent" | "popular"
  onSelect: (symbol: string) => void
}) {
  // Unique per group — a symbol can appear in both Recent and Popular, and cmdk
  // would otherwise highlight both rows together.
  const value = `${icon ?? "result"}:${t.symbol}`
  return (
    <CommandItem value={value} onSelect={() => onSelect(t.symbol)}>
      {icon === "recent" ? (
        <Clock className="size-4 text-text-secondary/60" />
      ) : icon === "popular" ? (
        <TrendingUp className="size-4 text-text-secondary/60" />
      ) : null}
      <span className="w-24 shrink-0 font-mono text-xs font-semibold text-brand">
        {t.symbol}
      </span>
      <span className="flex-1 truncate text-text-primary">{t.name}</span>
      {t.sector ? (
        <span className="hidden shrink-0 truncate rounded-full border border-hairline px-2 py-0.5 text-[10px] text-text-secondary/70 sm:block">
          {t.sector}
        </span>
      ) : null}
    </CommandItem>
  )
}
