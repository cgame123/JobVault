"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, ExternalLink, RefreshCw, ImageIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReceiptImageViewerProps {
  imageUrl: string
  vendor: string
}

export function ReceiptImageViewer({ imageUrl, vendor }: ReceiptImageViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [proxyUrl, setProxyUrl] = useState("")
  const [timestamp, setTimestamp] = useState(Date.now())
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const { toast } = useToast()

  // Function to create a proxy URL for images
  function getProxyImageUrl(originalUrl: string, download = false, refreshTimestamp = 0) {
    if (!originalUrl) return "/placeholder.svg"

    // If the URL is already a placeholder, return it directly
    if (originalUrl === "/placeholder.svg") return originalUrl

    const baseUrl = `/api/image-proxy?url=${encodeURIComponent(originalUrl)}${download ? "&download=true" : ""}`
    return refreshTimestamp ? `${baseUrl}&t=${refreshTimestamp}` : baseUrl
  }

  // Refresh the image
  const refreshImage = () => {
    setIsLoading(true)
    setHasError(false)
    setErrorDetails(null)
    const newTimestamp = Date.now()
    setTimestamp(newTimestamp)
    setProxyUrl(getProxyImageUrl(imageUrl, false, newTimestamp))

    toast({
      title: "Refreshing image",
      description: "Attempting to reload the receipt image...",
    })
  }

  // Test if the image URL is accessible
  const testImageUrl = async () => {
    try {
      setIsLoading(true)

      // First, check if we have a valid URL
      if (!imageUrl || imageUrl === "/placeholder.svg") {
        throw new Error("No valid image URL available")
      }

      const response = await fetch(`/api/test-image?url=${encodeURIComponent(imageUrl)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Status: ${response.status} ${response.statusText}`)
      }

      toast({
        title: "Image test results",
        description: data.message || "Image is accessible",
      })

      // If the test was successful, try refreshing the image
      refreshImage()
    } catch (error) {
      console.error("Image test error:", error)
      setHasError(true)
      setErrorDetails(error instanceof Error ? error.message : String(error))

      toast({
        title: "Image test failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize the proxy URL
  useEffect(() => {
    console.log("Original image URL:", imageUrl)
    const url = getProxyImageUrl(imageUrl, false, timestamp)
    console.log("Proxy image URL:", url)
    setProxyUrl(url)
  }, [imageUrl, timestamp])

  return (
    <div className="flex flex-col">
      {/* Image container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-zinc-700 bg-zinc-800">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 z-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100"></div>
          </div>
        )}

        {/* Error message */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 p-4 z-10">
            <AlertCircle className="h-10 w-10 text-red-400 mb-2" />
            <p className="text-center text-zinc-400">Failed to load image</p>
            {errorDetails && (
              <p className="text-center text-zinc-500 text-sm mt-1 max-w-full overflow-hidden text-ellipsis">
                {errorDetails}
              </p>
            )}
            <Button variant="outline" size="sm" className="mt-4" onClick={refreshImage}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Placeholder for empty image */}
        {(!imageUrl || imageUrl === "/placeholder.svg") && !isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800 p-4">
            <ImageIcon className="h-16 w-16 text-zinc-600 mb-2" />
            <p className="text-center text-zinc-500">No receipt image available</p>
          </div>
        )}

        {/* The image */}
        <img
          src={proxyUrl || "/placeholder.svg"}
          alt={`Receipt from ${vendor}`}
          className="h-full w-full object-contain"
          onLoad={() => {
            console.log("Image loaded successfully")
            setIsLoading(false)
            setHasError(false)
          }}
          onError={(e) => {
            console.error("Error loading image:", e)
            setIsLoading(false)
            setHasError(true)
          }}
        />
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(proxyUrl, "_blank")}
            disabled={!imageUrl || imageUrl === "/placeholder.svg" || hasError}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={refreshImage}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Image
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={testImageUrl}>
          Test Image URL
        </Button>
      </div>

      {/* Debug info */}
      <div className="mt-2 text-xs text-zinc-500 break-all">
        <p>Image URL: {imageUrl || "None"}</p>
      </div>
    </div>
  )
}
