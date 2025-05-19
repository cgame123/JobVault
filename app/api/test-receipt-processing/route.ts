import { NextResponse } from "next/server"
import { processReceiptImage } from "@/lib/receipt-processor"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const imageUrl = searchParams.get("imageUrl")
    const messageText = searchParams.get("text") || ""

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing 'imageUrl' parameter",
        },
        { status: 400 },
      )
    }

    // Process the receipt image
    console.log("Testing receipt processing with image:", imageUrl)
    const receiptData = await processReceiptImage(imageUrl, messageText)

    return NextResponse.json({
      success: true,
      message: "Receipt processed successfully",
      data: receiptData,
    })
  } catch (error) {
    console.error("Error processing receipt:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error processing receipt",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
