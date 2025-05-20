import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Get the URL from the query parameters
    const url = req.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    console.log("Testing image URL:", url)

    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      return NextResponse.json(
        {
          error: "Twilio credentials not configured",
          accountSidExists: !!accountSid,
          authTokenExists: !!authToken,
        },
        { status: 500 },
      )
    }

    // Prepare headers based on URL
    const headers: HeadersInit = {}
    if (url.includes("twilio.com")) {
      headers.Authorization = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`
      console.log("Using Twilio authentication for test")
    }

    // Fetch the image with a HEAD request first to check if it exists
    const headResponse = await fetch(url, {
      method: "HEAD",
      headers,
    })

    if (!headResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Image not accessible: ${headResponse.status} ${headResponse.statusText}`,
          status: headResponse.status,
          statusText: headResponse.statusText,
          url,
        },
        { status: 200 },
      ) // Return 200 so we can show the error to the user
    }

    // Now try to fetch the actual content
    const response = await fetch(url, { headers })

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch image content: ${response.status} ${response.statusText}`,
          status: response.status,
          statusText: response.statusText,
          url,
        },
        { status: 200 },
      )
    }

    // Get basic info about the image
    const contentType = response.headers.get("content-type") || "unknown"
    const contentLength = response.headers.get("content-length") || "unknown"

    // Try to get a small part of the image to confirm it's readable
    const buffer = await response.arrayBuffer()

    return NextResponse.json({
      success: true,
      message: `Image is accessible (${contentType}, ${formatBytes(Number(contentLength))})`,
      contentType,
      contentLength,
      url,
      sizeBytes: buffer.byteLength,
    })
  } catch (error) {
    console.error("Error testing image:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 200 },
    ) // Return 200 so we can show the error to the user
  }
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0 || isNaN(bytes)) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}
