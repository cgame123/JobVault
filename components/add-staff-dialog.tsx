"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface AddStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddStaffDialog({ open, onOpenChange }: AddStaffDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    role: "",
    property: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate phone number format
      const phoneRegex = /^\+?[1-9]\d{1,14}$/
      if (!phoneRegex.test(formData.phoneNumber)) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid phone number in E.164 format (e.g., +12345678901)",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Submit the form data to the API
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create staff member")
      }

      // Show success message
      toast({
        title: "Staff member created",
        description: `${formData.name} has been added successfully.`,
      })

      // Reset form and close dialog
      setFormData({
        name: "",
        phoneNumber: "",
        role: "",
        property: "",
      })
      onOpenChange(false)

      // Refresh the page to show the new staff member
      router.refresh()
    } catch (error) {
      console.error("Error creating staff member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create staff member",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create a new staff member to associate with receipts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-zinc-400">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3 border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-zinc-600 focus:ring-zinc-600"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right text-zinc-400">
                Phone
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+12345678901"
                className="col-span-3 border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-zinc-600 focus:ring-zinc-600"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right text-zinc-400">
                Role
              </Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="col-span-3 border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-zinc-600 focus:ring-zinc-600"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="property" className="text-right text-zinc-400">
                Property
              </Label>
              <Input
                id="property"
                name="property"
                value={formData.property}
                onChange={handleChange}
                className="col-span-3 border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-zinc-600 focus:ring-zinc-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Staff"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
