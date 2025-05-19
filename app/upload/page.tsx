"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    url?: string
    error?: string
  } | null>(null)
  const [extractResult, setExtractResult] = useState<any>(null)
  const [extracting, setExtracting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadResult(null)
      setExtractResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadResult(null)
    setExtractResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setUploadResult({
          success: true,
          url: result.url,
        })
      } else {
        setUploadResult({
          success: false,
          error: result.error || "Upload failed",
        })
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: String(error),
      })
    } finally {
      setUploading(false)
    }
  }

  const handleExtract = async () => {
    if (!uploadResult?.url) return

    setExtracting(true)

    try {
      const response = await fetch(`/api/test-extract?imageUrl=${encodeURIComponent(uploadResult.url)}`)
      const result = await response.json()
      setExtractResult(result)
    } catch (error) {
      setExtractResult({
        success: false,
        error: String(error),
      })
    } finally {
      setExtracting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-zinc-100">Test Receipt Extraction</CardTitle>
          <CardDescription className="text-zinc-400">
            Upload a receipt image to test the AI extraction capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
              />
            </div>

            {file && (
              <div className="mt-4">
                <p className="text-sm text-zinc-400">Selected file: {file.name}</p>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="mt-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                >
                  {uploading ? "Uploading..." : "Upload Receipt"}
                </Button>
              </div>
            )}

            {uploadResult && (
              <div className="mt-4 p-4 rounded-md border border-zinc-800 bg-zinc-800/50">
                {uploadResult.success ? (
                  <div>
                    <p className="text-green-400 mb-2">Upload successful!</p>
                    <p className="text-sm text-zinc-400 break-all">URL: {uploadResult.url}</p>
                    <div className="mt-4">
                      <img
                        src={uploadResult.url || "/placeholder.svg"}
                        alt="Uploaded receipt"
                        className="max-h-60 rounded-md border border-zinc-700"
                      />
                    </div>
                    <Button
                      onClick={handleExtract}
                      disabled={extracting}
                      className="mt-4 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                    >
                      {extracting ? "Extracting..." : "Extract Receipt Data"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-red-400">Upload failed: {uploadResult.error}</p>
                )}
              </div>
            )}

            {extractResult && (
              <div className="mt-4 p-4 rounded-md border border-zinc-800 bg-zinc-800/50">
                <h3 className="text-lg font-medium text-zinc-100 mb-2">Extraction Results</h3>
                {extractResult.success ? (
                  <div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-zinc-400">Vendor</p>
                        <p className="text-zinc-100">{extractResult.data.vendor}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-400">Amount</p>
                        <p className="text-zinc-100">
                          $
                          {typeof extractResult.data.amount === "number"
                            ? extractResult.data.amount.toFixed(2)
                            : extractResult.data.amount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-400">Date</p>
                        <p className="text-zinc-100">{extractResult.data.date}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-400">Extraction failed: {extractResult.error}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t border-zinc-800 pt-4">
          <p className="text-xs text-zinc-500">
            This tool uses AI to extract information from receipt images. Results may vary depending on image quality.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
