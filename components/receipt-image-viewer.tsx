"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, ExternalLink, RefreshCw, ImageIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReceiptImageViewerProps {
  imageUrl: string | null
  vendor: string
}

export function ReceiptImageViewer({ imageUrl, vendor }: ReceiptImageViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [proxyUrl, setProxyUrl] = useState("")
  const [timestamp, setTimestamp] = useState(Date.now())
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const { toast } = useToast()

  // Function to extract Twilio media SID from URL
  function extractTwilioMediaInfo(url: string) {
    try {
      // Match pattern like: https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages/{MessageSid}/Media/{MediaSid}
      const regex = /\/Accounts\/([^/]+)\/Messages\/([^/]+)\/Media\/([^/]+)/
      const match = url.match(regex)

      if (match && match.length >= 4) {
        return {
          accountSid: match[1],
          messageSid: match[2],
          mediaSid: match[3],
          isTwilioMedia: true,
        }
      }

      return { isTwilioMedia: false }
    } catch (e) {
      console.error("Error extracting Twilio media info:", e)
      return { isTwilioMedia: false }
    }
  }

  // Function to create a proxy URL for images
  function getProxyImageUrl(originalUrl: string | null, download = false, refreshTimestamp = 0) {
    if (!originalUrl || originalUrl === "None") return "/placeholder.svg"

    // Check if this is a Twilio media URL
    if (originalUrl.includes("api.twilio.com") && originalUrl.includes("/Media/")) {
      const mediaInfo = extractTwilioMediaInfo(originalUrl)

      if (mediaInfo.isTwilioMedia) {
        const twilioMediaUrl = `/api/twilio-media?messageSid=${mediaInfo.messageSid}&mediaSid=${mediaInfo.mediaSid}${download ? "&download=true" : ""}`
        return refreshTimestamp ? `${twilioMediaUrl}&t=${refreshTimestamp}` : twilioMediaUrl
      }
    }

    // For non-Twilio URLs or if extraction failed, use the regular image proxy
    const baseUrl = `/api/image-proxy?url=${encodeURIComponent(originalUrl)}${download ? "&download=true" : ""}`
    return refreshTimestamp ? `${baseUrl}&t=${refreshTimestamp}` : baseUrl
  }

  // Refresh the image
  const refreshImage = () => {
    if (!imageUrl || imageUrl === "None") {
      toast({
        title: "No image available",
        description: "This receipt doesn't have an associated image.",
        variant: "destructive",
      })
      return
    }

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

  // Initialize the proxy URL
  useEffect(() => {
    console.log("Original image URL:", imageUrl)

    if (!imageUrl || imageUrl === "None") {
      setIsLoading(false)
      setProxyUrl("/placeholder.svg")
      return
    }

    const url = getProxyImageUrl(imageUrl, false, timestamp)
    console.log("Proxy image URL:", url)
    setProxyUrl(url)
  }, [imageUrl, timestamp])

  // Check if image is missing
  const isMissingImage = !imageUrl || imageUrl === "None"

  return (
    <div className="flex flex-col">
      {/* Image container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-zinc-700 bg-zinc-800">
        {/* Loading indicator */}
        {isLoading && !isMissingImage && (
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
        {isMissingImage && !isLoading && !hasError && (
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
            setErrorDetails(
              "Failed to load image. The image might be unavailable or there might be a connection issue.",
            )
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
            disabled={isMissingImage || hasError}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={refreshImage} disabled={isMissingImage}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Image
          </Button>
        </div>
      </div>

      {/* Debug info */}
      <div className="mt-2 text-xs text-zinc-500 break-all">
        <p>Image URL: {imageUrl || "None"}</p>
      </div>
    </div>
  )
}
