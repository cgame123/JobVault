"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { ArrowDownAZ, ArrowUpAZ, CalendarIcon, Filter, SortAsc, SortDesc } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ReceiptFiltersProps {
  properties: string[]
  staffMembers: { id: string; name: string }[]
}

export function ReceiptFilters({ properties, staffMembers }: ReceiptFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const currentProperty = searchParams.get("property") || ""
  const currentStaff = searchParams.get("staff") || ""
  const currentDateFrom = searchParams.get("dateFrom") || ""
  const currentDateTo = searchParams.get("dateTo") || ""
  const currentSort = searchParams.get("sort") || "date-desc"

  // State for date picker
  const [dateFrom, setDateFrom] = useState<Date | undefined>(currentDateFrom ? new Date(currentDateFrom) : undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(currentDateTo ? new Date(currentDateTo) : undefined)

  // Apply filters
  const applyFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update or remove each filter parameter
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/receipts?${params.toString()}`)
  }

  // Apply sort
  const applySort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", sort)
    router.push(`/receipts?${params.toString()}`)
  }

  // Clear all filters
  const clearFilters = () => {
    router.push("/receipts")
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  // Apply date filter when dates change
  useEffect(() => {
    if (dateFrom || dateTo) {
      const filters: Record<string, string> = {}
      if (dateFrom) {
        filters.dateFrom = format(dateFrom, "yyyy-MM-dd")
      }
      if (dateTo) {
        filters.dateTo = format(dateTo, "yyyy-MM-dd")
      }
      applyFilters(filters)
    }
  }, [dateFrom, dateTo])

  // Count active filters
  const activeFilterCount = [currentProperty, currentStaff, currentDateFrom, currentDateTo].filter(Boolean).length

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Property Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          >
            <Filter className="mr-2 h-3.5 w-3.5" />
            Property
            {currentProperty && (
              <span className="ml-1 rounded-full bg-zinc-700 px-1.5 py-0.5 text-xs">{currentProperty}</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100">
          <DropdownMenuLabel>Filter by Property</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
            {properties.map((property) => (
              <DropdownMenuItem
                key={property}
                className={cn(
                  "cursor-pointer hover:bg-zinc-800",
                  currentProperty === property && "bg-zinc-800 font-medium",
                )}
                onClick={() => applyFilters({ property })}
              >
                {property}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Staff Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          >
            <Filter className="mr-2 h-3.5 w-3.5" />
            Staff
            {currentStaff && (
              <span className="ml-1 rounded-full bg-zinc-700 px-1.5 py-0.5 text-xs">
                {staffMembers.find((s) => s.id === currentStaff)?.name || currentStaff}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100">
          <DropdownMenuLabel>Filter by Staff</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
            {staffMembers.map((staff) => (
              <DropdownMenuItem
                key={staff.id}
                className={cn(
                  "cursor-pointer hover:bg-zinc-800",
                  currentStaff === staff.id && "bg-zinc-800 font-medium",
                )}
                onClick={() => applyFilters({ staff: staff.id })}
              >
                {staff.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            Date
            {(currentDateFrom || currentDateTo) && (
              <span className="ml-1 rounded-full bg-zinc-700 px-1.5 py-0.5 text-xs">
                {currentDateFrom && currentDateTo
                  ? `${format(new Date(currentDateFrom), "MM/dd")} - ${format(new Date(currentDateTo), "MM/dd")}`
                  : currentDateFrom
                    ? `From ${format(new Date(currentDateFrom), "MM/dd")}`
                    : `To ${format(new Date(currentDateTo), "MM/dd")}`}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-zinc-800 bg-zinc-900 text-zinc-100">
          <div className="p-3">
            <div className="space-y-2">
              <div className="grid gap-2">
                <Label htmlFor="date-from" className="text-xs text-zinc-400">
                  From
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-from"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left font-normal border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700",
                        !dateFrom && "text-zinc-500",
                      )}
                    >
                      {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-zinc-800 bg-zinc-900">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date-to" className="text-xs text-zinc-400">
                  To
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-to"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left font-normal border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700",
                        !dateTo && "text-zinc-500",
                      )}
                    >
                      {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-zinc-800 bg-zinc-900">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Sort Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          >
            {currentSort.includes("asc") ? (
              <SortAsc className="mr-2 h-3.5 w-3.5" />
            ) : (
              <SortDesc className="mr-2 h-3.5 w-3.5" />
            )}
            Sort
            <span className="ml-1 rounded-full bg-zinc-700 px-1.5 py-0.5 text-xs">
              {currentSort.split("-")[0].charAt(0).toUpperCase() + currentSort.split("-")[0].slice(1)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100">
          <DropdownMenuLabel>Sort Receipts</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            className={cn("cursor-pointer hover:bg-zinc-800", currentSort === "date-desc" && "bg-zinc-800 font-medium")}
            onClick={() => applySort("date-desc")}
          >
            <SortDesc className="mr-2 h-4 w-4" /> Date (Newest first)
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn("cursor-pointer hover:bg-zinc-800", currentSort === "date-asc" && "bg-zinc-800 font-medium")}
            onClick={() => applySort("date-asc")}
          >
            <SortAsc className="mr-2 h-4 w-4" /> Date (Oldest first)
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              "cursor-pointer hover:bg-zinc-800",
              currentSort === "amount-desc" && "bg-zinc-800 font-medium",
            )}
            onClick={() => applySort("amount-desc")}
          >
            <SortDesc className="mr-2 h-4 w-4" /> Amount (Highest first)
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              "cursor-pointer hover:bg-zinc-800",
              currentSort === "amount-asc" && "bg-zinc-800 font-medium",
            )}
            onClick={() => applySort("amount-asc")}
          >
            <SortAsc className="mr-2 h-4 w-4" /> Amount (Lowest first)
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              "cursor-pointer hover:bg-zinc-800",
              currentSort === "vendor-asc" && "bg-zinc-800 font-medium",
            )}
            onClick={() => applySort("vendor-asc")}
          >
            <ArrowDownAZ className="mr-2 h-4 w-4" /> Vendor (A-Z)
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              "cursor-pointer hover:bg-zinc-800",
              currentSort === "vendor-desc" && "bg-zinc-800 font-medium",
            )}
            onClick={() => applySort("vendor-desc")}
          >
            <ArrowUpAZ className="mr-2 h-4 w-4" /> Vendor (Z-A)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters Button */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          Clear filters ({activeFilterCount})
        </Button>
      )}
    </div>
  )
}
