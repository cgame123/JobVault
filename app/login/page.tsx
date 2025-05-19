"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { isSupabaseConfigured } from "@/lib/supabase"

// Component to dynamically load the Auth UI
const DynamicAuthUI = () => {
  const [AuthUI, setAuthUI] = useState<React.ComponentType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadAuthUI = async () => {
      try {
        const module = await import("@/components/auth-ui")
        if (isMounted) {
          setAuthUI(() => module.AuthUI)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load Auth UI:", err)
          setError("Failed to load authentication component")
          setIsLoading(false)
        }
      }
    }

    loadAuthUI()

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return AuthUI ? <AuthUI /> : null
}

export default function LoginPage() {
  // If Supabase is not configured, show an error message
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 py-8">
        <Card className="w-full border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">Configuration Error</CardTitle>
            <CardDescription className="text-zinc-400">
              The authentication service is not properly configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Missing Environment Variables</AlertTitle>
              <AlertDescription>
                <p>The following environment variables are required:</p>
                <ul className="mt-2 list-disc pl-5">
                  <li>NEXT_PUBLIC_SUPABASE_URL</li>
                  <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                </ul>
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-sm text-zinc-400">
              <p>Please add these environment variables to your project and restart the application.</p>
              <p className="mt-2">
                For local development, add them to your <code className="rounded bg-zinc-800 px-1">.env.local</code>{" "}
                file.
              </p>
              <p className="mt-2">
                For production, add them to your hosting provider's environment variables configuration.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
              onClick={() => (window.location.href = "/")}
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 py-8">
      <Card className="w-full border-zinc-800 bg-zinc-900/50 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">Welcome to JobVault</CardTitle>
          <CardDescription className="text-zinc-400">
            Sign in to access your receipt management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicAuthUI />
        </CardContent>
      </Card>
    </div>
  )
}
