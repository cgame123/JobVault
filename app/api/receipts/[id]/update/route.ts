import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a new Supabase client for this request
// This ensures we have a fresh client for each request
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log(`Updating receipt with ID: ${id}`)

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error("Failed to parse request body:", e)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    console.log("Request body:", body)

    // Extract and validate fields
    const { vendor, amount, date } = body

    if (!vendor || vendor.trim() === "") {
      return NextResponse.json({ error: "Vendor is required" }, { status: 400 })
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    // Update receipt in database
    const { data, error } = await supabase
      .from("receipts")
      .update({
        vendor: vendor.trim(),
        amount: numAmount,
        date,
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Unhandled error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
