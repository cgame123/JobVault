"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { Receipt } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Download, ExternalLink } from "lucide-react"

interface ReceiptTableProps {
  receipts: Receipt[]
}

export function ReceiptTable({ receipts }: ReceiptTableProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Function to create a proxy URL for Twilio images
  const getProxyImageUrl = (originalUrl: string, download = false) => {
    // Create a URL that goes through our API proxy
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}${download ? "&download=true" : ""}`
  }

  // Reset loading and error states when a new receipt is selected
  useEffect(() => {
    if (selectedReceipt) {
      setImageLoading(true)
      setImageError(false)
    }
  }, [selectedReceipt])

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-zinc-400">Receipt</TableHead>
              <TableHead className="text-zinc-400">Vendor</TableHead>
              <TableHead className="text-zinc-400">Amount</TableHead>
              <TableHead className="text-zinc-400">Date</TableHead>
              <TableHead className="text-zinc-400">Staff Member</TableHead>
              <TableHead className="text-right text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableCell colSpan={6} className="h-24 text-center text-zinc-400">
                  No receipts found.
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow key={receipt.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell>
                    <div
                      className="relative h-10 w-10 cursor-pointer overflow-hidden rounded-md border border-zinc-700 bg-zinc-800"
                      onClick={() => setSelectedReceipt(receipt)}
                    >
                      {/* Show a thumbnail of the receipt using our proxy */}
                      <div className="relative h-full w-full">
                        <Image
                          src={getProxyImageUrl(receipt.imageUrl) || "/placeholder.svg"}
                          alt={`Receipt from ${receipt.vendor}`}
                          fill
                          className="object-cover"
                          onError={() => console.log("Thumbnail load error")}
                          unoptimized
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-zinc-100">{receipt.vendor}</TableCell>
                  <TableCell className="text-zinc-100">{formatCurrency(receipt.amount)}</TableCell>
                  <TableCell className="text-zinc-100">{formatDate(receipt.date)}</TableCell>
                  <TableCell className="text-zinc-100">{receipt.staffName || "Unknown"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedReceipt(receipt)}
                      className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View receipt</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        {selectedReceipt && (
          <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Receipt Details</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-zinc-700 bg-zinc-800">
                {/* Show the receipt image preview */}
                <div className="relative h-full w-full">
                  <Image
                    src={getProxyImageUrl(selectedReceipt.imageUrl) || "/placeholder.svg"}
                    alt={`Receipt from ${selectedReceipt.vendor}`}
                    fill
                    className="object-contain"
                    onLoadingComplete={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false)
                      setImageError(true)
                    }}
                    unoptimized
                  />

                  {/* Loading state */}
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100"></div>
                    </div>
                  )}

                  {/* Error state */}
                  {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
                      <p className="text-center text-zinc-400">Failed to load image</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons for the receipt */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getProxyImageUrl(selectedReceipt.imageUrl), "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Full Size
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.open(getProxyImageUrl(selectedReceipt.imageUrl, true), "_blank")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-zinc-500">Vendor</p>
                  <p className="text-lg font-semibold text-zinc-100">{selectedReceipt.vendor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Amount</p>
                  <p className="text-lg font-semibold text-zinc-100">{formatCurrency(selectedReceipt.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Date</p>
                  <p className="text-lg font-semibold text-zinc-100">{formatDate(selectedReceipt.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Staff Member</p>
                  <p className="text-lg font-semibold text-zinc-100">{selectedReceipt.staffName || "Unknown"}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
