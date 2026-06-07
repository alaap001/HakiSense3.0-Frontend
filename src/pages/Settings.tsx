import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Loader2,
  LogOut,
  Mail,
  Moon,
  ShieldAlert,
  Sun,
} from "lucide-react"

import { PlanUsageCard } from "@/components/billing/PlanUsageCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme, type Theme } from "@/contexts/ThemeContext"
import { mailto, SUPPORT_EMAIL } from "@/lib/site"
import { cn } from "@/lib/utils"

type Status = { kind: "error" | "ok"; msg: string } | null

export default function Settings() {
  const { user, isSupabaseConfigured, updateEmail, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-12">
      <p className="micro-label">Account</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text-primary">
        Settings
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
        Manage your sign-in details and session. Changes to your email require confirmation
        before they take effect.
      </p>

      {!isSupabaseConfigured && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-hairline bg-surface p-3 text-xs text-text-secondary">
          <AlertCircle className="size-4 shrink-0 text-brand" />
          Running without Supabase configured — account changes are disabled.
        </div>
      )}

      <div className="mt-8 space-y-6">
        <PlanUsageCard />
        <AppearanceCard />
        <EmailCard
          currentEmail={user?.email ?? ""}
          disabled={!isSupabaseConfigured}
          onSubmit={updateEmail}
        />
        <PasswordCard disabled={!isSupabaseConfigured} onSubmit={updatePassword} />

        {/* Session */}
        <Card className="card-glass">
          <CardContent className="p-6">
            <h2 className="font-display text-base font-semibold text-text-primary">Session</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Sign out of HakiSense on this device.
            </p>
            <Button
              variant="secondary"
              className="mt-4 gap-2"
              onClick={async () => {
                await signOut()
                navigate("/login", { replace: true })
              }}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </CardContent>
        </Card>

        <DangerZone email={user?.email ?? ""} />
      </div>
    </div>
  )
}

function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  const options: { id: Theme; label: string; hint: string; Icon: typeof Sun }[] = [
    { id: "light", label: "Light", hint: "Off-white · default", Icon: Sun },
    { id: "dark", label: "Dark", hint: "Violet noir", Icon: Moon },
  ]

  return (
    <Card className="card-glass">
      <CardContent className="p-6">
        <h2 className="font-display text-base font-semibold text-text-primary">Appearance</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Choose how HakiSense looks on this device. Your choice is remembered.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
          {options.map(({ id, label, hint, Icon }) => {
            const active = theme === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-violet/50 bg-violet/10"
                    : "border-hairline hover:border-hairline-strong",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    active ? "bg-violet/15 text-brand" : "bg-surface text-text-secondary",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-text-primary">{label}</span>
                  <span className="block text-[11px] text-text-secondary">{hint}</span>
                </span>
                {active ? <Check className="size-4 shrink-0 text-brand" /> : null}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function StatusLine({ status }: { status: Status }) {
  if (!status) return null
  if (status.kind === "ok") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-violet/30 bg-violet/[0.08] p-3">
        <Check className="size-4 shrink-0 text-brand" />
        <p className="text-sm text-brand-strong">{status.msg}</p>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
      <AlertCircle className="size-4 shrink-0 text-destructive" />
      <p className="text-sm text-destructive">{status.msg}</p>
    </div>
  )
}

function EmailCard({
  currentEmail,
  disabled,
  onSubmit,
}: {
  currentEmail: string
  disabled: boolean
  onSubmit: (email: string) => Promise<{ success: boolean; error?: string }>
}) {
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const next = email.trim()
    if (!next || busy) return
    if (next === currentEmail) {
      setStatus({ kind: "error", msg: "That's already your email." })
      return
    }
    setBusy(true)
    setStatus(null)
    const res = await onSubmit(next)
    setBusy(false)
    if (res.success) {
      setStatus({
        kind: "ok",
        msg: `Confirmation sent to ${next}. The change applies once you confirm.`,
      })
      setEmail("")
    } else {
      setStatus({ kind: "error", msg: res.error || "Could not update email." })
    }
  }

  return (
    <Card className="card-glass">
      <CardContent className="p-6">
        <h2 className="font-display text-base font-semibold text-text-primary">Email address</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Current:{" "}
          <span className="font-mono text-text-primary">{currentEmail || "—"}</span>
        </p>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-email">New email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
              <Input
                id="new-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={disabled}
                className="h-11 border-hairline bg-surface pl-10"
              />
            </div>
          </div>
          <StatusLine status={status} />
          <Button
            type="submit"
            disabled={disabled || busy || !email.trim()}
            className="btn-primary flex h-11 items-center gap-2 text-white"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Update email
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordCard({
  disabled,
  onSubmit,
}: {
  disabled: boolean
  onSubmit: (password: string) => Promise<{ success: boolean; error?: string }>
}) {
  const [pw, setPw] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    if (pw.length < 6) {
      setStatus({ kind: "error", msg: "Password must be at least 6 characters." })
      return
    }
    if (pw !== confirm) {
      setStatus({ kind: "error", msg: "Passwords don't match." })
      return
    }
    setBusy(true)
    setStatus(null)
    const res = await onSubmit(pw)
    setBusy(false)
    if (res.success) {
      setStatus({ kind: "ok", msg: "Password updated." })
      setPw("")
      setConfirm("")
    } else {
      setStatus({ kind: "error", msg: res.error || "Could not update password." })
    }
  }

  return (
    <Card className="card-glass">
      <CardContent className="p-6">
        <h2 className="font-display text-base font-semibold text-text-primary">Password</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Choose a strong password you don&apos;t use elsewhere.
        </p>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pw">New password</Label>
            <Input
              id="new-pw"
              type="password"
              autoComplete="new-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              disabled={disabled}
              className="h-11 border-hairline bg-surface"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pw">Confirm password</Label>
            <Input
              id="confirm-pw"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              disabled={disabled}
              className="h-11 border-hairline bg-surface"
            />
          </div>
          <StatusLine status={status} />
          <Button
            type="submit"
            disabled={disabled || busy || !pw || !confirm}
            className="btn-primary flex h-11 items-center gap-2 text-white"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function DangerZone({ email }: { email: string }) {
  const deletionMailto = mailto({
    subject: "Account deletion request",
    body: `Please delete my HakiSense account.\n\nAccount email: ${email || "(your account email)"}\n`,
  })

  return (
    <Card className="border-destructive/30 bg-destructive/[0.04]">
      <CardContent className="p-6">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-destructive">
          <ShieldAlert className="size-4" />
          Danger zone
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Permanently delete your account and research history. This can&apos;t be undone.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" className="mt-4 gap-2">
              <AlertTriangle className="size-4" />
              Delete account
            </Button>
          </DialogTrigger>
          <DialogContent className="border-hairline bg-popover">
            <DialogHeader>
              <DialogTitle>Delete your account</DialogTitle>
              <DialogDescription>
                For your security, deletion is handled manually rather than instantly in the
                browser. Send us a request from your account email and we&apos;ll remove your
                account and data, usually within a few business days.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button asChild variant="destructive" className="gap-2">
                <a href={deletionMailto}>
                  <Mail className="size-4" />
                  Email {SUPPORT_EMAIL}
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
