"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { MoreVertical, Trash, Edit } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReceiptActionsProps {
  receipt: {
    id: string
    vendor: string
    status?: string
    paid?: boolean
  }
}

export function ReceiptActions({ receipt }: ReceiptActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(receipt.status || "processing")
  const [paid, setPaid] = useState(receipt.paid || false)
  const router = useRouter()
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

  const handleDelete = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/receipts/${receipt.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete receipt")
      }

      toast({
        title: "Receipt deleted",
        description: `Receipt from ${receipt.vendor} has been deleted successfully.`,
      })

      // Redirect to dashboard
      router.push("/")
    } catch (error) {
      console.error("Error deleting receipt:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete receipt",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsDeleting(false)
    }
  }

  const handleUpdate = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/receipts/${receipt.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, paid }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update receipt")
      }

      toast({
        title: "Receipt updated",
        description: `Receipt from ${receipt.vendor} has been updated successfully.`,
      })

      // Close dialog and refresh page
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating receipt:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update receipt",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-100">
          <DropdownMenuItem onClick={() => setIsEditing(true)} className="focus:bg-zinc-800 focus:text-zinc-100">
            <Edit className="mr-2 h-4 w-4" />
            Edit Receipt
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleting(true)}
            className="text-red-400 focus:bg-zinc-800 focus:text-red-400"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Receipt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Receipt</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update the status and payment information for this receipt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right text-zinc-400">
                Status
              </label>
              <div className="col-span-3">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className={`w-full border ${getStatusBadgeClass(status)}`}>
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
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="paid" className="text-right text-zinc-400">
                Payment
              </label>
              <div className="col-span-3">
                <Select value={paid ? "paid" : "unpaid"} onValueChange={(value) => setPaid(value === "paid")}>
                  <SelectTrigger className={`w-full border ${getPaymentBadgeClass(paid)}`}>
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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={(open) => !open && setIsDeleting(false)}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Receipt</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-300">
              Are you sure you want to delete this receipt from <span className="font-semibold">{receipt.vendor}</span>?
              This action cannot be undone.
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
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
