import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Get the message and media SIDs from the query parameters
    const messageSid = req.nextUrl.searchParams.get("messageSid")
    const mediaSid = req.nextUrl.searchParams.get("mediaSid")
    const download = req.nextUrl.searchParams.get("download") === "true"

    if (!messageSid || !mediaSid) {
      return NextResponse.json({ error: "Message SID and Media SID are required" }, { status: 400 })
    }

    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: "Twilio credentials not configured" }, { status: 500 })
    }

    // Construct the Twilio media URL
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${messageSid}/Media/${mediaSid}`

    console.log("Fetching Twilio media from:", url)

    // Fetch the media with authentication
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      },
    })

    if (!response.ok) {
      console.error("Failed to fetch Twilio media:", response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to fetch Twilio media: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    // Get the media data and content type
    const mediaData = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "application/octet-stream"

    console.log("Twilio media fetched successfully:", {
      size: mediaData.byteLength,
      contentType,
    })

    // Create response with the media data
    const mediaResponse = new NextResponse(mediaData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "Access-Control-Allow-Origin": "*", // Allow cross-origin requests
      },
    })

    // If download is requested, add Content-Disposition header
    if (download) {
      mediaResponse.headers.set(
        "Content-Disposition",
        `attachment; filename="receipt-${new Date().toISOString().split("T")[0]}.jpg"`,
      )
    }

    return mediaResponse
  } catch (error) {
    console.error("Error in Twilio media endpoint:", error)
    return NextResponse.json({ error: "Failed to fetch Twilio media" }, { status: 500 })
  }
}
