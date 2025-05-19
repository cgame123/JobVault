"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)

    try {
      // Force a hard refresh of the page with cache busting
      const timestamp = new Date().getTime()
      window.location.href = window.location.pathname + "?refresh=" + timestamp
    } catch (error) {
      console.error("Error refreshing:", error)
      // Fallback to simple reload
      window.location.reload()
    }

    // This won't actually run due to the page reload, but it's here for completeness
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="text-zinc-400 hover:text-zinc-100"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </Button>
  )
}
