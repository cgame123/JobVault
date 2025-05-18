import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Get the URL from the query parameters
    const url = req.nextUrl.searchParams.get("url")
    const download = req.nextUrl.searchParams.get("download") === "true"

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Check if this is a Twilio URL
    if (!url.includes("twilio.com")) {
      return NextResponse.json({ error: "Only Twilio URLs are supported" }, { status: 400 })
    }

    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: "Twilio credentials not configured" }, { status: 500 })
    }

    // Fetch the image with authentication
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    // Get the image data and content type
    const imageData = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "application/octet-stream"

    // Create response with the image data
    const imageResponse = new NextResponse(imageData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })

    // If download is requested, add Content-Disposition header
    if (download) {
      imageResponse.headers.set(
        "Content-Disposition",
        `attachment; filename="receipt-${new Date().toISOString().split("T")[0]}.jpg"`,
      )
    }

    return imageResponse
  } catch (error) {
    console.error("Error in image proxy:", error)
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 500 })
  }
}
