import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const imageUrl = url.searchParams.get("url")

  if (!imageUrl) {
    return NextResponse.json({ success: false, error: "No image URL provided" }, { status: 400 })
  }

  try {
    // Try to fetch the image headers to check if it exists
    const response = await fetch(imageUrl, { method: "HEAD" })

    if (response.ok) {
      return NextResponse.json({
        success: true,
        exists: true,
        status: response.status,
        contentType: response.headers.get("content-type"),
        contentLength: response.headers.get("content-length"),
      })
    } else {
      return NextResponse.json({
        success: true,
        exists: false,
        status: response.status,
        statusText: response.statusText,
      })
    }
  } catch (error) {
    console.error("Error checking image:", error)
    return NextResponse.json({
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
