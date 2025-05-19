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
  const currentStatus = searchParams.get("status") || ""
  const currentPaymentStatus = searchParams.get("payment") || ""
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

  // Clear all filters - UPDATED
  const clearFilters = () => {
    // Reset all filter states
    setDateFrom(undefined)
    setDateTo(undefined)

    // Use the router to navigate to the base path without any query parameters
    router.push("/receipts")

    // Force a refresh to ensure the page updates
    setTimeout(() => {
      window.location.href = "/receipts"
    }, 100)
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
  const activeFilterCount = [
    currentProperty,
    currentStaff,
    currentStatus,
    currentPaymentStatus,
    currentDateFrom,
    currentDateTo,
  ].filter(Boolean).length

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

  // Get payment status badge class
  const getPaymentBadgeClass = (paid: boolean) => {
    return paid ? "bg-green-900/30 text-green-300 border-green-800" : "bg-zinc-800/80 text-zinc-300 border-zinc-700"
  }

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

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          >
            <Filter className="mr-2 h-3.5 w-3.5" />
            Status
            {currentStatus && (
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${getStatusBadgeClass(currentStatus)}`}>
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className={cn(
                "cursor-pointer bg-blue-900/30 text-blue-300 hover:bg-blue-900/50 hover:text-blue-100",
                currentStatus === "processing" && "font-medium",
              )}
              onClick={() => applyFilters({ status: "processing" })}
            >
              Processing
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(
                "cursor-pointer bg-green-900/30 text-green-300 hover:bg-green-900/50 hover:text-green-100",
                currentStatus === "approved" && "font-medium",
              )}
              onClick={() => applyFilters({ status: "approved" })}
            >
              Approved
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(
                "cursor-pointer bg-red-900/30 text-red-300 hover:bg-red-900/50 hover:text-red-100",
                currentStatus === "rejected" && "font-medium",
              )}
              onClick={() => applyFilters({ status: "rejected" })}
            >
              Rejected
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(
                "cursor-pointer bg-purple-900/30 text-purple-300 hover:bg-purple-900/50 hover:text-purple-100",
                currentStatus === "duplicate" && "font-medium",
              )}
              onClick={() => applyFilters({ status: "duplicate" })}
            >
              Duplicate
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Payment Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          >
            <Filter className="mr-2 h-3.5 w-3.5" />
            Payment
            {currentPaymentStatus && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${getPaymentBadgeClass(currentPaymentStatus === "paid")}`}
              >
                {currentPaymentStatus === "paid" ? "Paid" : "Pending"}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100">
          <DropdownMenuLabel>Filter by Payment Status</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className={cn(
                "cursor-pointer bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100",
                currentPaymentStatus === "pending" && "font-medium",
              )}
              onClick={() => applyFilters({ payment: "pending" })}
            >
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(
                "cursor-pointer bg-green-900/30 text-green-300 hover:bg-green-900/50 hover:text-green-100",
                currentPaymentStatus === "paid" && "font-medium",
              )}
              onClick={() => applyFilters({ payment: "paid" })}
            >
              Paid
            </DropdownMenuItem>
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
