import { type ButtonHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

/**
 * The single tab/pill vocabulary for the app. `tabTriggerClass` styles shadcn
 * <TabsTrigger> (was copy-pasted in RunView + Journal); <Pill> is the segmented
 * button (was a third, separate variant in Dashboard's research modes).
 */

export const tabTriggerClass =
  "rounded-full border border-hairline bg-transparent px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-hairline-strong data-[state=active]:border-violet data-[state=active]:bg-violet/15 data-[state=active]:text-brand-strong data-[state=active]:shadow-none"

export function Pill({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-colors disabled:opacity-50",
        active
          ? "border-violet bg-violet/15 text-brand-strong"
          : "border-hairline text-text-secondary hover:border-hairline-strong",
        className,
      )}
      {...props}
    />
  )
}
