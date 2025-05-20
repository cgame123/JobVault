"use client"

import { useState, useEffect } from "react"
import { ImageIcon } from "lucide-react"

interface TwilioImageProps {
  imageUrl: string | null
  alt: string
  className?: string
}

export function TwilioImage({ imageUrl, alt, className = "" }: TwilioImageProps) {
  const [proxyUrl, setProxyUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

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
  function getProxyImageUrl(originalUrl: string | null) {
    if (!originalUrl || originalUrl === "None") return "/placeholder.svg"

    // Check if this is a Twilio media URL
    if (originalUrl.includes("api.twilio.com") && originalUrl.includes("/Media/")) {
      const mediaInfo = extractTwilioMediaInfo(originalUrl)

      if (mediaInfo.isTwilioMedia) {
        return `/api/twilio-media?messageSid=${mediaInfo.messageSid}&mediaSid=${mediaInfo.mediaSid}`
      }
    }

    // For non-Twilio URLs or if extraction failed, use the regular image proxy
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`
  }

  // Initialize the proxy URL
  useEffect(() => {
    console.log("Original image URL in TwilioImage:", imageUrl)

    if (!imageUrl || imageUrl === "None") {
      setIsLoading(false)
      setProxyUrl("/placeholder.svg")
      return
    }

    const url = getProxyImageUrl(imageUrl)
    console.log("Proxy image URL in TwilioImage:", url)
    setProxyUrl(url)
  }, [imageUrl])

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100"></div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 p-4 z-10">
          <ImageIcon className="h-10 w-10 text-zinc-600 mb-2" />
          <p className="text-center text-zinc-500">Failed to load image</p>
        </div>
      )}

      {!imageUrl || imageUrl === "None" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800 p-4">
          <ImageIcon className="h-10 w-10 text-zinc-600 mb-2" />
          <p className="text-center text-zinc-500">No image available</p>
        </div>
      ) : (
        <img
          src={proxyUrl || "/placeholder.svg"}
          alt={alt}
          className={`h-full w-full object-contain ${className}`}
          onLoad={() => {
            console.log("Image loaded successfully in TwilioImage")
            setIsLoading(false)
            setHasError(false)
          }}
          onError={(e) => {
            console.error("Error loading image in TwilioImage:", e)
            setIsLoading(false)
            setHasError(true)
          }}
        />
      )}
    </div>
  )
}
