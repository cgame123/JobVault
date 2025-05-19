import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, paid } = body

    // Check if we're updating status or paid
    if (status !== undefined) {
      // Update the status
      const { data, error } = await supabase.from("receipts").update({ status }).eq("id", id).select()

      if (error) {
        console.error("Error updating receipt status:", error)
        return NextResponse.json(
          {
            success: false,
            message: "Failed to update receipt status",
            error: error.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Receipt status updated successfully",
        data,
      })
    } else if (paid !== undefined) {
      // Update the paid status
      const { data, error } = await supabase.from("receipts").update({ paid }).eq("id", id).select()

      if (error) {
        console.error("Error updating receipt payment status:", error)
        return NextResponse.json(
          {
            success: false,
            message: "Failed to update receipt payment status",
            error: error.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Receipt payment status updated successfully",
        data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "No status or paid field provided",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error updating receipt:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error updating receipt",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
