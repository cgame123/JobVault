"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AddStaffDialog } from "@/components/add-staff-dialog"

export function StaffHeader() {
  const [isAddingStaff, setIsAddingStaff] = useState(false)

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Staff Management</h1>
        <p className="text-zinc-400">Manage staff members and their associated phone numbers.</p>
      </div>
      <Button onClick={() => setIsAddingStaff(true)} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Staff
      </Button>
      <AddStaffDialog open={isAddingStaff} onOpenChange={setIsAddingStaff} />
    </div>
  )
}
