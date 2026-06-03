import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { useTickers } from "@/hooks/useTickers"
import { searchTickers } from "@/lib/tickers"
import { cn } from "@/lib/utils"

/**
 * Autocomplete for the Dashboard ticker field. Suggests from the NSE index but
 * still allows a free-typed symbol — the engine accepts any ticker — so pressing
 * Enter with nothing highlighted falls through to the form's submit (run).
 */
export function TickerCombobox({
  value,
  onChange,
  disabled,
  placeholder,
  inputClassName,
  ariaLabel,
}: {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  placeholder?: string
  inputClassName?: string
  ariaLabel?: string
}) {
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const blurTimer = useRef<number | undefined>(undefined)
  const { ready } = useTickers(focused) // lazy-load the index on first focus

  const matches = useMemo(
    () => (focused && value.trim() && ready ? searchTickers(value, 8) : []),
    [focused, value, ready],
  )
  const showList = open && matches.length > 0

  // Reset the highlighted row whenever the query changes.
  useEffect(() => setActive(-1), [value])

  function select(symbol: string) {
    onChange(symbol)
    setOpen(false)
    setActive(-1)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      if (matches.length === 0) return
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, matches.length - 1))
    } else if (e.key === "ArrowUp") {
      if (!showList) return
      e.preventDefault()
      setActive((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter") {
      if (showList && active >= 0) {
        e.preventDefault() // pick the highlighted suggestion instead of submitting
        select(matches[active].symbol)
      }
      // otherwise: let the form submit with whatever was typed
    } else if (e.key === "Escape") {
      if (showList) {
        e.preventDefault()
        setOpen(false)
      }
    }
  }

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-text-secondary" />
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          window.clearTimeout(blurTimer.current)
          setFocused(true)
          setOpen(true)
        }}
        onBlur={() => {
          // delay so a mousedown on a suggestion registers before we close
          blurTimer.current = window.setTimeout(() => {
            setFocused(false)
            setOpen(false)
          }, 120)
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={showList}
        className={inputClassName}
      />

      {showList && (
        <ul
          // keep focus on the input when clicking a row
          onMouseDown={(e) => e.preventDefault()}
          className="custom-scrollbar absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-72 overflow-y-auto rounded-xl border border-hairline bg-popover/95 p-1 shadow-card backdrop-blur-xl"
          role="listbox"
        >
          {matches.map((t, i) => (
            <li key={t.symbol} role="option" aria-selected={i === active}>
              <button
                type="button"
                onClick={() => select(t.symbol)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                  i === active ? "bg-violet/15" : "hover:bg-surface-strong",
                )}
              >
                <span className="w-24 shrink-0 font-mono text-xs font-semibold text-brand">
                  {t.symbol}
                </span>
                <span className="flex-1 truncate text-sm text-text-primary">{t.name}</span>
                {t.sector ? (
                  <span className="hidden shrink-0 truncate rounded-full border border-hairline px-2 py-0.5 text-[10px] text-text-secondary/70 sm:block">
                    {t.sector}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
