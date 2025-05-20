import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Get the URL from the query parameters
    const url = req.nextUrl.searchParams.get("url")
    const download = req.nextUrl.searchParams.get("download") === "true"

    if (!url) {
      console.error("Missing URL parameter")
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    console.log("Image proxy request for URL:", url)

    // For placeholder SVG, return a simple SVG
    if (url.includes("/placeholder.svg")) {
      console.log("Returning placeholder SVG")
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>`

      return new NextResponse(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400",
        },
      })
    }

    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      console.error("Twilio credentials not configured")
      return NextResponse.json(
        {
          error: "Twilio credentials not configured",
          accountSidExists: !!accountSid,
          authTokenExists: !!authToken,
        },
        { status: 500 },
      )
    }

    console.log("Fetching image from URL:", url)

    // Fetch the image with authentication if it's a Twilio URL
    const headers: HeadersInit = {}
    if (url.includes("twilio.com")) {
      headers.Authorization = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`
      console.log("Using Twilio authentication")
    }

    // Fetch the image
    const response = await fetch(url, { headers })

    if (!response.ok) {
      console.error("Failed to fetch image:", response.status, response.statusText)
      return NextResponse.json(
        {
          error: `Failed to fetch image: ${response.status} ${response.statusText}`,
          url: url,
        },
        { status: response.status },
      )
    }

    // Get the image data and content type
    const imageData = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "application/octet-stream"

    console.log("Image fetched successfully:", {
      size: imageData.byteLength,
      contentType,
    })

    // Create response with the image data
    const imageResponse = new NextResponse(imageData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "Access-Control-Allow-Origin": "*", // Allow cross-origin requests
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
    return NextResponse.json(
      {
        error: "Failed to proxy image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
