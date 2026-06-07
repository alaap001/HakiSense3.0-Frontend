import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TradeForm, type TradeFormSubmit, type TradeFormValues } from "@/components/journal/TradeForm"
import { useAuth } from "@/contexts/AuthContext"
import { useTradeMutations } from "@/hooks/useJournal"
import { uploadScreenshots } from "@/lib/journal/queries"
import type { Strategy } from "@/types/journal"

export function AddTradeDialog({
  open,
  onOpenChange,
  strategies,
  prefill,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  strategies: Strategy[]
  prefill?: Partial<TradeFormValues>
}) {
  const { user } = useAuth()
  const { create } = useTradeMutations()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit({ values, files }: TradeFormSubmit) {
    setError(null)
    setSubmitting(true)
    try {
      const screenshots = files.length && user ? await uploadScreenshots(user.id, files) : []
      await create.mutateAsync({ ...values, screenshots })
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="custom-scrollbar max-h-[92vh] overflow-y-auto border-hairline-strong bg-background sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Log a trade</DialogTitle>
          <DialogDescription>
            Capture the plan and the execution — R is computed from your stop. Research, not advice.
          </DialogDescription>
        </DialogHeader>
        <TradeForm
          key={prefill?.ticker ?? "new"}
          strategies={strategies}
          initial={prefill}
          submitting={submitting}
          error={error}
          submitLabel="Log trade"
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
