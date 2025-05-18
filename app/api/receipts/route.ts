import { NextResponse } from "next/server"
import { getAllReceipts } from "@/lib/receipt-storage"

export async function GET() {
  try {
    // Get all receipts from Supabase
    const receipts = await getAllReceipts()

    // Return the receipts as JSON
    return NextResponse.json({
      success: true,
      data: receipts,
    })
  } catch (error) {
    console.error("Error fetching receipts:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch receipts",
      },
      { status: 500 },
    )
  }
}
