import { Route, Routes } from "react-router-dom"

import { AdminGuard } from "@/components/admin/AdminGuard"
import { ProtectedLayout } from "@/components/ProtectedLayout"
import { PublicLayout } from "@/components/site/PublicLayout"
import { ScrollManager } from "@/components/site/ScrollManager"
import About from "@/pages/About"
import Admin from "@/pages/Admin"
import AdminUserDetail from "@/pages/AdminUserDetail"
import Billing from "@/pages/Billing"
import Contact from "@/pages/Contact"
import Dashboard from "@/pages/Dashboard"
import Journal from "@/pages/Journal"
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import NotFound from "@/pages/NotFound"
import Privacy from "@/pages/Privacy"
import Profile from "@/pages/Profile"
import RunView from "@/pages/RunView"
import Settings from "@/pages/Settings"
import Signup from "@/pages/Signup"
import Terms from "@/pages/Terms"

/**
 * Route map. "/" + auth pages are public; marketing/legal pages share PublicLayout
 * (nav + footer); the research app is gated by ProtectedLayout. Unknown URLs fall
 * through to a 404 (specific routes always rank higher in React Router).
 */
export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<PublicLayout />}>
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/research/:sessionId" element={<RunView />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route element={<AdminGuard />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}
