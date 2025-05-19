"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { Receipt } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Download, ExternalLink, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReceiptTableProps {
  receipts: Receipt[]
}

export function ReceiptTable({ receipts: initialReceipts }: ReceiptTableProps) {
  // IMPORTANT: Use the passed receipts directly without modifying them
  // This ensures we respect the server-side filtering
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Update receipts when initialReceipts changes (due to filtering)
  useEffect(() => {
    setReceipts(initialReceipts)
  }, [initialReceipts])

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

  // Handle delete confirmation
  const handleDeleteClick = (receipt: Receipt) => {
    setReceiptToDelete(receipt)
    setIsDeleting(true)
  }

  // Handle actual deletion
  const handleDeleteConfirm = async () => {
    if (!receiptToDelete) return

    setIsSubmitting(true)

    try {
      // Submit the delete request to the API
      const response = await fetch(`/api/receipts/${receiptToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete receipt")
      }

      // Update the local state
      setReceipts((prev) => prev.filter((receipt) => receipt.id !== receiptToDelete.id))

      // Show success message
      toast({
        title: "Receipt deleted",
        description: `Receipt from ${receiptToDelete.vendor} has been deleted successfully.`,
      })

      // Close dialog
      setIsDeleting(false)
      setReceiptToDelete(null)

      // If the deleted receipt was being viewed, close that dialog too
      if (selectedReceipt && selectedReceipt.id === receiptToDelete.id) {
        setSelectedReceipt(null)
      }

      // Refresh the page to show the updated receipt list
      router.refresh()
    } catch (error) {
      console.error("Error deleting receipt:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete receipt",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (receiptId: string, status: string) => {
    setIsSubmitting(true)

    try {
      // Try the direct update endpoint
      const response = await fetch(`/api/receipts/${receiptId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update receipt status")
      }

      // Update the local state
      setReceipts((prev) =>
        prev.map((receipt) => (receipt.id === receiptId ? { ...receipt, status: status as any } : receipt)),
      )

      // If the selected receipt is the one being updated, update it too
      if (selectedReceipt && selectedReceipt.id === receiptId) {
        setSelectedReceipt({ ...selectedReceipt, status: status as any })
      }

      // Show success message
      toast({
        title: "Status updated",
        description: `Receipt status has been updated to ${status}.`,
      })

      // Refresh the page to ensure filters are applied correctly
      router.refresh()
    } catch (error) {
      console.error("Error updating receipt status:", error)
      toast({
        title: "Error",
        description: "Failed to update receipt status.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle payment update
  const handlePaymentUpdate = async (receiptId: string, paid: boolean) => {
    setIsSubmitting(true)

    try {
      // Try the direct update endpoint
      const response = await fetch(`/api/receipts/${receiptId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paid }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update payment status")
      }

      // Update the local state
      setReceipts((prev) => prev.map((receipt) => (receipt.id === receiptId ? { ...receipt, paid } : receipt)))

      // If the selected receipt is the one being updated, update it too
      if (selectedReceipt && selectedReceipt.id === receiptId) {
        setSelectedReceipt({ ...selectedReceipt, paid })
      }

      // Show success message
      toast({
        title: "Payment status updated",
        description: `Receipt has been marked as ${paid ? "paid" : "pending"}.`,
      })

      // Refresh the page to ensure filters are applied correctly
      router.refresh()
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
              <TableHead className="text-zinc-400">Property</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Payment</TableHead>
              <TableHead className="text-right text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableCell colSpan={9} className="h-24 text-center text-zinc-400">
                  No receipts found.
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow
                  key={receipt.id}
                  className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer"
                  onClick={() => (window.location.href = `/receipts/${receipt.id}`)}
                >
                  <TableCell>
                    <div
                      className="relative h-10 w-10 cursor-pointer overflow-hidden rounded-md border border-zinc-700 bg-zinc-800"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedReceipt(receipt)
                      }}
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
                  <TableCell className="text-zinc-100">{receipt.property || "—"}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={receipt.status || "processing"}
                      onValueChange={(value) => handleStatusUpdate(receipt.id, value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        className={`w-[130px] border ${getStatusBadgeClass(receipt.status || "processing")}`}
                        onClick={(e) => e.stopPropagation()}
                      >
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
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={receipt.paid ? "paid" : "unpaid"}
                      onValueChange={(value) => handlePaymentUpdate(receipt.id, value === "paid")}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        className={`w-[100px] border ${getPaymentBadgeClass(receipt.paid)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
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
                          value="unpaid"
                          className="bg-zinc-700/50 text-zinc-300 focus:bg-zinc-700/70 focus:text-zinc-100"
                        >
                          Pending
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `/receipts/${receipt.id}`
                      }}
                      className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View receipt</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(receipt)
                      }}
                      className="text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete receipt</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Receipt Details Dialog */}
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

              {/* Status and payment badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-zinc-500">Status</p>
                  <Select
                    value={selectedReceipt.status || "processing"}
                    onValueChange={(value) => handleStatusUpdate(selectedReceipt.id, value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      className={`w-full border ${getStatusBadgeClass(selectedReceipt.status || "processing")}`}
                    >
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

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-zinc-500">Payment</p>
                  <Select
                    value={selectedReceipt.paid ? "paid" : "unpaid"}
                    onValueChange={(value) => handlePaymentUpdate(selectedReceipt.id, value === "paid")}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={`w-full border ${getPaymentBadgeClass(selectedReceipt.paid)}`}>
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
                        value="unpaid"
                        className="bg-zinc-700/50 text-zinc-300 focus:bg-zinc-700/70 focus:text-zinc-100"
                      >
                        Pending
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.open(getProxyImageUrl(selectedReceipt.imageUrl, true), "_blank")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedReceipt(null)
                      handleDeleteClick(selectedReceipt)
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
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
                <div className="col-span-2">
                  <p className="text-sm font-medium text-zinc-500">Property</p>
                  <p className="text-lg font-semibold text-zinc-100">{selectedReceipt.property || "Not specified"}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={(open) => !open && setIsDeleting(false)}>
        {receiptToDelete && (
          <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Receipt</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-zinc-300">
                Are you sure you want to delete this receipt from{" "}
                <span className="font-semibold">{receiptToDelete.vendor}</span>? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleting(false)}
                className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={isSubmitting}>
                {isSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
