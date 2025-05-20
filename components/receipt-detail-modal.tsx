"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Download, Maximize } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ReceiptDetailModalProps {
  isOpen: boolean
  onClose: () => void
  receipt: any
  onStatusChange: (status: string) => Promise<void>
  onPaymentChange: (paid: boolean) => Promise<void>
  onDelete?: () => Promise<void>
}

export function ReceiptDetailModal({
  isOpen,
  onClose,
  receipt,
  onStatusChange,
  onPaymentChange,
  onDelete,
}: ReceiptDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Function to create a proxy URL for Twilio images
  function getProxyImageUrl(originalUrl: string | null) {
    if (!originalUrl || originalUrl === "None") return null

    // Check if this is a Twilio media URL
    if (originalUrl.includes("api.twilio.com") && originalUrl.includes("/Media/")) {
      // Extract the message SID and media SID from Twilio URLs
      const regex = /\/Accounts\/([^/]+)\/Messages\/([^/]+)\/Media\/([^/]+)/
      const match = originalUrl.match(regex)

      if (match && match.length >= 4) {
        const messageSid = match[2]
        const mediaSid = match[3]
        return `/api/twilio-media?messageSid=${messageSid}&mediaSid=${mediaSid}`
      }
    }

    // For non-Twilio URLs or if extraction failed, use the regular image proxy
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`
  }

  // Handle status change
  const handleStatusChange = async (status: string) => {
    setIsSubmitting(true)
    try {
      await onStatusChange(status)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle payment change
  const handlePaymentChange = async (paid: boolean) => {
    setIsSubmitting(true)
    try {
      await onPaymentChange(paid)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!onDelete) return
    if (window.confirm("Are you sure you want to delete this receipt? This action cannot be undone.")) {
      setIsSubmitting(true)
      try {
        await onDelete()
        onClose()
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Get status badge class based on status
  const getStatusBadgeClass = (status: string) => {
    // Convert to lowercase for case-insensitive comparison
    const statusLower = status?.toLowerCase() || ""

    switch (statusLower) {
      case "processing":
        return "bg-blue-900/30 text-blue-300 border-blue-800"
      case "approved":
        return "bg-green-900/30 text-green-300 border-green-800"
      case "rejected":
        return "bg-red-900/30 text-red-300 border-red-800"
      case "duplicate":
        return "bg-purple-900/30 text-purple-300 border-purple-800"
      default:
        return "bg-blue-900/30 text-blue-300 border-blue-800" // Default to processing
    }
  }

  // Get payment badge class based on paid status
  const getPaymentBadgeClass = (paid: boolean) => {
    return paid ? "bg-green-900/30 text-green-300 border-green-800" : "bg-zinc-700/50 text-zinc-300 border-zinc-600"
  }

  // Set up the image URL when the receipt changes
  useEffect(() => {
    if (receipt) {
      console.log("Receipt in modal:", receipt)
      const url = receipt.imageUrl || receipt.image_url
      console.log("Original image URL in modal:", url)
      setImageUrl(getProxyImageUrl(url))
    }
  }, [receipt])

  if (!receipt) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receipt Details</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-6">
          {/* Receipt image */}
          <div className="relative aspect-auto w-full overflow-hidden rounded-md border border-zinc-700 bg-zinc-800">
            {imageUrl ? (
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={`Receipt from ${receipt.vendor}`}
                className="h-full w-full object-contain"
                onError={(e) => {
                  console.error("Error loading image in modal:", e)
                  // If the image fails to load, log the URL for debugging
                  console.log("Failed image URL:", imageUrl)
                }}
              />
            ) : (
              <div className="flex h-64 items-center justify-center">
                <p className="text-zinc-500">No image available</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(imageUrl || "", "_blank")}
              disabled={!imageUrl}
            >
              <Maximize className="h-4 w-4 mr-2" />
              View Full Size
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`${imageUrl}&download=true`, "_blank")}
              disabled={!imageUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            {onDelete && (
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isSubmitting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>

          {/* Status and Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">Status</h3>
              <Select
                value={receipt.status}
                onValueChange={(value) => handleStatusChange(value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={`w-full border ${getStatusBadgeClass(receipt.status)}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-800 text-zinc-100">
                  <SelectItem
                    value="Processing"
                    className="bg-blue-900/30 text-blue-300 focus:bg-blue-900/50 focus:text-blue-100"
                  >
                    Processing
                  </SelectItem>
                  <SelectItem
                    value="Approved"
                    className="bg-green-900/30 text-green-300 focus:bg-green-900/50 focus:text-green-100"
                  >
                    Approved
                  </SelectItem>
                  <SelectItem
                    value="Rejected"
                    className="bg-red-900/30 text-red-300 focus:bg-red-900/50 focus:text-red-100"
                  >
                    Rejected
                  </SelectItem>
                  <SelectItem
                    value="Duplicate"
                    className="bg-purple-900/30 text-purple-300 focus:bg-purple-900/50 focus:text-purple-100"
                  >
                    Duplicate
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">Payment</h3>
              <Select
                value={receipt.paid ? "paid" : "pending"}
                onValueChange={(value) => handlePaymentChange(value === "paid")}
                disabled={isSubmitting}
              >
                <SelectTrigger className={`w-full border ${getPaymentBadgeClass(receipt.paid)}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-800 text-zinc-100">
                  <SelectItem
                    value="paid"
                    className="bg-green-900/30 text-green-300 focus:bg-green-900/50 focus:text-green-100"
                  >
                    Paid
                  </SelectItem>
                  <SelectItem
                    value="pending"
                    className="bg-zinc-700/50 text-zinc-300 focus:bg-zinc-700/70 focus:text-zinc-100"
                  >
                    Pending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Receipt details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Vendor</h3>
                <p className="text-lg font-semibold text-zinc-100">{receipt.vendor}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Amount</h3>
                <p className="text-lg font-semibold text-zinc-100">{formatCurrency(receipt.amount)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Date</h3>
                <p className="text-zinc-100">{receipt.date}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Staff Member</h3>
                <p className="text-zinc-100">{receipt.staffName || "Unknown Staff"}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-400">Property</h3>
              <p className="text-zinc-100">{receipt.property || "Unassigned"}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
