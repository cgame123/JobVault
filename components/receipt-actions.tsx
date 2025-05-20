"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { MoreVertical, Eye, Download, Trash2, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { ReceiptDetailModal } from "./receipt-detail-modal"

interface ReceiptActionsProps {
  receipt: any
}

export function ReceiptActions({ receipt }: ReceiptActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Handle view details
  const handleViewDetails = () => {
    router.push(`/receipts/${receipt.id}`)
  }

  // Handle download
  const handleDownload = () => {
    if (!receipt.imageUrl) {
      toast({
        title: "No image available",
        description: "This receipt doesn't have an associated image to download.",
        variant: "destructive",
      })
      return
    }

    // Create a proxy URL for the image with download flag
    let downloadUrl = `/api/image-proxy?url=${encodeURIComponent(receipt.imageUrl)}&download=true`

    // Check if this is a Twilio media URL
    if (receipt.imageUrl.includes("api.twilio.com") && receipt.imageUrl.includes("/Media/")) {
      // Extract the message SID and media SID from Twilio URLs
      const regex = /\/Accounts\/([^/]+)\/Messages\/([^/]+)\/Media\/([^/]+)/
      const match = receipt.imageUrl.match(regex)

      if (match && match.length >= 4) {
        const messageSid = match[2]
        const mediaSid = match[3]
        downloadUrl = `/api/twilio-media?messageSid=${messageSid}&mediaSid=${mediaSid}&download=true`
      }
    }

    // Open the download URL in a new tab
    window.open(downloadUrl, "_blank")
  }

  // Handle quick view
  const handleQuickView = () => {
    setIsModalOpen(true)
  }

  // Handle status update
  const handleStatusUpdate = async (status: string) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/receipts/${receipt.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update receipt status")
      }

      toast({
        title: "Status updated",
        description: `Receipt status has been updated to ${status}.`,
      })

      // Refresh the page to show the updated status
      router.refresh()
    } catch (error) {
      console.error("Error updating receipt status:", error)
      toast({
        title: "Error",
        description: "Failed to update receipt status.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle payment update
  const handlePaymentUpdate = async (paid: boolean) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/receipts/${receipt.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paid }),
      })

      if (!response.ok) {
        throw new Error("Failed to update payment status")
      }

      toast({
        title: "Payment status updated",
        description: `Receipt has been marked as ${paid ? "paid" : "pending"}.`,
      })

      // Refresh the page to show the updated status
      router.refresh()
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this receipt? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/receipts/${receipt.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete receipt")
      }

      toast({
        title: "Receipt deleted",
        description: "The receipt has been deleted successfully.",
      })

      // Redirect to the receipts list
      router.push("/receipts")
      router.refresh()
    } catch (error) {
      console.error("Error deleting receipt:", error)
      toast({
        title: "Error",
        description: "Failed to delete receipt.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900">
          <DropdownMenuItem onClick={handleViewDetails} className="text-zinc-300 hover:text-zinc-100">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleQuickView} className="text-zinc-300 hover:text-zinc-100">
            <Eye className="mr-2 h-4 w-4" />
            Quick View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload} className="text-zinc-300 hover:text-zinc-100">
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={() => handleStatusUpdate("Approved")}
            className="text-green-300 hover:text-green-100"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Approved
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate("Rejected")} className="text-red-300 hover:text-red-100">
            <XCircle className="mr-2 h-4 w-4" />
            Mark as Rejected
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem onClick={handleDelete} className="text-red-300 hover:text-red-100">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReceiptDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        receipt={receipt}
        onStatusChange={handleStatusUpdate}
        onPaymentChange={handlePaymentUpdate}
        onDelete={handleDelete}
      />
    </>
  )
}
