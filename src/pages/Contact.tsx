import { useState, type FormEvent } from "react"
import { ArrowRight, Mail, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mailto, SUPPORT_EMAIL } from "@/lib/site"

export default function Contact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [opened, setOpened] = useState(false)

  const canSend = subject.trim().length > 0 && message.trim().length > 0

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSend) return
    const body = [
      message.trim(),
      "",
      "—",
      name.trim() ? `From: ${name.trim()}` : null,
      email.trim() ? `Reply to: ${email.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n")
    // Opens the visitor's email client, pre-filled. No backend required.
    window.location.href = mailto({ subject: subject.trim(), body })
    setOpened(true)
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-20 pt-12">
      <div className="text-center">
        <p className="micro-label">Contact</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text-primary">
          Get in touch
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
          Questions, feedback, or a bug to report? Send us a note — we read every message.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Direct contact */}
        <div className="space-y-4">
          <Card className="card-glass">
            <CardContent className="p-6">
              <span className="grid size-10 place-items-center rounded-xl glass glow-violet-subtle">
                <Mail className="size-5 text-brand" />
              </span>
              <h2 className="mt-4 font-display text-base font-semibold text-text-primary">
                Email us directly
              </h2>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-1 inline-block font-mono text-sm text-brand hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </CardContent>
          </Card>
          <Card className="card-glass">
            <CardContent className="p-6">
              <span className="grid size-10 place-items-center rounded-xl glass glow-violet-subtle">
                <MessageSquare className="size-5 text-brand" />
              </span>
              <h2 className="mt-4 font-display text-base font-semibold text-text-primary">
                What to expect
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                We typically reply within a couple of business days. For account deletion,
                include the email on your account.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <Card className="card-glass">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c-name">Name</Label>
                  <Input
                    id="c-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-11 border-hairline bg-surface"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email">Email</Label>
                  <Input
                    id="c-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 border-hairline bg-surface"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="c-subject">Subject</Label>
                <Input
                  id="c-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's this about?"
                  className="h-11 border-hairline bg-surface"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="c-message">Message</Label>
                <textarea
                  id="c-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind…"
                  rows={6}
                  className="custom-scrollbar w-full resize-y rounded-xl border border-hairline bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/60 focus:border-violet/50"
                />
              </div>

              {opened && (
                <p className="text-xs text-brand">
                  Your email app should have opened with the message ready to send. If it
                  didn&apos;t, email us at{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
              )}

              <Button
                type="submit"
                disabled={!canSend}
                className="btn-primary flex h-11 items-center gap-2 text-white"
              >
                Open email
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
