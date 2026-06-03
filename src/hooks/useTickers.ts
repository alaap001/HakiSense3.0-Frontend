import { useEffect, useState } from "react"

import { loadTickers } from "@/lib/tickers"

/**
 * Lazily loads the ticker index into module memory and reports readiness.
 * Pass `enabled=false` to defer the fetch (e.g. until a search UI opens) — the
 * 472 KB index is only pulled the first time something needs it. `ready` flips
 * true once the index is searchable; the data is read through the pure helpers
 * in lib/tickers (searchTickers, popularTickers, …).
 */
export function useTickers(enabled = true): {
  ready: boolean
  loading: boolean
  error: boolean
} {
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let active = true
    setLoading(true)
    setError(false)
    loadTickers()
      .then(() => {
        if (!active) return
        setReady(true)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setError(true)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [enabled])

  return { ready, loading, error }
}
