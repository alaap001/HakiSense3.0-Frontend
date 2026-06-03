/** Support / contact address. Override in `.env` with VITE_SUPPORT_EMAIL. */
export const SUPPORT_EMAIL: string =
  (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined) ?? "hello@hakisense.app"

/** Build a `mailto:` href with an encoded subject and body. */
export function mailto(opts: { subject?: string; body?: string } = {}): string {
  const params = new URLSearchParams()
  if (opts.subject) params.set("subject", opts.subject)
  if (opts.body) params.set("body", opts.body)
  const qs = params.toString()
  return `mailto:${SUPPORT_EMAIL}${qs ? `?${qs}` : ""}`
}
