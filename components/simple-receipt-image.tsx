"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, ImageIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SimpleReceiptImageProps {
  imageUrl: string | null | undefined
  vendor: string
}

export function SimpleReceiptImage({ imageUrl, vendor }: SimpleReceiptImageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Check if image URL is missing or invalid
  const isMissingImage = !imageUrl || imageUrl === "None" || imageUrl === "/placeholder.svg"

  // Handle refresh click
  const handleRefresh = () => {
    if (isMissingImage) {
      toast({
        title: "No image available",
        description: "This receipt doesn't have an associated image URL.",
      })
      return
    }

    setIsLoading(true)
    toast({
      title: "Refreshing image",
      description: "Attempting to reload the receipt image...",
    })

    // Force browser to reload the image by adding a timestamp
    const img = new Image()
    img.onload = () => {
      setIsLoading(false)
      toast({
        title: "Image refreshed",
        description: "The receipt image has been refreshed successfully.",
      })
    }
    img.onerror = () => {
      setIsLoading(false)
      toast({
        title: "Image refresh failed",
        description: "Unable to load the receipt image. The URL may be invalid.",
        variant: "destructive",
      })
    }
    img.src = `${imageUrl}?t=${Date.now()}`
  }

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

        {/* Missing image placeholder */}
        {isMissingImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800 p-4">
            <ImageIcon className="h-16 w-16 text-zinc-600 mb-2" />
            <p className="text-center text-zinc-500">No receipt image available</p>
          </div>
        ) : (
          // The actual image (only shown if URL exists)
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={`Receipt from ${vendor}`}
            className="h-full w-full object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        )}
      </div>

      {/* Controls */}
      <div className="mt-4">
        <Button variant="outline" size="sm" className="w-full" onClick={handleRefresh} disabled={isMissingImage}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Image
        </Button>
      </div>

      {/* Debug info */}
      <div className="mt-2 text-xs text-zinc-500 break-all">
        <p>Image URL: {imageUrl || "None"}</p>
      </div>
    </div>
  )
}
