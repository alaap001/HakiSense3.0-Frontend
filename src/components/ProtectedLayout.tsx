import { Loader2 } from "lucide-react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { AppNav } from "@/components/AppNav"
import { useAuth } from "@/contexts/AuthContext"

/**
 * Gate for the research app. While auth is resolving, show a spinner. When
 * Supabase is configured and the user is not signed in, bounce to /login
 * (remembering where they were). When Supabase is NOT configured the app runs
 * open — there's no way to sign in, and the backend's JWT is opt-in too.
 */
export function ProtectedLayout() {
  const { isAuthenticated, isSupabaseConfigured, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grain flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2 className="size-5 animate-spin text-brand" />
          <span className="font-mono text-sm">Loading…</span>
        </div>
      </div>
    )
  }

  if (isSupabaseConfigured && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return (
    <div className="grain vignette relative min-h-screen bg-background">
      <div
        aria-hidden
        className="page-aura pointer-events-none fixed inset-x-0 top-0 z-0 h-[60vh]"
      />
      <AppNav />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}
