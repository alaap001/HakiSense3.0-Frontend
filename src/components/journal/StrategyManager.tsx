import { useState, type FormEvent } from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStrategies, useStrategyMutations } from "@/hooks/useStrategies"

export function StrategyManager() {
  const { data: strategies = [] } = useStrategies()
  const { create, remove } = useStrategyMutations()
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")

  async function add(e: FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    await create.mutateAsync({ name: n, description: desc.trim() || null })
    setName("")
    setDesc("")
  }

  return (
    <div className="rounded-xl border border-hairline bg-panel p-4">
      <p className="micro-label mb-3">Strategies &amp; setups</p>
      <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Strategy name" className="sm:max-w-[12rem]" />
        <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" className="flex-1" />
        <Button type="submit" disabled={!name.trim() || create.isPending} className="btn-primary gap-1.5 text-white">
          <Plus className="size-4" />
          Add
        </Button>
      </form>
      <ul className="mt-3 space-y-1.5">
        {strategies.length === 0 ? (
          <p className="text-xs text-text-secondary/70">No strategies yet — name your setups to unlock per-strategy stats.</p>
        ) : (
          strategies.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-lg border border-hairline px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-text-primary">{s.name}</p>
                {s.description ? <p className="truncate text-xs text-text-secondary">{s.description}</p> : null}
              </div>
              <button
                onClick={() => void remove.mutateAsync(s.id)}
                aria-label={`Delete ${s.name}`}
                className="shrink-0 p-1 text-text-secondary transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
