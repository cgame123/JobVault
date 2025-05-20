import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const receiptId = params.id

    if (!receiptId) {
      return NextResponse.json({ error: "Receipt ID is required" }, { status: 400 })
    }

    // Get the image URL from the request body
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Create a Supabase client
    const supabase = createClient()

    // Update the receipt with the new image URL
    const { data, error } = await supabase.from("receipts").update({ imageUrl }).eq("id", receiptId).select()

    if (error) {
      console.error("Error updating receipt image:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Receipt image updated successfully",
      data: data[0],
    })
  } catch (error) {
    console.error("Error in upload-image route:", error)
    return NextResponse.json(
      {
        error: "Failed to update receipt image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
