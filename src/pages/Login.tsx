import { useEffect, useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isAuthenticated } = useAuth()
  const fromLoc = (
    location.state as { from?: { pathname?: string; search?: string } } | null
  )?.from
  // Preserve the query string (e.g. ?ticker=RELIANCE from the search palette).
  const from = fromLoc
    ? `${fromLoc.pathname ?? "/dashboard"}${fromLoc.search ?? ""}`
    : "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Redirect once a session exists (covers both successful sign-in and
  // arriving here while already authenticated).
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, from, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }
    setLoading(true)
    const res = await signIn(email, password)
    setLoading(false)
    if (!res.success) setError(res.error || "Login failed")
  }

  return (
    <div className="grain vignette relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Sunset sky — same crafted backdrop as the landing, so the front door is on-brand. */}
      <div aria-hidden className="sunset-sky absolute inset-0 z-0" />
      <div
        aria-hidden
        className="sun-glow animate-pulse-glow pointer-events-none absolute left-1/2 top-1/2 z-0 size-[36rem] max-w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[40px]"
      />

      <div
        className="animate-slide-in card-glass relative z-10 w-full max-w-md p-8 md:p-10"
        style={{ opacity: 0 }}
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-gradient font-display text-2xl font-bold">HakiSense</h1>
          </Link>
          <p className="mt-2 text-sm text-text-secondary">
            Welcome back — sign in to continue your research.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
            <AlertCircle className="size-5 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 border-hairline bg-surface pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 border-hairline bg-surface pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="btn-primary flex h-11 w-full items-center justify-center gap-2 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-brand hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
