"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { useState } from "react"
import { AddStaffDialog } from "./add-staff-dialog"

export function StaffHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Staff Management</h1>
        <p className="text-zinc-400">Manage staff members in JobVault</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            type="search"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border-zinc-800 bg-zinc-900/50 pl-8 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700 md:w-[200px] lg:w-[300px]"
          />
        </div>
        <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <AddStaffDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  )
}
