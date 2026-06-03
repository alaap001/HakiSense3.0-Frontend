import { LogOut, Settings, Sparkles, User } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { SearchTrigger } from "@/components/search/SearchTrigger"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { getInitials } from "@/lib/utils"

export function AppNav() {
  const { displayName, user, isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate("/login", { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg glass glow-violet-subtle">
            <Sparkles className="size-3.5 text-brand" />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight text-text-primary">
            HakiSense
          </span>
          <Badge variant="outline" className="border-violet text-brand">
            3.0
          </Badge>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <SearchTrigger />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-violet/50">
                <span className="hidden font-mono text-xs text-text-secondary sm:inline">
                  {displayName}
                </span>
                <Avatar className="size-8 border border-hairline">
                  <AvatarFallback className="bg-violet/15 font-mono text-xs font-semibold text-brand">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-hairline bg-popover/95 backdrop-blur-xl"
              >
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm text-text-primary">{displayName}</span>
                  {user?.email ? (
                    <span className="font-mono text-[11px] font-normal text-text-secondary">
                      {user.email}
                    </span>
                  ) : null}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={handleSignOut}
                  className="cursor-pointer"
                >
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  )
}
