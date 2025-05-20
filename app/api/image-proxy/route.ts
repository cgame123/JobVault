import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Get the URL from the query parameters
    const url = req.nextUrl.searchParams.get("url")
    const download = req.nextUrl.searchParams.get("download") === "true"
    const debug = req.nextUrl.searchParams.get("debug") === "true"

    // Log the request for debugging
    console.log("Image proxy request:", { url, download, debug })

    if (!url || url === "None") {
      console.log("No URL provided or URL is 'None'")
      // Return a simple placeholder SVG for missing images
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
        <text x="12" y="9" font-family="sans-serif" font-size="2" text-anchor="middle" fill="currentColor">No Image Available</text>
      </svg>`

      return new NextResponse(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400",
        },
      })
    }

    // Basic URL validation
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch (e) {
      console.error("Invalid URL:", url, e)
      if (debug) {
        return NextResponse.json({ error: "Invalid URL format", url })
      }

      const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
        <text x="12" y="20" font-family="sans-serif" font-size="1.5" text-anchor="middle" fill="#f87171">Invalid URL format</text>
      </svg>`

      return new NextResponse(errorSvg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache",
        },
      })
    }

    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    // Check if this is a Twilio URL
    const isTwilioUrl = url.includes("twilio.com") || url.includes("api.twilio.com")

    console.log("URL analysis:", {
      url,
      isTwilioUrl,
      hasTwilioCredentials: !!(accountSid && authToken),
    })

    // If it's a Twilio URL but we don't have credentials, return an error
    if (isTwilioUrl && (!accountSid || !authToken)) {
      console.error("Twilio credentials missing for Twilio URL")
      if (debug) {
        return NextResponse.json({
          error: "Twilio credentials not configured",
          accountSidExists: !!accountSid,
          authTokenExists: !!authToken,
          url: url,
        })
      }

      // Return an error SVG
      const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
        <text x="12" y="20" font-family="sans-serif" font-size="1.5" text-anchor="middle" fill="#f87171">Twilio credentials missing</text>
      </svg>`

      return new NextResponse(errorSvg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache",
        },
      })
    }

    // Prepare headers for the fetch request
    const headers: HeadersInit = {}

    // Add authentication for Twilio URLs
    if (isTwilioUrl && accountSid && authToken) {
      headers.Authorization = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`
      console.log("Added Twilio authentication headers")
    }

    console.log("Fetching image from URL:", url)

    // Fetch the image with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      // Fetch the image
      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error("Failed to fetch image:", response.status, response.statusText)
        if (debug) {
          return NextResponse.json({
            error: `Failed to fetch image: ${response.status} ${response.statusText}`,
            url: url,
            isTwilioUrl,
          })
        }

        // Return an error SVG
        const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
          <text x="12" y="20" font-family="sans-serif" font-size="1.5" text-anchor="middle" fill="#f87171">Error ${response.status}: ${response.statusText}</text>
        </svg>`

        return new NextResponse(errorSvg, {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "no-cache",
          },
        })
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
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error("Error in image proxy:", error)

    // Return an error SVG
    const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
      <text x="12" y="20" font-family="sans-serif" font-size="1.5" text-anchor="middle" fill="#f87171">Error loading image</text>
    </svg>`

    return new NextResponse(errorSvg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      },
    })
  }
}
