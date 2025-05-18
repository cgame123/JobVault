"use client"

import type React from "react"

import { useState } from "react"
import type { StaffMember } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface StaffTableProps {
  staffMembers: StaffMember[]
}

export function StaffTable({ staffMembers: initialStaffMembers }: StaffTableProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaffMembers)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    role: "",
    property: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleEdit = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setFormData({
      name: staff.name,
      phoneNumber: staff.phoneNumber,
      role: staff.role,
      property: staff.property || "",
    })
    setIsEditing(true)
  }

  const handleDelete = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setIsDeleting(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaff) return

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
      const response = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update staff member")
      }

      // Update the local state
      setStaffMembers((prev) =>
        prev.map((staff) =>
          staff.id === selectedStaff.id
            ? {
                ...staff,
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                role: formData.role,
                property: formData.property,
              }
            : staff,
        ),
      )

      // Show success message
      toast({
        title: "Staff member updated",
        description: `${formData.name} has been updated successfully.`,
      })

      // Close dialog
      setIsEditing(false)
      setSelectedStaff(null)

      // Refresh the page to show the updated staff member
      router.refresh()
    } catch (error) {
      console.error("Error updating staff member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update staff member",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return

    setIsSubmitting(true)

    try {
      // Submit the delete request to the API
      const response = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete staff member")
      }

      // Update the local state
      setStaffMembers((prev) => prev.filter((staff) => staff.id !== selectedStaff.id))

      // Show success message
      toast({
        title: "Staff member deleted",
        description: `${selectedStaff.name} has been deleted successfully.`,
      })

      // Close dialog
      setIsDeleting(false)
      setSelectedStaff(null)

      // Refresh the page to show the updated staff list
      router.refresh()
    } catch (error) {
      console.error("Error deleting staff member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete staff member",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-zinc-400">Name</TableHead>
              <TableHead className="text-zinc-400">Phone Number</TableHead>
              <TableHead className="text-zinc-400">Role</TableHead>
              <TableHead className="text-zinc-400">Property</TableHead>
              <TableHead className="text-right text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffMembers.length === 0 ? (
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableCell colSpan={5} className="h-24 text-center text-zinc-400">
                  No staff members found.
                </TableCell>
              </TableRow>
            ) : (
              staffMembers.map((staff) => (
                <TableRow key={staff.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-medium text-zinc-100">{staff.name}</TableCell>
                  <TableCell className="text-zinc-100">{staff.phoneNumber}</TableCell>
                  <TableCell className="text-zinc-100">{staff.role}</TableCell>
                  <TableCell className="text-zinc-100">{staff.property || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(staff)}
                      className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit staff</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(staff)}
                      className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete staff</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        {selectedStaff && (
          <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateSubmit}>
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
                  onClick={() => setIsEditing(false)}
                  className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={(open) => !open && setIsDeleting(false)}>
        {selectedStaff && (
          <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Staff Member</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-zinc-300">
                Are you sure you want to delete <span className="font-semibold">{selectedStaff.name}</span>? This action
                cannot be undone.
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
