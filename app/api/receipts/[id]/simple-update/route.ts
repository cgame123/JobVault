import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  console.log(`[API] Updating receipt with ID: ${params.id}`)

  // Create a new Supabase client for this request
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

  try {
    // Parse request body
    const body = await request.json()
    console.log("[API] Request body:", body)

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
      .eq("id", params.id)
      .select()

    if (error) {
      console.error("[API] Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[API] Update successful:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[API] Unhandled error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
