import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"

export default function Signup() {
  const navigate = useNavigate()
  const { signUp, isAuthenticated } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  // If a session is created (email confirmation disabled), go to the app.
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true })
  }, [isAuthenticated, navigate])

  function validate(): string | null {
    if (!name || !email || !password || !confirm) return "Please fill in all fields"
    if (name.trim().length < 2) return "Name must be at least 2 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address"
    if (password.length < 6) return "Password must be at least 6 characters"
    if (password !== confirm) return "Passwords do not match"
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    setLoading(true)
    const res = await signUp(email, password, name.trim())
    setLoading(false)
    if (!res.success) setError(res.error || "Signup failed")
    else setConfirmSent(true) // the effect navigates instead if a session was created
  }

  return (
    <div className="grain vignette relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
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
            Create your account to start researching.
          </p>
        </div>

        {confirmSent ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto size-10 text-brand" />
            <p className="text-text-primary">Check your email to confirm your account.</p>
            <p className="text-sm text-text-secondary">
              Once confirmed, you can{" "}
              <Link to="/login" className="font-medium text-brand hover:underline">
                sign in
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                <AlertCircle className="size-5 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                  <Input
                    id="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="h-11 border-hairline bg-surface pl-10"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
                  <Input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 border-hairline bg-surface pl-10"
                  />
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
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-brand hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
