import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

/* Supabase auth for the private admin dashboard.
   Restores the session on load, keeps it in sync, and exposes signIn / signOut
   helpers to any component through the useAuth() hook. */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  // Only start "loading" when Supabase is configured — otherwise there's no
  // session to fetch and the spinner would hang forever.
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return

    // Restore any existing session (e.g. after a page refresh).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Stay in sync on sign-in / sign-out events.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
