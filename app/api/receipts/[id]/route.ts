import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Create a new Supabase client for this request
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    // Get the receipt ID from the URL params
    const id = params.id

    console.log(`Fetching receipt with ID: ${id}`)

    // Fetch the receipt from Supabase
    const { data, error } = await supabase
      .from("receipts")
      .select(`
        *,
        staff:staff_id (
          name,
          phone_number,
          role,
          property
        )
      `)
      .eq("id", id)
      .single()

    // Handle errors
    if (error) {
      console.error("Error fetching receipt:", error)
      return NextResponse.json({ error: "Failed to fetch receipt" }, { status: 500 })
    }

    // Handle not found
    if (!data) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 })
    }

    // Format the receipt data
    const formattedReceipt = {
      id: data.id,
      vendor: data.vendor || "",
      amount: Number(data.amount) || 0,
      date: data.date || new Date().toISOString().split("T")[0],
      phoneNumber: data.phone_number,
      staffId: data.staff_id,
      staffName: data.staff?.name || data.staff_name || "Unknown",
      staffPhone: data.staff?.phone_number,
      staffRole: data.staff?.role,
      property: data.staff?.property || "Unassigned",
      imageUrl: data.image_url,
      createdAt: data.created_at,
      status: data.status || "processing",
      paid: data.paid || false,
    }

    // Return the receipt data
    return NextResponse.json(formattedReceipt)
  } catch (error) {
    console.error("Unhandled error in receipt API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
