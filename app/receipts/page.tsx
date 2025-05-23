import { ReceiptTable } from "@/components/receipt-table"
import { ReceiptFilters } from "@/components/receipt-filters"
import { supabase } from "@/lib/supabase"
import type { Receipt } from "@/lib/types"
import { RefreshButton } from "@/components/refresh-button"

// Disable caching for this route
export const dynamic = "force-dynamic"
export const revalidate = 0

// Define the exact status values as they appear in the database
const STATUS_VALUES = {
  PROCESSING: "'Processing'",
  APPROVED: "'Approved'",
  REJECTED: "'Rejected'",
  DUPLICATE: "'Duplicate'",
}

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

    // Apply status filter if provided - UPDATED for exact database values with quotes
    if (searchParams.status) {
      // Remove any quotes from the status parameter to ensure consistent comparison
      const statusValue = searchParams.status.replace(/['"]/g, "")

      // Handle special case for Processing status
      if (statusValue === "Processing" || searchParams.status === STATUS_VALUES.PROCESSING) {
        // First get all receipts with explicit 'Processing' status
        const processingQuery = supabase.from("receipts").select("id").eq("status", "'Processing'")

        // Then get all receipts with null status
        const nullStatusQuery = supabase.from("receipts").select("id").is("status", null)

        // Execute both queries
        const [processingResult, nullStatusResult] = await Promise.all([processingQuery, nullStatusQuery])

        // Combine the IDs
        const processingIds = processingResult.data?.map((r) => r.id) || []
        const nullStatusIds = nullStatusResult.data?.map((r) => r.id) || []
        const combinedIds = [...processingIds, ...nullStatusIds]

        if (combinedIds.length > 0) {
          query = query.in("id", combinedIds)
        } else {
          return [] // No matching receipts
        }
      } else {
        // For other statuses, use the exact value with quotes
        query = query.eq("status", searchParams.status)
      }
    }

    // Apply payment status filter if provided - UPDATED for better cross-environment compatibility
    if (searchParams.payment === "paid") {
      query = query.eq("paid", true)
    } else if (searchParams.payment === "pending") {
      // Use the same approach as for status
      const unpaidQuery = supabase.from("receipts").select("id").eq("paid", false)

      const nullPaidQuery = supabase.from("receipts").select("id").is("paid", null)

      const [unpaidResult, nullPaidResult] = await Promise.all([unpaidQuery, nullPaidQuery])

      const unpaidIds = unpaidResult.data?.map((r) => r.id) || []
      const nullPaidIds = nullPaidResult.data?.map((r) => r.id) || []
      const combinedIds = [...unpaidIds, ...nullPaidIds]

      if (combinedIds.length > 0) {
        query = query.in("id", combinedIds)
      } else {
        return [] // No matching receipts
      }
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

    console.log(`Query returned ${data?.length || 0} receipts`) // Debug log

    // Map the results to our Receipt type
    return (data || []).map((row) => ({
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
      status: row.status || "'Processing'", // Default to 'Processing' (with quotes) if null
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
