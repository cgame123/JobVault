import { type NextRequest, NextResponse } from "next/server"
import { getMediaContent } from "@/lib/twilio-client"
import { supabase } from "@/lib/supabase"
import { processReceiptImage } from "@/lib/receipt-processor"
import { sendConfirmationSMS } from "@/lib/twilio-sender"
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

      // Send a response asking for an image
      await sendConfirmationSMS(from, "Please send a photo of your receipt along with your message.")

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
      const { data: staffData } = await supabase
        .from("staff")
        .select("id, name, property")
        .eq("phone_number", from)
        .maybeSingle()

      // Process the receipt image with AI
      console.log("🧠 Processing receipt with AI...")
      const receiptData = await processReceiptImage(mediaUrl, body)
      console.log("✅ AI processing complete:", receiptData)

      // Generate a unique ID for the receipt
      const receiptId = uuidv4()

      // Insert the receipt directly into Supabase
      const { error: insertError } = await supabase.from("receipts").insert({
        id: receiptId,
        vendor: receiptData.vendor,
        amount: receiptData.amount,
        date: receiptData.date,
        phone_number: from,
        staff_id: staffData?.id || null,
        staff_name: staffData?.name || null,
        property: staffData?.property || null,
        image_url: mediaUrl,
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("❌ Error inserting receipt into Supabase:", insertError)

        // Send error notification
        await sendConfirmationSMS(from, "There was an error processing your receipt. Please try again later.")

        return NextResponse.json(
          {
            success: false,
            message: "Failed to store receipt in database",
            error: insertError.message,
          },
          { status: 200 }, // Still return 200 to Twilio
        )
      }

      console.log("💾 Receipt stored with ID:", receiptId)

      // Send confirmation SMS
      const staffName = staffData?.name ? ` ${staffData.name}` : ""
      const propertyInfo = staffData?.property ? ` for ${staffData.property}` : ""
      const amountText = receiptData.amount > 0 ? ` for ${formatCurrency(receiptData.amount)}` : ""

      await sendConfirmationSMS(
        from,
        `Thanks${staffName}! Your receipt from ${receiptData.vendor}${amountText}${propertyInfo} has been received and processed. Receipt ID: ${receiptId.substring(0, 8)}`,
      )

      // Return a success response
      return NextResponse.json(
        {
          success: true,
          message: "Receipt received and stored successfully",
          data: {
            receiptId,
            from,
            messageSid,
            receiptData,
          },
        },
        { status: 200 },
      )
    } catch (mediaError) {
      console.error("❌ Error handling media:", mediaError)

      // Send error notification
      await sendConfirmationSMS(
        from,
        "There was an error processing your receipt image. Please try again with a clearer photo.",
      )

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

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
