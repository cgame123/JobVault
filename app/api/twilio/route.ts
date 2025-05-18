import { type NextRequest, NextResponse } from "next/server"
import { getMediaContent } from "@/lib/twilio-client"
import { storeReceipt } from "@/lib/receipt-storage"
import { getStaffMemberByPhoneNumber } from "@/lib/staff-storage"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    console.log("🔔 Twilio webhook triggered")

    // Parse the form data from Twilio
    const formData = await req.formData()

    // Log key information
    const from = formData.get("From") as string
    const numMedia = formData.get("NumMedia") as string
    const messageSid = formData.get("MessageSid") as string
    const mediaUrl = formData.get("MediaUrl0") as string
    const body = formData.get("Body") as string

    console.log("📱 Message from:", from)
    console.log("📝 Message body:", body)
    console.log("📊 Number of media items:", numMedia)
    console.log("🆔 Message SID:", messageSid)
    console.log("🖼️ Original Media URL:", mediaUrl)

    // Check if we have an image
    if (!mediaUrl || numMedia === "0") {
      console.log("ℹ️ No image was provided in the message")
      return NextResponse.json(
        {
          success: true,
          message: "Message received, but no image was found",
        },
        { status: 200 },
      )
    }

    try {
      // Fetch the image using authenticated request
      console.log("🔄 Fetching image from Twilio...")
      const imageBuffer = await getMediaContent(mediaUrl)
      console.log("✅ Successfully downloaded image, size:", imageBuffer.length, "bytes")

      // Try to find a staff member with this phone number
      const staffMember = await getStaffMemberByPhoneNumber(from)

      // For now, create a basic receipt with mock data
      // In the future, this would be replaced with AI processing
      const receiptData = {
        id: uuidv4(),
        vendor: body || "Unknown Vendor", // Use the message body as vendor name if available
        amount: 0, // Placeholder
        date: new Date().toISOString().split("T")[0], // Today's date
        phoneNumber: from,
        staffId: staffMember?.id,
        staffName: staffMember?.name,
        imageUrl: mediaUrl, // Store the Twilio URL for now
        createdAt: new Date().toISOString(),
      }

      // Store the receipt in Supabase
      const storedReceipt = await storeReceipt(receiptData)
      console.log("💾 Receipt stored with ID:", storedReceipt.id)

      // Return a success response
      return NextResponse.json(
        {
          success: true,
          message: "Receipt received and stored successfully",
          data: {
            receiptId: storedReceipt.id,
            from,
            messageSid,
          },
        },
        { status: 200 },
      )
    } catch (mediaError) {
      console.error("❌ Error handling media:", mediaError)
      return NextResponse.json(
        {
          success: false,
          message: "Error processing media, but message was received",
          error: String(mediaError),
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("❌ Error in Twilio webhook:", error)

    // Always return 200 to Twilio to prevent retries
    return NextResponse.json(
      {
        success: false,
        message: "Error processing webhook, but message was received",
        error: String(error),
      },
      { status: 200 },
    )
  }
}
