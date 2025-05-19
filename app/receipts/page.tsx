import { ReceiptTable } from "@/components/receipt-table"
import { ReceiptFilters } from "@/components/receipt-filters"
import { supabase } from "@/lib/supabase"
import type { Receipt } from "@/lib/types"
import { RefreshButton } from "@/components/refresh-button"

// Disable caching for this route
export const dynamic = "force-dynamic"
export const revalidate = 0

// Function to fetch staff members for filter
async function getStaffMembers() {
  const { data, error } = await supabase.from("staff").select("id, name").order("name")

  if (error) {
    console.error("Error fetching staff members:", error)
    return []
  }

  return data
}

// Function to fetch unique properties for filter
async function getProperties() {
  const { data, error } = await supabase.from("staff").select("property").not("property", "is", null)

  if (error) {
    console.error("Error fetching properties:", error)
    return []
  }

  // Extract unique properties
  const properties = [...new Set(data.map((item) => item.property).filter(Boolean))]
  return properties
}

// Function to fetch receipts from Supabase with staff information
async function getReceipts(searchParams: {
  property?: string
  staff?: string
  status?: string
  payment?: string
  dateFrom?: string
  dateTo?: string
  sort?: string
}): Promise<Receipt[]> {
  try {
    console.log("Search params:", searchParams) // Debug log

    // Build the base query
    let query = supabase.from("receipts").select(`
        id,
        vendor,
        amount,
        date,
        phone_number,
        staff_id,
        staff_name,
        image_url,
        created_at,
        status,
        paid,
        staff:staff_id (
          id,
          name,
          property
        )
      `)

    // Apply property filter if provided
    if (searchParams.property) {
      // First get staff IDs for this property
      const { data: staffData } = await supabase.from("staff").select("id").eq("property", searchParams.property)

      if (staffData && staffData.length > 0) {
        const staffIds = staffData.map((staff) => staff.id)
        query = query.in("staff_id", staffIds)
      } else {
        return [] // No staff for this property, return empty
      }
    }

    // Apply staff filter if provided
    if (searchParams.staff) {
      query = query.eq("staff_id", searchParams.staff)
    }

    // Apply status filter if provided - UPDATED to use explicit approach
    if (searchParams.status) {
      // Explicitly check for each status value
      if (searchParams.status === "processing") {
        // For processing, include both explicit "processing" and null values
        query = query.or("status.eq.processing,status.is.null")
      } else if (searchParams.status === "approved") {
        query = query.eq("status", "approved")
      } else if (searchParams.status === "rejected") {
        query = query.eq("status", "rejected")
      } else if (searchParams.status === "duplicate") {
        query = query.eq("status", "duplicate")
      }
    }

    // Apply payment status filter if provided
    if (searchParams.payment === "paid") {
      query = query.eq("paid", true)
    } else if (searchParams.payment === "pending") {
      // For pending, include both explicit false and null values
      query = query.or("paid.eq.false,paid.is.null")
    }

    // Apply date range filters if provided
    if (searchParams.dateFrom) {
      query = query.gte("date", searchParams.dateFrom)
    }

    if (searchParams.dateTo) {
      query = query.lte("date", searchParams.dateTo)
    }

    // Apply sorting
    const sort = searchParams.sort || "date-desc"
    const [field, direction] = sort.split("-")

    switch (field) {
      case "date":
        query = query.order("date", { ascending: direction === "asc" })
        break
      case "amount":
        query = query.order("amount", { ascending: direction === "asc" })
        break
      case "vendor":
        query = query.order("vendor", { ascending: direction === "asc" })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    // Execute the query
    const { data, error } = await query

    if (error) {
      console.error("Error fetching receipts:", error)
      return []
    }

    console.log("Query results:", data) // Debug log

    // Map the results to our Receipt type
    return data.map((row) => ({
      id: row.id,
      vendor: row.vendor,
      amount: Number(row.amount),
      date: row.date,
      phoneNumber: row.phone_number,
      staffId: row.staff_id,
      staffName: row.staff_name || (row.staff ? row.staff.name : null),
      property: row.staff ? row.staff.property : null,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      status: row.status || "processing", // Default to processing if null
      paid: row.paid || false, // Default to false if null
    }))
  } catch (error) {
    console.error("Error in getReceipts:", error)
    return []
  }
}

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: {
    property?: string
    staff?: string
    status?: string
    payment?: string
    dateFrom?: string
    dateTo?: string
    sort?: string
  }
}) {
  // Fetch filter options
  const staffMembers = await getStaffMembers()
  const properties = await getProperties()

  // Fetch receipts with filters
  const receipts = await getReceipts(searchParams)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Receipts</h1>
          <p className="text-zinc-400">View and manage all receipt submissions.</p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
        </div>
      </div>

      <div className="mt-6">
        <ReceiptFilters properties={properties} staffMembers={staffMembers} />
      </div>

      <div className="mt-4">
        <p className="text-sm text-zinc-400 mb-2">
          Showing {receipts.length} receipt{receipts.length !== 1 ? "s" : ""}
        </p>
        <ReceiptTable receipts={receipts} />
      </div>
    </div>
  )
}
