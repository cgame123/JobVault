import { NextResponse } from "next/server"
import { processReceiptImage } from "@/lib/receipt-processor"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const imageUrl = searchParams.get("imageUrl")

    // If no image URL is provided, use one of the sample receipts from the project
    const sampleImageUrl =
      imageUrl ||
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/home-depot-receipt-MDClilwcaMC7elv9FyaHRZ9buOu03E.png" // Home Depot receipt

    console.log("Testing receipt extraction with image:", sampleImageUrl)

    // Process the receipt image
    const receiptData = await processReceiptImage(sampleImageUrl)

    return NextResponse.json({
      success: true,
      message: "Receipt processed successfully",
      data: receiptData,
      imageUsed: sampleImageUrl,
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
