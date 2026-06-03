import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Up-to-two-letter initials from a display name or email, for avatar fallbacks. */
export function getInitials(nameOrEmail: string): string {
  const name = (nameOrEmail || "").trim()
  if (!name) return "?"
  const local = name.includes("@") ? name.split("@")[0] : name
  const parts = local.split(/[\s._-]+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
