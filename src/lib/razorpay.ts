/**
 * Razorpay Standard Checkout — lazy script loader + a typed `openCheckout` wrapper.
 *
 * The checkout.js script is injected on first use (not bundled, not on every page) and the
 * load is memoised. `openCheckout` resolves the order via the modal callbacks: `onSuccess`
 * carries the three fields the backend `/api/billing/verify` needs; `onDismiss` fires when
 * the user closes the modal; `onError` fires on `payment.failed`.
 */

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js"

export interface RazorpaySuccess {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface RazorpayInstance {
  open: () => void
  on: (event: string, handler: (response: unknown) => void) => void
}
interface RazorpayCtor {
  new (options: Record<string, unknown>): RazorpayInstance
}

declare global {
  interface Window {
    Razorpay?: RazorpayCtor
  }
}

/** Thrown when the user closes the checkout modal without paying (a cancel, not a failure). */
export class CheckoutDismissed extends Error {
  constructor() {
    super("Checkout was cancelled.")
    this.name = "CheckoutDismissed"
  }
}

let loadPromise: Promise<void> | null = null

/** Inject checkout.js once; resolves when `window.Razorpay` is available. */
export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window for Razorpay."))
  if (window.Razorpay) return Promise.resolve()
  if (loadPromise) return loadPromise
  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loadPromise = null // allow a retry on the next attempt
      reject(new Error("Could not load Razorpay checkout. Check your connection and retry."))
    }
    document.body.appendChild(script)
  })
  return loadPromise
}

export interface CheckoutOptions {
  key: string
  amount: number
  currency: string
  orderId: string
  name?: string
  description?: string
  prefillEmail?: string
  prefillName?: string
  onSuccess: (resp: RazorpaySuccess) => void
  onDismiss?: () => void
  onError?: (message: string) => void
}

/** Open the Razorpay modal for an already-created order. */
export async function openCheckout(opts: CheckoutOptions): Promise<void> {
  await loadRazorpay()
  const Ctor = window.Razorpay
  if (!Ctor) throw new Error("Razorpay failed to initialise.")

  const rzp = new Ctor({
    key: opts.key,
    amount: opts.amount,
    currency: opts.currency,
    order_id: opts.orderId,
    name: opts.name ?? "HakiSense",
    description: opts.description,
    prefill: { email: opts.prefillEmail, name: opts.prefillName },
    theme: { color: "#059669" }, // emerald — matches the brand
    handler: (resp: unknown) => opts.onSuccess(resp as RazorpaySuccess),
    modal: { ondismiss: () => opts.onDismiss?.() },
  })

  rzp.on("payment.failed", (resp: unknown) => {
    const err = (resp as { error?: { description?: string } } | undefined)?.error
    opts.onError?.(err?.description || "Payment failed. Please try again.")
  })

  rzp.open()
}
