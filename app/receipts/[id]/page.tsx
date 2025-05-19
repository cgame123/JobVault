"use client"

import type React from "react"

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, ExternalLink, MapPin, User, Edit, Save, X } from "lucide-react"
import { ReceiptActions } from "@/components/receipt-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

// Disable caching for this route
export const dynamic = "force-dynamic"
export const revalidate = 0

// Function to get a receipt by ID
async function getReceiptById(id: string) {
  const { data, error } = await supabase
    .from("receipts")
    .select(`
      *,
      staff:staff_id (
        name,
        phone_number,
        role,
        property
      )
    `)
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("Error fetching receipt:", error)
    return null
  }

  return {
    id: data.id,
    vendor: data.vendor,
    amount: Number(data.amount),
    date: data.date,
    phoneNumber: data.phone_number,
    staffId: data.staff_id,
    staffName: data.staff?.name || data.staff_name,
    staffPhone: data.staff?.phone_number,
    staffRole: data.staff?.role,
    property: data.staff?.property,
    imageUrl: data.image_url,
    createdAt: data.created_at,
    status: data.status || "processing",
    paid: data.paid || false,
  }
}

// Function to create a proxy URL for Twilio images
function getProxyImageUrl(originalUrl: string, download = false) {
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}${download ? "&download=true" : ""}`
}

export default function ReceiptDetailsPage({ params }: { params: { id: string } }) {
  const [receipt, setReceipt] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedReceipt, setEditedReceipt] = useState<any>(null)
  const { toast } = useToast()

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
    return paid ? "bg-green-900/30 text-green-300 border-green-800" : "bg-red-900/30 text-red-300 border-red-800"
  }

  // Handle status update
  const handleStatusUpdate = async (status: string) => {
    if (!receipt) return
    setIsSubmitting(true)

    try {
      // Try the direct update endpoint
      const response = await fetch(`/api/receipts/${receipt.id}/status`, {
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
      setReceipt({
        ...receipt,
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
    if (!receipt) return
    setIsSubmitting(true)

    try {
      // Try the direct update endpoint
      const response = await fetch(`/api/receipts/${receipt.id}/status`, {
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
      setReceipt({
        ...receipt,
        paid,
      })

      // Show success message
      toast({
        title: "Payment status updated",
        description: `Receipt has been marked as ${paid ? "paid" : "unpaid"}.`,
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
    if (!receipt || !editedReceipt) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/receipts/${receipt.id}/details`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendor: editedReceipt.vendor,
          amount: Number.parseFloat(editedReceipt.amount),
          date: editedReceipt.date,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update receipt details")
      }

      // Update the local state
      setReceipt({
        ...receipt,
        vendor: editedReceipt.vendor,
        amount: Number.parseFloat(editedReceipt.amount),
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
      setEditedReceipt(receipt)
      setIsEditing(false)
    } else {
      // Start editing - copy current values
      setEditedReceipt({
        vendor: receipt.vendor,
        amount: receipt.amount,
        date: receipt.date,
      })
      setIsEditing(true)
    }
  }

  // Fetch receipt data
  useEffect(() => {
    async function loadReceipt() {
      setIsLoading(true)
      const data = await getReceiptById(params.id)
      if (!data) {
        notFound()
      }
      setReceipt(data)
      setEditedReceipt({
        vendor: data.vendor,
        amount: data.amount,
        date: data.date,
      })
      setIsLoading(false)
    }

    loadReceipt()
  }, [params.id])

  if (isLoading || !receipt) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100"></div>
        </div>
      </div>
    )
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
          <ReceiptActions receipt={receipt} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Left column - Receipt image */}
        <Card className="md:col-span-2 border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader>
            <CardTitle>Receipt Image</CardTitle>
            <CardDescription className="text-zinc-400">Original receipt from {receipt.vendor}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-zinc-700 bg-zinc-800">
              <Image
                src={getProxyImageUrl(receipt.imageUrl) || "/placeholder.svg"}
                alt={`Receipt from ${receipt.vendor}`}
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
              onClick={() => window.open(getProxyImageUrl(receipt.imageUrl), "_blank")}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Size
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getProxyImageUrl(receipt.imageUrl, true), "_blank")}
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
            <CardDescription className="text-zinc-400">Submitted on {formatDate(receipt.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold text-zinc-100">{receipt.vendor}</h3>
                    <span className="text-lg font-bold text-zinc-100">{formatCurrency(receipt.amount)}</span>
                  </div>
                  <div className="text-sm text-zinc-400">Purchase Date: {formatDate(receipt.date)}</div>
                </>
              )}
            </div>

            {/* Status and Payment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400">Status</h3>
                <Select
                  value={receipt.status}
                  onValueChange={(value) => handleStatusUpdate(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={`w-full border ${getStatusBadgeClass(receipt.status)}`}>
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
                  value={receipt.paid ? "paid" : "unpaid"}
                  onValueChange={(value) => handlePaymentUpdate(value === "paid")}
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
                      value="unpaid"
                      className="bg-red-900/30 text-red-300 focus:bg-red-900/50 focus:text-red-100"
                    >
                      Unpaid
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
                <div className="mb-1 text-sm font-medium text-zinc-100">{receipt.staffName || "Unknown Staff"}</div>
                {receipt.staffRole && <div className="text-xs text-zinc-400">Role: {receipt.staffRole}</div>}
                {receipt.staffPhone && <div className="text-xs text-zinc-400">Phone: {receipt.staffPhone}</div>}
              </div>
            </div>

            {/* Property information */}
            <div className="space-y-3">
              <h3 className="flex items-center text-sm font-medium text-zinc-400">
                <MapPin className="mr-2 h-4 w-4" />
                Property
              </h3>
              <div className="rounded-md bg-zinc-800/50 p-3">
                <div className="text-sm font-medium text-zinc-100">{receipt.property || "Unassigned"}</div>
              </div>
            </div>

            {/* Technical details */}
            <Separator className="bg-zinc-800" />
            <div className="space-y-2 text-xs text-zinc-500">
              <div>Receipt ID: {receipt.id}</div>
              <div>Submitted via: SMS to {receipt.phoneNumber}</div>
              <div>Processed on: {new Date(receipt.createdAt).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
