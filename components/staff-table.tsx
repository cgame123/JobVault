"use client"

import { useState } from "react"
import type { StaffMember } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash } from "lucide-react"

interface StaffTableProps {
  staffMembers: StaffMember[]
}

export function StaffTable({ staffMembers }: StaffTableProps) {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setIsEditing(true)
  }

  const handleClose = () => {
    setSelectedStaff(null)
    setIsEditing(false)
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
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
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

      <Dialog open={isEditing} onOpenChange={(open) => !open && handleClose()}>
        {selectedStaff && (
          <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-zinc-400">
                  Name
                </Label>
                <Input
                  id="name"
                  defaultValue={selectedStaff.name}
                  className="col-span-3 border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-zinc-600 focus:ring-zinc-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right text-zinc-400">
                  Phone
                </Label>
                <Input
                  id="phone"
                  defaultValue={selectedStaff.phoneNumber}
                  className="col-span-3 border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-zinc-600 focus:ring-zinc-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right text-zinc-400">
                  Role
                </Label>
                <Input
                  id="role"
                  defaultValue={selectedStaff.role}
                  className="col-span-3 border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-zinc-600 focus:ring-zinc-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="property" className="text-right text-zinc-400">
                  Property
                </Label>
                <Input
                  id="property"
                  defaultValue={selectedStaff.property || ""}
                  className="col-span-3 border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-zinc-600 focus:ring-zinc-600"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
