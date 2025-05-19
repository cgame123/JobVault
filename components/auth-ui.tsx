"use client"

import { useState, useEffect } from "react"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { getSupabase } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

export function AuthUI() {
  const [error, setError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)
  const [origin, setOrigin] = useState<string>("")

  useEffect(() => {
    try {
      const supabaseClient = getSupabase()
      setSupabase(supabaseClient)

      // Set origin safely inside useEffect
      if (typeof window !== "undefined") {
        setOrigin(window.location.origin)
      }
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err)
      setError("Failed to initialize authentication")
    }
  }, [])

  // Custom theme to match our app's dark theme
  const customTheme = {
    default: {
      colors: {
        brand: "rgb(39, 39, 42)",
        brandAccent: "rgb(63, 63, 70)",
        brandButtonText: "white",
        inputBackground: "rgb(39, 39, 42)",
        inputBorder: "rgb(63, 63, 70)",
        inputText: "white",
        inputPlaceholder: "rgb(161, 161, 170)",
      },
      space: {
        buttonPadding: "12px 15px",
        inputPadding: "12px 15px",
      },
      fonts: {
        bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
        buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
      },
      fontSizes: {
        baseBodySize: "14px",
        baseInputSize: "14px",
        baseLabelSize: "14px",
        baseButtonSize: "14px",
      },
    },
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>{error}. Please check your environment variables.</AlertDescription>
      </Alert>
    )
  }

  if (!supabase || !origin) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100"></div>
      </div>
    )
  }

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa, variables: customTheme }}
      theme="dark"
      providers={[]}
      redirectTo={`${origin}/auth/callback`}
    />
  )
}
