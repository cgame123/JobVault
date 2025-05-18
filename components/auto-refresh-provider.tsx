"use client"

import { useState, useEffect, type ReactNode } from "react"
import type { Receipt } from "@/lib/types"

interface AutoRefreshProviderProps {
  initialReceipts: Receipt[]
  children: (props: {
    receipts: Receipt[]
    lastRefreshed: Date
    isRefreshing: boolean
    manualRefresh: () => Promise<void>
  }) => ReactNode
  refreshInterval?: number
}

export function AutoRefreshProvider({
  initialReceipts,
  children,
  refreshInterval = 5000, // Default to 5 seconds
}: AutoRefreshProviderProps) {
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Function to fetch the latest receipts
  const fetchReceipts = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/receipts", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch receipts")
      }

      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setReceipts(data.data)
        setLastRefreshed(new Date())
      }
    } catch (error) {
      console.error("Error refreshing receipts:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Set up the interval to refresh receipts
  useEffect(() => {
    // Initial fetch after component mounts
    fetchReceipts()

    // Set up interval for periodic refreshes
    const intervalId = setInterval(fetchReceipts, refreshInterval)

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId)
  }, [refreshInterval])

  // Render the children with the current receipts and refresh state
  return (
    <>
      {children({
        receipts,
        lastRefreshed,
        isRefreshing,
        manualRefresh: fetchReceipts,
      })}
    </>
  )
}
