import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/contexts/AuthContext"
import { useIsAdmin } from "@/hooks/useAdmin"

/**
 * Nested route guard for the admin area. Runs INSIDE ProtectedLayout (so auth is already
 * resolved); non-admins are bounced to the dashboard rather than shown a 404, since the
 * route exists but isn't theirs. The backend independently enforces the same role on every
 * `/api/admin/*` call, so this is UX, not the security boundary.
 */
export function AdminGuard() {
  const { loading } = useAuth()
  const isAdmin = useIsAdmin()
  if (loading) return null
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
