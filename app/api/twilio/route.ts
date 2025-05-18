import { type NextRequest, NextResponse } from "next/server"
import { processReceiptImage } from "@/lib/receipt-processor"

export async function POST(req: NextRequest) {
  try {
    // Parse the form data from Twilio
    const formData = await req.formData()

    // Get the sender's phone number
    const from = formData.get("From") as string

    // Get the image URL from the MediaUrl0 parameter
    const mediaUrl = formData.get("MediaUrl0") as string

    if (!mediaUrl) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Process the receipt image
    const receiptData = await processReceiptImage(mediaUrl)

    // Store the receipt data in the database
    // This would be implemented with your database of choice

    // Return a success response
    return NextResponse.json({ success: true, message: "Receipt processed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error processing receipt:", error)
    return NextResponse.json({ error: "Failed to process receipt" }, { status: 500 })
  }
}
