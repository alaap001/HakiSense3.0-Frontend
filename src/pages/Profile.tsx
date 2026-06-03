import { useEffect, useState, type FormEvent } from "react"
import { AlertCircle, Check, Copy, Loader2, Save } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { getInitials } from "@/lib/utils"

export default function Profile() {
  const { user, displayName, isSupabaseConfigured, updateProfile } = useAuth()

  const [name, setName] = useState(displayName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  // Keep the field in sync if the auth user refreshes underneath us.
  useEffect(() => setName(displayName), [displayName])

  const dirty = name.trim() !== displayName && name.trim().length > 0

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!dirty || saving) return
    setSaving(true)
    setError("")
    setSaved(false)
    const res = await updateProfile(name.trim())
    setSaving(false)
    if (res.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setError(res.error || "Could not update profile")
    }
  }

  async function copyId() {
    if (!user?.id) return
    await navigator.clipboard.writeText(user.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—"

  return (
    <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-12">
      <p className="micro-label">Account</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text-primary">
        Your profile
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
        How you appear across HakiSense. Your email is used to sign in and isn&apos;t shown to
        anyone else.
      </p>

      <Card className="card-glass mt-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border border-hairline">
              <AvatarFallback className="bg-violet/15 font-display text-lg font-semibold text-brand">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold text-text-primary">
                {displayName}
              </p>
              {user?.email ? (
                <p className="truncate font-mono text-xs text-text-secondary">{user.email}</p>
              ) : null}
            </div>
          </div>

          {!isSupabaseConfigured && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-hairline bg-surface p-3 text-xs text-text-secondary">
              <AlertCircle className="size-4 shrink-0 text-brand" />
              Running without Supabase configured — profile changes can&apos;t be saved.
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={!isSupabaseConfigured}
                className="h-11 border-hairline bg-surface"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email ?? ""}
                readOnly
                disabled
                className="h-11 border-hairline bg-surface font-mono text-text-secondary"
              />
              <p className="text-xs text-text-secondary/60">
                Change your email from{" "}
                <a href="/settings" className="text-brand hover:underline">
                  Settings
                </a>
                .
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                <AlertCircle className="size-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!dirty || saving}
              className="btn-primary flex h-11 items-center gap-2 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : saved ? (
                <>
                  <Check className="size-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account details */}
      <Card className="card-glass mt-6">
        <CardContent className="p-6">
          <h2 className="micro-label mb-4">Account details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-text-secondary">Member since</dt>
              <dd className="font-mono text-text-primary">{memberSince}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-text-secondary">User ID</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="truncate font-mono text-xs text-text-secondary">
                  {user?.id ?? "—"}
                </span>
                {user?.id ? (
                  <button
                    type="button"
                    onClick={copyId}
                    className="shrink-0 text-text-secondary transition-colors hover:text-text-primary"
                    aria-label="Copy user ID"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-brand" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                ) : null}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
