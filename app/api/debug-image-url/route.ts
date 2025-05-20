import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    // Basic URL validation
    let isValidUrl = false
    try {
      new URL(url)
      isValidUrl = true
    } catch (e) {
      isValidUrl = false
    }

    // Check if it's a Twilio URL
    const isTwilioUrl = url.includes("twilio.com")

    // Get Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    let headResponse = null
    let contentType = null
    let contentLength = null
    let status = null
    let statusText = null
    let error = null

    // Try to fetch headers only to check if the URL is accessible
    try {
      const headers: HeadersInit = {}

      // Add authentication for Twilio URLs
      if (isTwilioUrl && accountSid && authToken) {
        headers.Authorization = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`
      }

      headResponse = await fetch(url, {
        method: "HEAD",
        headers,
      })

      status = headResponse.status
      statusText = headResponse.statusText
      contentType = headResponse.headers.get("content-type")
      contentLength = headResponse.headers.get("content-length")
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    }

    return NextResponse.json({
      url,
      isValidUrl,
      isTwilioUrl,
      hasTwilioCredentials: !!(accountSid && authToken),
      status,
      statusText,
      contentType,
      contentLength,
      error,
      // Include a test image tag for convenience
      testImageTag: `<img src="/api/image-proxy?url=${encodeURIComponent(url)}" alt="Test image" style="max-width: 300px; max-height: 300px;" />`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error analyzing URL",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
