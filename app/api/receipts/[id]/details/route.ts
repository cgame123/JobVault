import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { vendor, amount, date } = body

    // Validate required fields
    if (vendor === undefined && amount === undefined && date === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "No update data provided",
        },
        { status: 400 },
      )
    }

    // Build update object with only the fields that were provided
    const updateData: Record<string, any> = {}

    if (vendor !== undefined) {
      updateData.vendor = vendor
    }

    if (amount !== undefined) {
      // Validate amount is a number
      if (isNaN(amount)) {
        return NextResponse.json(
          {
            success: false,
            message: "Amount must be a number",
          },
          { status: 400 },
        )
      }
      updateData.amount = amount
    }

    if (date !== undefined) {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(date)) {
        return NextResponse.json(
          {
            success: false,
            message: "Date must be in YYYY-MM-DD format",
          },
          { status: 400 },
        )
      }
      updateData.date = date
    }

    // Update the receipt
    const { data, error } = await supabase.from("receipts").update(updateData).eq("id", id).select()

    if (error) {
      console.error("Error updating receipt details:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update receipt details",
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Receipt details updated successfully",
      data,
    })
  } catch (error) {
    console.error("Error updating receipt details:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error updating receipt details",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
