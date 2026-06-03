import { Link } from "react-router-dom"
import { ArrowLeft, Compass } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export default function NotFound() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="grid size-14 place-items-center rounded-2xl glass glow-violet-subtle">
        <Compass className="size-6 text-brand" />
      </span>
      <p className="mt-6 font-mono text-6xl font-semibold text-gradient">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-text-primary">
        This page isn&apos;t in the file.
      </h1>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="secondary" className="gap-2">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Back home
          </Link>
        </Button>
        {isAuthenticated ? (
          <Button asChild className="btn-primary text-white">
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        ) : (
          <Button asChild className="btn-primary text-white">
            <Link to="/signup">Get started</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
