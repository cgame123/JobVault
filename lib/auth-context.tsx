"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  isConfigured: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  isConfigured: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If Supabase is not configured, don't try to initialize auth
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    try {
      const supabase = getSupabase()

      // Get the current session
      const getSession = async () => {
        try {
          const { data, error } = await supabase.auth.getSession()
          if (error) {
            console.error("Error getting session:", error)
            setError(error.message)
          }
          setSession(data.session)
          setUser(data.session?.user || null)
        } catch (err) {
          console.error("Failed to initialize auth:", err)
          setError("Authentication initialization failed. Please check your configuration.")
        } finally {
          setIsLoading(false)
        }
      }

      getSession()

      // Listen for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        console.log(`Auth event: ${event}`)
        setSession(session)
        setUser(session?.user || null)
        setIsLoading(false)
      })

      return () => {
        authListener.subscription.unsubscribe()
      }
    } catch (err) {
      console.error("Failed to set up auth:", err)
      setError("Authentication setup failed. Please check your configuration.")
      setIsLoading(false)
    }
  }, [])

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setError("Authentication is not configured")
      return
    }

    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()
    } catch (err) {
      console.error("Error signing out:", err)
      setError("Failed to sign out. Please try again.")
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, error, isConfigured: isSupabaseConfigured, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
