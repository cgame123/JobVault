import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Get search params from URL
    const { searchParams } = new URL(request.url)
    const property = searchParams.get("property")
    const staff = searchParams.get("staff")
    const status = searchParams.get("status")
    const payment = searchParams.get("payment")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const sort = searchParams.get("sort") || "date-desc"

    console.log("API Filter params:", { property, staff, status, payment, dateFrom, dateTo, sort })

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
    if (property) {
      // First get staff IDs for this property
      const { data: staffData } = await supabase.from("staff").select("id").eq("property", property)

      if (staffData && staffData.length > 0) {
        const staffIds = staffData.map((staff) => staff.id)
        query = query.in("staff_id", staffIds)
      } else {
        // No staff found for this property, return empty result
        return NextResponse.json({ receipts: [] })
      }
    }

    // Apply staff filter if provided
    if (staff) {
      query = query.eq("staff_id", staff)
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status)
    }

    // Apply payment status filter if provided
    if (payment === "paid") {
      query = query.eq("paid", true)
    } else if (payment === "pending") {
      query = query.eq("paid", false)
    }

    // Apply date range filters if provided
    if (dateFrom) {
      query = query.gte("date", dateFrom)
    }

    if (dateTo) {
      query = query.lte("date", dateTo)
    }

    // Apply sorting
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map the results to our Receipt type
    const receipts = data.map((row) => ({
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

    console.log(`API returning ${receipts.length} receipts`)
    return NextResponse.json({ receipts })
  } catch (error) {
    console.error("Error in filtered receipts API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
