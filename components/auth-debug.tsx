"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function AuthDebug() {
  const { user, session, refreshSession } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-zinc-800 text-zinc-200 z-50"
      >
        Debug Auth
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg z-50 max-w-md overflow-auto max-h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-zinc-100">Auth Debug</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
          Close
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-zinc-400 mb-1">Authentication Status</h4>
          <p className="text-zinc-200">{user ? `Authenticated as ${user.email}` : "Not authenticated"}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-zinc-400 mb-1">Session</h4>
          <div className="bg-zinc-800 p-2 rounded text-xs">
            <pre className="whitespace-pre-wrap break-all text-zinc-300">
              {session ? JSON.stringify(session, null, 2) : "No active session"}
            </pre>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-zinc-400 mb-1">User</h4>
          <div className="bg-zinc-800 p-2 rounded text-xs">
            <pre className="whitespace-pre-wrap break-all text-zinc-300">
              {user ? JSON.stringify(user, null, 2) : "No user data"}
            </pre>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={refreshSession} size="sm">
            Refresh Session
          </Button>
          <Button onClick={() => (window.location.href = "/login")} variant="outline" size="sm">
            Go to Login
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="outline" size="sm">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
