"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSupabase } from "@/lib/supabase"

export default function AuthDebugPage() {
  const [authUrl, setAuthUrl] = useState<string>("")
  const [siteUrl, setSiteUrl] = useState<string>("")
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = getSupabase()

        // Get current session
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error)
        } else {
          setSession(data.session)
        }

        // Get current URL
        if (typeof window !== "undefined") {
          setAuthUrl(`${window.location.origin}/auth/callback`)
          setSiteUrl(window.location.origin)
        }
      } catch (error) {
        console.error("Error in auth debug:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>Use this page to debug authentication issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100"></div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-300">Auth Callback URL</h3>
                <div className="rounded-md bg-zinc-800 p-2 text-sm text-zinc-300">{authUrl}</div>
                <p className="text-xs text-zinc-500">
                  This should match the redirect URL in your Supabase project settings.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-300">Site URL</h3>
                <div className="rounded-md bg-zinc-800 p-2 text-sm text-zinc-300">{siteUrl}</div>
                <p className="text-xs text-zinc-500">
                  This should match the Site URL in your Supabase project settings.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-300">Session Status</h3>
                <div className="rounded-md bg-zinc-800 p-2 text-sm text-zinc-300">
                  {session ? "Authenticated" : "Not authenticated"}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-300">Supabase Configuration</h3>
                <div className="rounded-md bg-zinc-800 p-2 text-sm text-zinc-300">
                  <p>1. Go to Supabase Dashboard</p>
                  <p>2. Select your project</p>
                  <p>3. Go to Authentication → URL Configuration</p>
                  <p>4. Set Site URL to: {siteUrl}</p>
                  <p>5. Add Redirect URL: {authUrl}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <a href="/login">Return to Login</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
