import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { TickerSearchDialog } from "@/components/search/TickerSearchDialog"

interface TickerSearchValue {
  open: boolean
  openSearch: () => void
  closeSearch: () => void
}

const TickerSearchContext = createContext<TickerSearchValue | undefined>(undefined)

/**
 * Mounts the global ⌘K / Ctrl+K ticker palette once and exposes openSearch()
 * to the navs. Must sit inside the Router + AuthProvider so the dialog can
 * navigate. The ticker index is fetched lazily the first time the palette opens.
 */
export function TickerSearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const openSearch = useCallback(() => setOpen(true), [])
  const closeSearch = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const value = useMemo(
    () => ({ open, openSearch, closeSearch }),
    [open, openSearch, closeSearch],
  )

  return (
    <TickerSearchContext.Provider value={value}>
      {children}
      <TickerSearchDialog open={open} onOpenChange={setOpen} />
    </TickerSearchContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTickerSearch(): TickerSearchValue {
  const ctx = useContext(TickerSearchContext)
  if (ctx === undefined) {
    throw new Error("useTickerSearch must be used within a TickerSearchProvider")
  }
  return ctx
}
