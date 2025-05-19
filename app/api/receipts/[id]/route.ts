import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log(`🗑️ Deleting receipt with ID: ${id}`)

    // Delete the receipt from Supabase
    const { error } = await supabase.from("receipts").delete().eq("id", id)

    if (error) {
      console.error("❌ Error deleting receipt:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete receipt",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`✅ Receipt ${id} deleted successfully`)
    return NextResponse.json({
      success: true,
      message: "Receipt deleted successfully",
    })
  } catch (error) {
    console.error("❌ Error deleting receipt:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete receipt",
      },
      { status: 500 },
    )
  }
}
