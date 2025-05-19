import { NextResponse } from "next/server"

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

// Hardcoded sample data for testing
const SAMPLE_DATA = {
  "home-depot": {
    vendor: "Home Depot",
    amount: 127.94,
    date: "2023-04-15",
  },
  "ace-hardware": {
    vendor: "Ace Hardware",
    amount: 85.47,
    date: "2023-05-20",
  },
  walmart: {
    vendor: "Walmart",
    amount: 63.29,
    date: "2023-06-10",
  },
  target: {
    vendor: "Target",
    amount: 42.18,
    date: "2023-07-05",
  },
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sample = searchParams.get("sample") || "home-depot"

    // Get the sample image URL
    const imageUrl = SAMPLE_RECEIPTS[sample as keyof typeof SAMPLE_RECEIPTS] || SAMPLE_RECEIPTS["home-depot"]

    // Get the hardcoded data for this sample
    const receiptData = SAMPLE_DATA[sample as keyof typeof SAMPLE_DATA] || SAMPLE_DATA["home-depot"]

    // For a real implementation, we would use AI to extract this data
    // But for now, we'll use the hardcoded data to demonstrate the concept

    console.log("Using sample data for:", sample)

    return NextResponse.json({
      success: true,
      message: "Receipt processed successfully",
      data: receiptData,
      imageUsed: imageUrl,
      note: "This is using hardcoded sample data for demonstration purposes",
    })
  } catch (error) {
    console.error("Error in receipt simple endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error in receipt simple endpoint",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
