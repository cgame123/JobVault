import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log(`📝 Updating receipt details with ID: ${id}`)

    // Parse the request body
    let body
    try {
      body = await req.json()
      console.log("Request body:", body)
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 },
      )
    }

    const { vendor, amount, date } = body

    // Validate required fields
    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor name is required",
        },
        { status: 400 },
      )
    }

    // Convert amount to number and validate
    const numericAmount = Number(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount must be a positive number",
        },
        { status: 400 },
      )
    }

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: "Date is required",
        },
        { status: 400 },
      )
    }

    // Build update object
    const updateData = {
      vendor,
      amount: numericAmount,
      date,
    }

    console.log("Updating receipt with data:", updateData)

    // Update the receipt in Supabase
    try {
      const { data, error } = await supabase.from("receipts").update(updateData).eq("id", id).select()

      if (error) {
        console.error("❌ Error updating receipt details:", error)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update receipt details",
            details: error.message,
          },
          { status: 500 },
        )
      }

      if (!data || data.length === 0) {
        console.error("❌ No receipt found with ID:", id)
        return NextResponse.json(
          {
            success: false,
            error: "Receipt not found",
          },
          { status: 404 },
        )
      }

      console.log(`✅ Receipt ${id} details updated successfully:`, data[0])
      return NextResponse.json({
        success: true,
        message: "Receipt details updated successfully",
        data: data[0],
      })
    } catch (dbError) {
      console.error("❌ Database error updating receipt:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database error updating receipt",
          details: dbError instanceof Error ? dbError.message : "Unknown database error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Unhandled error updating receipt details:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update receipt details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
