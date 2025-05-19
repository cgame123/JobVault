"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, ExternalLink, MapPin, User, Edit, Save, X, AlertCircle } from "lucide-react"
import { ReceiptActions } from "@/components/receipt-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

// Function to create a proxy URL for Twilio images
function getProxyImageUrl(originalUrl: string, download = false) {
  if (!originalUrl) return "/placeholder.svg"
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}${download ? "&download=true" : ""}`
}

// Receipt type definition
interface Receipt {
  id: string
  vendor: string
  amount: number
  date: string
  phoneNumber: string
  staffId: string
  staffName: string
  staffPhone?: string
  staffRole?: string
  property: string
  imageUrl: string
  createdAt: string
  status: string
  paid: boolean
}

export default function ReceiptDetailClient({ receipt }: { receipt: Receipt }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedReceipt, setEditedReceipt] = useState({
    vendor: receipt.vendor,
    amount: receipt.amount,
    date: receipt.date,
  })
  const [currentReceipt, setCurrentReceipt] = useState<Receipt>(receipt)
  const [saveError, setSaveError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Get status badge class based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
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

  // Handle status update
  const handleStatusUpdate = async (status: string) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/receipts/${currentReceipt.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(errorText || "Failed to update receipt status")
      }

      // Update the local state
      setCurrentReceipt({
        ...currentReceipt,
        status,
      })

      // Show success message
      toast({
        title: "Status updated",
        description: `Receipt status has been updated to ${status}.`,
      })
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
  const handlePaymentUpdate = async (paid: boolean) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/receipts/${currentReceipt.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paid }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(errorText || "Failed to update payment status")
      }

      // Update the local state
      setCurrentReceipt({
        ...currentReceipt,
        paid,
      })

      // Show success message
      toast({
        title: "Payment status updated",
        description: `Receipt has been marked as ${paid ? "paid" : "pending"}.`,
      })
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

  // Handle receipt details update
  const handleSaveDetails = async () => {
    setIsSubmitting(true)
    setSaveError(null)

    try {
      console.log("Saving receipt details:", editedReceipt)

      // Validate inputs
      if (!editedReceipt.vendor.trim()) {
        setSaveError("Vendor name is required")
        setIsSubmitting(false)
        return
      }

      if (isNaN(Number(editedReceipt.amount)) || Number(editedReceipt.amount) <= 0) {
        setSaveError("Amount must be a positive number")
        setIsSubmitting(false)
        return
      }

      if (!editedReceipt.date) {
        setSaveError("Date is required")
        setIsSubmitting(false)
        return
      }

      // Use simple fetch with POST method
      const response = await fetch(`/api/receipts/${currentReceipt.id}/simple-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendor: editedReceipt.vendor,
          amount: Number(editedReceipt.amount),
          date: editedReceipt.date,
        }),
      })

      // Check for HTTP errors
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(errorText || "Failed to update receipt details")
      }

      // Update the local state
      setCurrentReceipt({
        ...currentReceipt,
        vendor: editedReceipt.vendor,
        amount: Number(editedReceipt.amount),
        date: editedReceipt.date,
      })

      // Show success message
      toast({
        title: "Receipt updated",
        description: "Receipt details have been updated successfully.",
      })

      // Exit edit mode
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating receipt details:", error)
      setSaveError(error instanceof Error ? error.message : "Failed to update receipt details")
      toast({
        title: "Error",
        description: "Failed to update receipt details.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle input change for edited receipt
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedReceipt({
      ...editedReceipt,
      [name]: value,
    })
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      setEditedReceipt({
        vendor: currentReceipt.vendor,
        amount: currentReceipt.amount,
        date: currentReceipt.date,
      })
      setIsEditing(false)
      setSaveError(null)
    } else {
      // Start editing - copy current values
      setEditedReceipt({
        vendor: currentReceipt.vendor,
        amount: currentReceipt.amount,
        date: currentReceipt.date,
      })
      setIsEditing(true)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="outline" size="sm" className="text-zinc-400 hover:text-zinc-100">
          <Link href="/receipts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Receipts
          </Link>
        </Button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleEditMode}
                className="text-zinc-400 hover:text-zinc-100"
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveDetails}
                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={toggleEditMode} className="text-zinc-400 hover:text-zinc-100">
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </Button>
          )}
          <ReceiptActions receipt={currentReceipt} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Left column - Receipt image */}
        <Card className="md:col-span-2 border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader>
            <CardTitle>Receipt Image</CardTitle>
            <CardDescription className="text-zinc-400">Original receipt from {currentReceipt.vendor}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-zinc-700 bg-zinc-800">
              <Image
                src={getProxyImageUrl(currentReceipt.imageUrl) || "/placeholder.svg"}
                alt={`Receipt from ${currentReceipt.vendor}`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getProxyImageUrl(currentReceipt.imageUrl), "_blank")}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Size
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getProxyImageUrl(currentReceipt.imageUrl, true), "_blank")}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </CardFooter>
        </Card>

        {/* Right column - Receipt details */}
        <Card className="md:col-span-3 border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader>
            <CardTitle>Receipt Details</CardTitle>
            <CardDescription className="text-zinc-400">
              Submitted on {formatDate(currentReceipt.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Save Error Message */}
            {saveError && (
              <div className="rounded-md bg-red-900/20 border border-red-800 p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <div className="text-sm text-red-300">{saveError}</div>
              </div>
            )}

            {/* Basic receipt info */}
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor="vendor" className="text-sm font-medium text-zinc-400">
                      Vendor
                    </label>
                    <Input
                      id="vendor"
                      name="vendor"
                      value={editedReceipt.vendor}
                      onChange={handleInputChange}
                      className="border-zinc-700 bg-zinc-800 text-zinc-100"
                      placeholder="Enter vendor name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium text-zinc-400">
                      Amount
                    </label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      value={editedReceipt.amount}
                      onChange={handleInputChange}
                      className="border-zinc-700 bg-zinc-800 text-zinc-100"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium text-zinc-400">
                      Date
                    </label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={editedReceipt.date}
                      onChange={handleInputChange}
                      className="border-zinc-700 bg-zinc-800 text-zinc-100"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold text-zinc-100">{currentReceipt.vendor}</h3>
                    <span className="text-lg font-bold text-zinc-100">{formatCurrency(currentReceipt.amount)}</span>
                  </div>
                  <div className="text-sm text-zinc-400">Purchase Date: {formatDate(currentReceipt.date)}</div>
                </>
              )}
            </div>

            {/* Status and Payment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400">Status</h3>
                <Select
                  value={currentReceipt.status}
                  onValueChange={(value) => handleStatusUpdate(value)}
                  disabled={isSubmitting || isEditing}
                >
                  <SelectTrigger className={`w-full border ${getStatusBadgeClass(currentReceipt.status)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-zinc-800 text-zinc-100">
                    <SelectItem
                      value="processing"
                      className="bg-blue-900/30 text-blue-300 focus:bg-blue-900/50 focus:text-blue-100"
                    >
                      Processing
                    </SelectItem>
                    <SelectItem
                      value="approved"
                      className="bg-green-900/30 text-green-300 focus:bg-green-900/50 focus:text-green-100"
                    >
                      Approved
                    </SelectItem>
                    <SelectItem
                      value="rejected"
                      className="bg-red-900/30 text-red-300 focus:bg-red-900/50 focus:text-red-100"
                    >
                      Rejected
                    </SelectItem>
                    <SelectItem
                      value="duplicate"
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
                  value={currentReceipt.paid ? "paid" : "pending"}
                  onValueChange={(value) => handlePaymentUpdate(value === "paid")}
                  disabled={isSubmitting || isEditing}
                >
                  <SelectTrigger className={`w-full border ${getPaymentBadgeClass(currentReceipt.paid)}`}>
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

            <Separator className="bg-zinc-800" />

            {/* Staff information */}
            <div className="space-y-3">
              <h3 className="flex items-center text-sm font-medium text-zinc-400">
                <User className="mr-2 h-4 w-4" />
                Staff Information
              </h3>
              <div className="rounded-md bg-zinc-800/50 p-3">
                <div className="mb-1 text-sm font-medium text-zinc-100">
                  {currentReceipt.staffName || "Unknown Staff"}
                </div>
                {currentReceipt.staffRole && (
                  <div className="text-xs text-zinc-400">Role: {currentReceipt.staffRole}</div>
                )}
                {currentReceipt.staffPhone && (
                  <div className="text-xs text-zinc-400">Phone: {currentReceipt.staffPhone}</div>
                )}
              </div>
            </div>

            {/* Property information */}
            <div className="space-y-3">
              <h3 className="flex items-center text-sm font-medium text-zinc-400">
                <MapPin className="mr-2 h-4 w-4" />
                Property
              </h3>
              <div className="rounded-md bg-zinc-800/50 p-3">
                <div className="text-sm font-medium text-zinc-100">{currentReceipt.property || "Unassigned"}</div>
              </div>
            </div>

            {/* Technical details */}
            <Separator className="bg-zinc-800" />
            <div className="space-y-2 text-xs text-zinc-500">
              <div>Receipt ID: {currentReceipt.id}</div>
              <div>Submitted via: SMS to {currentReceipt.phoneNumber}</div>
              <div>Processed on: {new Date(currentReceipt.createdAt).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
