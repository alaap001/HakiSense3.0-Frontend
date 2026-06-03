import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Session, User } from "@supabase/supabase-js"

import { isSupabaseConfigured, supabase } from "@/lib/supabase"

export interface AuthResult {
  success: boolean
  error?: string
}

export interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  /** False when Supabase env vars are absent — the app then runs auth-free. */
  isSupabaseConfigured: boolean
  /** Display name from the auth user (metadata full_name/name, else email). */
  displayName: string
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, name?: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  /** Update the display name (stored in user_metadata.full_name). */
  updateProfile: (name: string) => Promise<AuthResult>
  /** Change the account email — sends a confirmation to the new address. */
  updateEmail: (email: string) => Promise<AuthResult>
  /** Set a new password for the signed-in user. */
  updatePassword: (password: string) => Promise<AuthResult>
  /** Supabase access_token for the Authorization header, or undefined auth-free. */
  getToken: () => Promise<string | undefined>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { success: false, error: "Supabase is not configured" }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error ? { success: false, error: error.message } : { success: true }
    },
    [],
  )

  const signUp = useCallback(
    async (email: string, password: string, name?: string): Promise<AuthResult> => {
      if (!supabase) return { success: false, error: "Supabase is not configured" }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: name ? { data: { full_name: name } } : undefined,
      })
      return error ? { success: false, error: error.message } : { success: true }
    },
    [],
  )

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setSession(null)
  }, [])

  const updateProfile = useCallback(async (name: string): Promise<AuthResult> => {
    if (!supabase) return { success: false, error: "Supabase is not configured" }
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
    return error ? { success: false, error: error.message } : { success: true }
  }, [])

  const updateEmail = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { success: false, error: "Supabase is not configured" }
    const { error } = await supabase.auth.updateUser({ email })
    return error ? { success: false, error: error.message } : { success: true }
  }, [])

  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    if (!supabase) return { success: false, error: "Supabase is not configured" }
    const { error } = await supabase.auth.updateUser({ password })
    return error ? { success: false, error: error.message } : { success: true }
  }, [])

  const getToken = useCallback(async (): Promise<string | undefined> => {
    if (!supabase) return undefined
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token
  }, [])

  const user = session?.user ?? null
  const displayName = useMemo(() => {
    if (!user) return ""
    const meta = user.user_metadata as { full_name?: string; name?: string } | undefined
    return meta?.full_name || meta?.name || user.email || "Researcher"
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      isAuthenticated: !!user,
      isSupabaseConfigured,
      displayName,
      signIn,
      signUp,
      signOut,
      updateProfile,
      updateEmail,
      updatePassword,
      getToken,
    }),
    [
      user,
      session,
      loading,
      displayName,
      signIn,
      signUp,
      signOut,
      updateProfile,
      updateEmail,
      updatePassword,
      getToken,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
