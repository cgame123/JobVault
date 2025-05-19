import { NextResponse } from "next/server"
import { processReceiptWithAPI } from "@/lib/receipt-api"

// Sample receipt URLs from your project
const SAMPLE_RECEIPTS = {
  "home-depot":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/home-depot-receipt-MDClilwcaMC7elv9FyaHRZ9buOu03E.png",
  "ace-hardware":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/ace-hardware-receipt-JXnw7ccgpNJ5m64ptfQGSPFy3zpy20.png",
  walmart:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/walmart-receipt-j51a5vQ3zIRlUAcwOZ1GLBNZdO5xDp.png",
  target:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/target-receipt-fGfHrJHDW3UhNPZnNghaCRLWIphDbM.png",
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    let imageUrl = searchParams.get("imageUrl")
    const sample = searchParams.get("sample")

    // If a sample name is provided, use that sample receipt
    if (sample && SAMPLE_RECEIPTS[sample as keyof typeof SAMPLE_RECEIPTS]) {
      imageUrl = SAMPLE_RECEIPTS[sample as keyof typeof SAMPLE_RECEIPTS]
    }

    // If no image URL is provided, use the Home Depot receipt as default
    if (!imageUrl) {
      imageUrl = SAMPLE_RECEIPTS["home-depot"]
    }

    console.log("Testing receipt API extraction with image:", imageUrl)

    try {
      // Process the receipt with the API
      const receiptData = await processReceiptWithAPI(imageUrl)

      return NextResponse.json({
        success: true,
        message: "Receipt processed successfully with API",
        data: receiptData,
        imageUsed: imageUrl,
      })
    } catch (error) {
      console.error("Error processing with API:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error processing with API",
          error: String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in receipt API endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error in receipt API endpoint",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
