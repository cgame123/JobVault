"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ImageDebugPage() {
  const [imageUrl, setImageUrl] = useState("")
  const [debugResult, setDebugResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [receiptId, setReceiptId] = useState("")
  const [receipt, setReceipt] = useState<any>(null)
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false)

  const debugImageUrl = async () => {
    if (!imageUrl) return

    setIsLoading(true)
    setDebugResult(null)

    try {
      const response = await fetch(`/api/debug-image-url?url=${encodeURIComponent(imageUrl)}`)
      const data = await response.json()
      setDebugResult(data)
    } catch (error) {
      setDebugResult({ error: "Failed to debug image URL" })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReceipt = async () => {
    if (!receiptId) return

    setIsLoadingReceipt(true)
    setReceipt(null)

    try {
      const response = await fetch(`/api/receipts/${receiptId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch receipt: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setReceipt(data)

      // If the receipt has an image URL, set it for debugging
      if (data.imageUrl || data.image_url) {
        setImageUrl(data.imageUrl || data.image_url)
      }
    } catch (error) {
      console.error("Error fetching receipt:", error)
      setReceipt({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsLoadingReceipt(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Image URL Debugging Tool</h1>

      <div className="grid gap-6">
        {/* Receipt Lookup */}
        <Card>
          <CardHeader>
            <CardTitle>Receipt Lookup</CardTitle>
            <CardDescription>Look up a receipt by ID to check its image URL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="Enter receipt ID" value={receiptId} onChange={(e) => setReceiptId(e.target.value)} />
              <Button onClick={fetchReceipt} disabled={isLoadingReceipt}>
                {isLoadingReceipt ? "Loading..." : "Fetch Receipt"}
              </Button>
            </div>

            {receipt && (
              <div className="mt-4 p-4 bg-zinc-800 rounded-md overflow-auto">
                <pre className="text-xs text-zinc-300">{JSON.stringify(receipt, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image URL Debugging */}
        <Card>
          <CardHeader>
            <CardTitle>Image URL Debugging</CardTitle>
            <CardDescription>Test an image URL to see if it's accessible</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="Enter image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              <Button onClick={debugImageUrl} disabled={isLoading}>
                {isLoading ? "Checking..." : "Check URL"}
              </Button>
            </div>

            {debugResult && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-zinc-800 rounded-md overflow-auto">
                  <pre className="text-xs text-zinc-300">{JSON.stringify(debugResult, null, 2)}</pre>
                </div>

                {debugResult.isValidUrl && (
                  <div className="p-4 bg-zinc-800 rounded-md">
                    <h3 className="text-sm font-medium mb-2">Image Preview:</h3>
                    <div className="flex justify-center bg-zinc-900 p-4 rounded-md">
                      <img
                        src={`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`}
                        alt="Image preview"
                        className="max-h-64 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                          e.currentTarget.classList.add("border", "border-red-500")
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Direct Image Test */}
        <Card>
          <CardHeader>
            <CardTitle>Direct Image Test</CardTitle>
            <CardDescription>Test loading the image directly without the proxy</CardDescription>
          </CardHeader>
          <CardContent>
            {imageUrl && (
              <div className="space-y-4">
                <div className="p-4 bg-zinc-800 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Direct Image URL:</h3>
                  <p className="text-xs text-zinc-300 break-all">{imageUrl}</p>
                </div>

                <div className="p-4 bg-zinc-800 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Proxied Image URL:</h3>
                  <p className="text-xs text-zinc-300 break-all">{`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`}</p>
                </div>

                <div className="p-4 bg-zinc-800 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Direct Image Preview (may not work due to CORS):</h3>
                  <div className="flex justify-center bg-zinc-900 p-4 rounded-md">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="Direct image preview"
                      className="max-h-64 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                        e.currentTarget.classList.add("border", "border-red-500")
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
