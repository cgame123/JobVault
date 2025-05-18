import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    console.log("🔔 Twilio webhook triggered")

    // Parse the form data from Twilio
    const formData = await req.formData()

    // Log all form data for debugging
    console.log("📋 Form data received from Twilio:")
    const data: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
      data[key] = value
    }

    // Get the sender's phone number
    const from = formData.get("From") as string
    console.log("📱 Message from:", from)

    // Get the image URL from the MediaUrl0 parameter
    const mediaUrl = formData.get("MediaUrl0") as string
    console.log("🖼️ Media URL:", mediaUrl)

    // Get the number of media items
    const numMedia = formData.get("NumMedia") as string
    console.log("📊 Number of media items:", numMedia)

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

    // Try to fetch the image to verify we can access it
    console.log("🔍 Attempting to fetch the image...")
    try {
      const imageResponse = await fetch(mediaUrl)
      if (imageResponse.ok) {
        console.log("✅ Successfully fetched the image")
        // Get content type and size for debugging
        const contentType = imageResponse.headers.get("content-type")
        const contentLength = imageResponse.headers.get("content-length")
        console.log(`📝 Image details - Type: ${contentType}, Size: ${contentLength} bytes`)
      } else {
        console.log("⚠️ Could not fetch image:", imageResponse.status, imageResponse.statusText)
      }
    } catch (fetchError) {
      console.error("❌ Error fetching image:", fetchError)
    }

    // Return a success response
    return NextResponse.json(
      {
        success: true,
        message: "Message received successfully",
        data: {
          from,
          mediaUrl,
          numMedia,
        },
      },
      { status: 200 },
    )
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
