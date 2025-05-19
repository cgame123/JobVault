"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw } from "lucide-react"

export function CacheRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const refreshCache = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/clear-cache")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to refresh cache")
      }

      toast({
        title: "Cache refreshed",
        description: "Schema cache has been refreshed. Reloading page...",
      })

      // Wait a moment before reloading to allow the toast to be seen
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Error refreshing cache:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to refresh cache",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={refreshCache}
      disabled={isRefreshing}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh Schema Cache"}
    </Button>
  )
}
