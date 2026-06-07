import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/contexts/AuthContext"
import { createOrder, getBillingMe, verifyPayment, type BillingMe, type Cycle, type PaidTier } from "@/lib/billing"
import { CheckoutDismissed, openCheckout, type RazorpaySuccess } from "@/lib/razorpay"
import { supabase } from "@/lib/supabase"

/**
 * The signed-in user's plan + credit/research usage. Enabled when authenticated, or in local
 * dev where Supabase isn't configured (the backend returns an unmetered snapshot without a token).
 */
export function useBilling() {
  const { getToken, isAuthenticated, isSupabaseConfigured } = useAuth()
  return useQuery({
    queryKey: ["billing", "me"],
    queryFn: async () => getBillingMe(await getToken()),
    enabled: isAuthenticated || !isSupabaseConfigured,
    staleTime: 30 * 1000,
  })
}

export interface UpgradeArgs {
  tier: PaidTier
  cycle: Cycle
}

/**
 * Buy/upgrade flow: create the order server-side → open Razorpay checkout → verify the signature
 * → refresh the Supabase session so the `app_metadata.plan` claim updates immediately → invalidate
 * the usage snapshot. Rejects with {@link CheckoutDismissed} when the user closes the modal.
 */
export function useUpgrade() {
  const { getToken, user } = useAuth()
  const qc = useQueryClient()

  return useMutation<BillingMe, Error, UpgradeArgs>({
    mutationFn: async ({ tier, cycle }) => {
      const token = await getToken()
      const order = await createOrder(tier, cycle, token)

      const verified = await new Promise<BillingMe>((resolve, reject) => {
        openCheckout({
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          orderId: order.order_id,
          description: `HakiSense ${tier} · ${cycle}`,
          prefillEmail: user?.email ?? undefined,
          prefillName:
            (user?.user_metadata as { full_name?: string } | undefined)?.full_name ?? undefined,
          onSuccess: (resp: RazorpaySuccess) => {
            verifyPayment(resp, token).then(resolve).catch(reject)
          },
          onDismiss: () => reject(new CheckoutDismissed()),
          onError: (message) => reject(new Error(message)),
        }).catch(reject)
      })

      // Pull the new plan claim into the session so gating/useEntitlements update without a reload.
      if (supabase) await supabase.auth.refreshSession()
      return verified
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing", "me"] })
    },
  })
}
