"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, ExternalLink, MapPin, User, Edit, Save, X, AlertCircle } from "lucide-react"
import { ReceiptActions } from "@/components/receipt-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

// Function to create a proxy URL for Twilio images
function getProxyImageUrl(originalUrl: string, download = false) {
  if (!originalUrl) return "/placeholder.svg"
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}${download ? "&download=true" : ""}`
}

// Function to get today's date in YYYY-MM-DD format
function getTodayDate() {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

// Function to safely format a date with fallback
function safeFormatDate(dateString: string | null | undefined) {
  if (!dateString) return "N/A"
  try {
    return formatDate(dateString)
  } catch (error) {
    console.error("Error formatting date:", dateString, error)
    return "Invalid date"
  }
}

// Function to check if a value is an array
function isArray(value: any): value is any[] {
  return Array.isArray(value)
}

export default function ReceiptDetailsPage({ params }: { params: { id: string } }) {
  const [receipt, setReceipt] = useState<any>(null)
  const [staffMembers, setStaffMembers] = useState<any[]>([]) // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedReceipt, setEditedReceipt] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update receipt status")
      }

      const data = await response.json()

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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update payment status")
      }

      const data = await response.json()

      // Update the local state
      setReceipt({
        ...receipt,
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
    if (!receipt || !editedReceipt) return
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

      if (isNaN(editedReceipt.amount) || Number.parseFloat(editedReceipt.amount) <= 0) {
        setSaveError("Amount must be a positive number")
        setIsSubmitting(false)
        return
      }

      if (!editedReceipt.date) {
        setSaveError("Date is required")
        setIsSubmitting(false)
        return
      }

      // Use the update endpoint with POST method
      const response = await fetch(`/api/receipts/${receipt.id}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendor: editedReceipt.vendor,
          amount: Number.parseFloat(editedReceipt.amount),
          date: editedReceipt.date,
          staffId: editedReceipt.staffId,
        }),
      })

      // Check for HTTP errors
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)

        let errorMessage = "Failed to update receipt details"
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (e) {
          // If we can't parse the error as JSON, use the raw text
          errorMessage = errorText || "Unknown error"
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Find the selected staff member if staffMembers is an array
      let selectedStaffName = receipt.staffName
      let selectedStaffRole = receipt.staffRole
      let selectedStaffPhone = receipt.staffPhone

      if (isArray(staffMembers)) {
        const selectedStaff = staffMembers.find((staff) => staff.id === editedReceipt.staffId)
        if (selectedStaff) {
          selectedStaffName = selectedStaff.name || receipt.staffName
          selectedStaffRole = selectedStaff.role || receipt.staffRole
          selectedStaffPhone = selectedStaff.phone_number || receipt.staffPhone
        }
      }

      // Update the local state
      setReceipt({
        ...receipt,
        vendor: editedReceipt.vendor,
        amount: Number.parseFloat(editedReceipt.amount),
        date: editedReceipt.date,
        staffId: editedReceipt.staffId,
        staffName: selectedStaffName,
        staffRole: selectedStaffRole,
        staffPhone: selectedStaffPhone,
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

  // Handle select change for edited receipt
  const handleSelectChange = (name: string, value: string) => {
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
        vendor: receipt.vendor,
        amount: receipt.amount,
        date: receipt.date || getTodayDate(),
        staffId: receipt.staffId,
      })
      setIsEditing(false)
      setSaveError(null)
    } else {
      // Start editing - copy current values
      setEditedReceipt({
        vendor: receipt.vendor,
        amount: receipt.amount,
        date: receipt.date || getTodayDate(),
        staffId: receipt.staffId,
      })
      setIsEditing(true)
    }
  }

  // Fetch receipt data
  useEffect(() => {
    async function loadReceipt() {
      setIsLoading(true)
      setError(null)
      setImageLoading(true)
      setImageError(false)

      try {
        // Fetch receipt data
        const response = await fetch(`/api/receipts/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch receipt")
        }

        const data = await response.json()

        if (!data) {
          setError("Receipt not found. It may have been deleted or you don't have permission to view it.")
          setIsLoading(false)
          return
        }

        // Log the receipt data for debugging
        console.log("Receipt data:", data)

        // Ensure date is in the correct format or use today's date
        const formattedDate = data.date || getTodayDate()

        // Create a sanitized receipt object
        const sanitizedReceipt = {
          ...data,
          date: formattedDate,
          vendor: data.vendor || "Unknown Vendor",
          amount: Number(data.amount) || 0,
          staffId: data.staffId || "",
          staffName: data.staffName || "Unknown Staff",
          property: data.property || "Unassigned",
          imageUrl: data.imageUrl || "",
        }

        // Log the image URL for debugging
        console.log("Image URL:", sanitizedReceipt.imageUrl)

        setReceipt(sanitizedReceipt)
        setEditedReceipt({
          vendor: sanitizedReceipt.vendor,
          amount: sanitizedReceipt.amount,
          date: sanitizedReceipt.date,
          staffId: sanitizedReceipt.staffId,
        })

        // Fetch staff members
        try {
          const staffResponse = await fetch("/api/staff")
          if (staffResponse.ok) {
            const staffResponseData = await staffResponse.json()
            console.log("Staff response:", staffResponseData)

            // Extract the staff data array from the response
            let staffData = []

            // Check if the response has a data property that is an array
            if (staffResponseData && staffResponseData.data && isArray(staffResponseData.data)) {
              staffData = staffResponseData.data
              console.log("Staff data extracted from response:", staffData.length)
            }
            // Check if the response itself is an array
            else if (isArray(staffResponseData)) {
              staffData = staffResponseData
              console.log("Staff data is directly an array:", staffData.length)
            }
            // If neither, log an error but continue with an empty array
            else {
              console.error("Unexpected staff data format:", staffResponseData)
              staffData = []
            }

            setStaffMembers(staffData)
          } else {
            console.error("Failed to fetch staff members:", staffResponse.statusText)
            setStaffMembers([]) // Set to empty array as fallback
          }
        } catch (staffError) {
          console.error("Error fetching staff members:", staffError)
          setStaffMembers([]) // Set to empty array as fallback
        }
      } catch (err) {
        console.error("Error in loadReceipt:", err)
        setError("An error occurred while loading the receipt. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadReceipt()
  }, [params.id])

  // Show loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !receipt) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm" className="text-zinc-400 hover:text-zinc-100">
            <Link href="/receipts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Receipts
            </Link>
          </Button>
        </div>
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300">{error || "Receipt not found or an error occurred."}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.refresh()} className="text-zinc-400 hover:text-zinc-100">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Create the proxy image URL
  const proxyImageUrl = getProxyImageUrl(receipt.imageUrl)
  console.log("Proxy image URL:", proxyImageUrl)

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
              {/* Show the receipt image preview */}
              <div className="relative h-full w-full">
                <Image
                  src={proxyImageUrl || "/placeholder.svg"}
                  alt={`Receipt from ${receipt.vendor}`}
                  fill
                  className="object-contain"
                  onLoadingComplete={() => {
                    console.log("Image loaded successfully")
                    setImageLoading(false)
                  }}
                  onError={() => {
                    console.error("Error loading image:", proxyImageUrl)
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 p-4">
                    <AlertCircle className="h-10 w-10 text-red-400 mb-2" />
                    <p className="text-center text-zinc-400">Failed to load image</p>
                    <p className="text-center text-zinc-500 text-sm mt-1">
                      The image may be unavailable or there might be a connection issue
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setImageLoading(true)
                        setImageError(false)
                        // Force reload the image by updating a timestamp
                        const timestamp = new Date().getTime()
                        const refreshedUrl = `${proxyImageUrl}&t=${timestamp}`
                        const img = new Image()
                        img.src = refreshedUrl
                        img.onload = () => {
                          // Update the image source with the refreshed URL
                          const imgElement = document.querySelector(
                            `img[alt="Receipt from ${receipt.vendor}"]`,
                          ) as HTMLImageElement
                          if (imgElement) {
                            imgElement.src = refreshedUrl
                            setImageLoading(false)
                          }
                        }
                        img.onerror = () => {
                          setImageLoading(false)
                          setImageError(true)
                        }
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(proxyImageUrl, "_blank")}
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
            <CardDescription className="text-zinc-400">
              Submitted on {safeFormatDate(receipt.createdAt)}
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
                  <div className="space-y-2">
                    <label htmlFor="staffId" className="text-sm font-medium text-zinc-400">
                      Staff Member
                    </label>
                    {isArray(staffMembers) && staffMembers.length > 0 ? (
                      <Select
                        value={editedReceipt.staffId}
                        onValueChange={(value) => handleSelectChange("staffId", value)}
                      >
                        <SelectTrigger className="border-zinc-700 bg-zinc-800 text-zinc-100">
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-700 bg-zinc-800 text-zinc-100">
                          {staffMembers.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name} ({staff.role || "No role"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="staffId"
                        name="staffId"
                        value={editedReceipt.staffId}
                        onChange={handleInputChange}
                        className="border-zinc-700 bg-zinc-800 text-zinc-100"
                        placeholder="Staff ID"
                      />
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold text-zinc-100">{receipt.vendor}</h3>
                    <span className="text-lg font-bold text-zinc-100">{formatCurrency(receipt.amount)}</span>
                  </div>
                  <div className="text-sm text-zinc-400">Purchase Date: {safeFormatDate(receipt.date)}</div>
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
                  disabled={isSubmitting || isEditing}
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
                  onValueChange={(value) => handlePaymentUpdate(value === "paid")}
                  disabled={isSubmitting || isEditing}
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
