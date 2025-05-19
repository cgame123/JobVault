"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  signOut: async () => {},
  refreshSession: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      console.log("Refreshing session...")
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error refreshing session:", error)
        setError(error.message)
        return
      }

      console.log("Session data:", data)
      setSession(data.session)
      setUser(data.session?.user || null)

      if (data.session) {
        console.log("User is authenticated:", data.session.user.email)
      } else {
        console.log("No active session found")
      }
    } catch (err) {
      console.error("Unexpected error refreshing session:", err)
      setError("Failed to refresh session")
    }
  }

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      try {
        setIsLoading(true)
        console.log("Initial session check...")

        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setError(error.message)
        } else {
          console.log("Initial session data:", data)
          setSession(data.session)
          setUser(data.session?.user || null)

          if (data.session) {
            console.log("User is authenticated:", data.session.user.email)
          } else {
            console.log("No active session found")
          }
        }
      } catch (err) {
        console.error("Failed to initialize auth:", err)
        setError("Authentication initialization failed")
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(`Auth event: ${event}`, newSession)

      setSession(newSession)
      setUser(newSession?.user || null)
      setIsLoading(false)

      // Force a router refresh when auth state changes
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        console.log("User signed in, refreshing router...")
        router.refresh()
      }

      if (event === "SIGNED_OUT") {
        console.log("User signed out, refreshing router...")
        router.refresh()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (err) {
      console.error("Error signing out:", err)
      setError("Failed to sign out")
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, error, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
