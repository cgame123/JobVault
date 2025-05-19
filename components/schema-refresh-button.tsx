"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SchemaRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const refreshSchema = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/refresh-schema", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to refresh schema")
      }

      toast({
        title: "Schema refreshed",
        description: "The Supabase schema has been refreshed successfully.",
      })

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error refreshing schema:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to refresh schema",
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
      onClick={refreshSchema}
      disabled={isRefreshing}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh Supabase Schema"}
    </Button>
  )
}
